import { prisma } from "../lib/prisma.ts";
import { storage } from "../lib/storage.ts";
import { PodcastFilter, PodcastRecord } from "../types/podcast.ts";
import { MyPodcastSummary } from "../types/services/host.ts";
import { CreatePodcastData, HostServiceResult, UpdatePodcastData } from "../types/services/host.ts";
import { getAudioDuration } from "../services/audio.ts";
import { PaginatedResult } from "../types/common.ts";
import { podcastService } from "./podcastService.ts";

export const hostService = {
    /**
     * Checks if the slug is available to use
     * @param slug - the slug to be checked
     * @returns Promise<boolean> a promise that resolves to:
     * - `true` if the slug is available
     * - `false` if the slug is already in use
     */
    async checkSlugAvailable(
        slug: string
    ) : Promise<boolean> 
    {
        const podcast =  await prisma.podcast.findUnique({
            where: { slug },
            select: { id: true }
        })
        return podcast ? false : true
    },

    /**
     * Builds and returns a concise PodcastSummaryRecord object using the provided podcast source data.
     * 
     * @param podcast - The source object from prisma containing the podcast summary properties.
     * @returns A promise that resolves to the fully constructed PodcastSummaryRecord.
     */
    async buildPodcastSummaryRecord(
        podcast: {
            id: string;
            title: string;
            description: string;
            imageUrl: string;
            audioUrl: string;
            duration: number;
            updatedAt: Date | null;
            published: boolean;
            heartsCount: number;
        }
    ): Promise<MyPodcastSummary> {
        const summaryRecord: MyPodcastSummary = {
            id: podcast.id,
            title: podcast.title,
            description: podcast.description,
            imageUrl: podcast.imageUrl,
            audioUrl: podcast.audioUrl,
            updatedAt: podcast.updatedAt,
            published: podcast.published,
            heartsCount: podcast.heartsCount,
        };
        return summaryRecord;
    },

    /**
     * Creates a new podcast record for a user, handling slug validation, file uploads,
     * audio duration calculation, and database persistence within a transaction.
     * 
     * @param userId - The identifier of the host user creating the podcast.
     * @param createPodcastData - The payload containing podcast details, transcript, and files.
     * @returns A promise resolving to a service result containing the created PodcastRecord or an error string.
     */
    async createPodcast(
        userId: number,
        createPodcastData: CreatePodcastData
    ) : Promise<HostServiceResult<PodcastRecord>>
    {
        try {
            const { slug, title, description, transcript, image, audio } = createPodcastData;

            // Check if slug is available
            if (!await this.checkSlugAvailable(slug)) {
                return { success: false, error: 'SLUG_TAKEN'};
            }

            // Store image and audio
            let imageUrl: string | undefined;
            if (image) imageUrl = await storage.save(image, "podcasts");
            
            let audioUrl: string | undefined;
            if (audio) audioUrl = await storage.save(audio, "podcasts");

            // Get the audio duration
            let duration = 0
            if (audioUrl) duration = await getAudioDuration(audioUrl);

            const podcast = await prisma.$transaction(async (tx) => {
                const thread = await tx.thread.create({ data: {} });

                const podcast = await tx.podcast.create({
                    data: {
                        title: title,
                        slug: slug,
                        
                        description: description,
                        transcript: transcript,
                        duration: duration,


                        imageUrl: imageUrl || "",
                        audioUrl: audioUrl || "",

                        hostId: userId,
                        threadId: thread.id,
                    },
                    include: { host: {select: {name: true}}}
                });

                return podcast
            })

            return {
                success: true,
                data: await podcastService.buildPodcastRecord(podcast)
            };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Retrieves a single podcast record based on its ID.
     * 
     * @param id - The unique identifier of the podcast to retrieve.
     * @returns A promise resolving to a service result containing the PodcastRecord or API error
     */
    async getPodcastById(id: string) : Promise<HostServiceResult<PodcastRecord>> {
        try {
            const podcast = await prisma.podcast.findUnique({
                where: { id },
                include: { host: {select: {name: true}}}
            });

            if (!podcast) {
                return { success: false, error: 'NOT_FOUND' };
            }

            const podcastRecord = await podcastService.buildPodcastRecord(podcast);

            return {
                success: true,
                data: podcastRecord
            };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Retrieves a paginated list of podcasts for a host with optional search and filtering.
     * 
     * @param userId - The identifier of the host user.
     * @param filter - The filtering, pagination, and sorting criteria.
     * @returns A promise resolving to a service result containing paginated podcast summaries or an error string.
     */
    async getMyPodcasts(
        userId: number,
        filter: PodcastFilter
    ): Promise<HostServiceResult<PaginatedResult<MyPodcastSummary>>> {
        try {
            const { search, published, limit, page, sort = 'updatedAt', order = 'desc' } = filter;
            const skip = (page - 1) * limit;

            const where = {
                hostId: userId,
                ...(published !== undefined && { published }),
                ...(search && { title: { contains: search, mode: 'insensitive' as const } })
            };

            const [podcasts, total] = await prisma.$transaction([
                prisma.podcast.findMany({
                    where,
                    take: limit,
                    skip,
                    orderBy: { [sort]: order },
                    include: { host: {select: {name: true}}}
                }),
                prisma.podcast.count({ where })
            ]);

            const items: MyPodcastSummary[] = await Promise.all(
                podcasts.map(podcast => podcastService.buildPodcastRecord(podcast))
            );

            return { 
                success: true, 
                data: { 
                    items, 
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                } 
            };
        } catch (error) {
            console.error("Fetch Podcasts Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Retrieves the 3 most recently updated podcasts for a given host.
     * 
     * @param userId - The identifier of the host user.
     * @returns A promise resolving to a service result containing podcast summaries or an error string.
     */
    async getRecentPodcasts(userId: number): Promise<HostServiceResult<PaginatedResult<MyPodcastSummary>>> {
        try {
            // Fetch the 3 most recent podcasts for the host and the total count of their podcasts
            const podcasts = await prisma.podcast.findMany({
                where: { hostId: userId },
                orderBy: { updatedAt: 'desc' },
                take: 3
            });
        
            const items: MyPodcastSummary[] = await Promise.all(
                podcasts.map(podcast => this.buildPodcastSummaryRecord(podcast))
            );

            return {
                success: true,
                data: {
                    items,
                    total: 3,
                    page: 0,
                    limit: 0,
                    totalPages: 0
                }
            };
        } catch (error) {
            console.error("Fetch Recent Podcasts Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Updates an existing podcast record based on the provided data.
     * Handles slug validation, file storage, duration calculation, and database updates.
     * Ensures the requesting user has permission to update the podcast.
     * 
     * @param userId - The identifier of the host user updating the podcast.
     * @param podcastId - The ID of the podcast to update.
     * @param updatePodcastData - The payload containing podcast details and files.
     * @returns A promise resolving to a service result containing the updated PodcastRecord or an error string.
     */
    async updatePodcast(
        userId: number,
        podcastId: string,
        updatePodcastData: UpdatePodcastData
    ) : Promise<HostServiceResult<PodcastRecord>> {
        try {
            const { slug, title, description, transcript, published } = updatePodcastData;
            const { audio, image } = updatePodcastData;

            // Check if slug is available
            if (slug && (!await this.checkSlugAvailable(slug))) {
                return { success: false, error: 'SLUG_TAKEN' };
            }

            // Retrieve current podcast data
            const currentPodcast = await prisma.podcast.findUnique({
                where: { id: podcastId },
                select: { 
                    hostId: true, 
                    updatedAt: true, 
                    published: true, 
                    publishedAt: true,
                    imageUrl: true,
                    audioUrl: true
                }
            });

            if (!currentPodcast) {
                return { success: false, error: 'NOT_FOUND' };
            }

            // PREMISSION CHECK (Ownership)
            if (currentPodcast.hostId !== userId) {
                return { success: false, error: 'UNAUTHORIZED' };
            }

            // Handle File Uploads
            let imageUrl: string | undefined;
            if (image) {
                if (currentPodcast.imageUrl) await storage.delete(currentPodcast.imageUrl)
                imageUrl = await storage.save(image, "podcasts");
            }

            let audioUrl: string | undefined;
            let duration = 0;
            
            if (audio) {
                if (currentPodcast.audioUrl) await storage.delete(currentPodcast.audioUrl)
                audioUrl = await storage.save(audio, "podcasts");
                duration = await getAudioDuration(audioUrl);
            } else {
                // Fetch existing duration if no new audio
                const existing = await prisma.podcast.findUnique({
                    where: { id: podcastId },
                    select: { duration: true }
                });
                if (existing) {
                    duration = existing.duration;
                }
            }

            // Execute Transaction Update
            const updatedPodcast = await prisma.$transaction(async (tx) => {
                return await tx.podcast.update({
                    where: { id: podcastId },
                    data: {
                        title: title,
                        slug: slug,
                        description: description,
                        transcript: transcript,
                        duration: duration,
                        published: published,
                        updatedAt: new Date(), // Optional: explicitly update timestamp
                        imageUrl: imageUrl ? { set: imageUrl } : undefined,
                        audioUrl: audioUrl ? { set: audioUrl } : undefined,
                    },
                    include: { host: {select: {name: true}}}
                });
            });

            // Build and Return Result
            const podcastRecord = await podcastService.buildPodcastRecord(updatedPodcast);

            return {
                success: true,
                data: podcastRecord
            };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Deletes a podcast record based on the provided ID.
     * 
     * This method:
     * 1. Checks if the podcast exists.
     * 2. Verifies that the requesting user owns the podcast (ownership check).
     * 3. Removes the audio and image files from storage if they exist.
     * 4. Deletes the podcast record from the database.
     * 
     * @param userId - The identifier of the host user performing the deletion.
     * @param podcastId - The ID of the podcast to delete.
     * @returns A promise resolving to a service result containing success/failure status and error message.
     */
    async deletePodcast(
        userId: number,
        podcastId: string
    ) : Promise<HostServiceResult<void>> { // Returns void as nothing is returned upon deletion
        try {
            // Retrieve current podcast data to check ownership and existing media
            const currentPodcast = await prisma.podcast.findUnique({
                where: { id: podcastId },
                select: { 
                    hostId: true, 
                    imageUrl: true, 
                    audioUrl: true
                }
            });

            // Check if podcast exists
            if (!currentPodcast) {
                return { success: false, error: 'NOT_FOUND' };
            }

            // PREMISSION CHECK (Ownership)
            if (currentPodcast.hostId !== userId) {
                return { success: false, error: 'UNAUTHORIZED' };
            }

            // Clean up storage (Delete image and audio if they exist)
            if (currentPodcast.imageUrl) {
                await storage.delete(currentPodcast.imageUrl);
            }

            if (currentPodcast.audioUrl) {
                await storage.delete(currentPodcast.audioUrl);
            }

            // Delete the record from the database
            await prisma.podcast.delete({
                where: { id: podcastId }
            });

            return {
                success: true,
            };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

}