import { prisma } from "../lib/prisma.ts";
import { storage } from "../lib/storage.ts";
import { PodcastRecord } from "../types/podcast.ts";
import { CreatePodcastData, HostServiceResult, UpdatePodcastData } from "../types/services/host.ts";
import { getAudioDuration } from "../services/audio.ts";

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
     * Builds and returns a complete PodcastRecord object using the provided podcast source data.
     * 
     * @param podcast - The source object from prisma containing the podcast properties.
     * @returns A promise that resolves to the fully constructed PodcastRecord.
     */
    async buildPodcastRecord(
        podcast: {
            id: string;
            slug: string;
            title: string;
            description: string;
            transcript: string;
            duration: number;
            audioUrl: string;
            imageUrl: string;
            createdAt: Date;
            updatedAt: Date | null;
            published: boolean;
            publishedAt: Date | null;
            hostId: number;
            threadId: string;
            heartsCount: number;
        }
    ) : Promise<PodcastRecord>
    {
        const podcastRecord: PodcastRecord = {
            id: podcast.id,
            slug: podcast.slug,
            title: podcast.title,
            description: podcast.description,
            transcript: podcast.transcript,
            duration: podcast.duration,
            audioUrl: podcast.audioUrl,
            imageUrl: podcast.imageUrl,
            createdAt: podcast.createdAt,
            updatedAt: podcast.updatedAt,
            published: podcast.published,
            publishedAt: podcast.publishedAt,
            hostId: podcast.hostId,
            threadId: podcast.threadId,
            heartsCount: podcast.heartsCount,
        };
        return podcastRecord;
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
                    }
                });

                return podcast
            })

            return {
                success: true,
                data: await this.buildPodcastRecord(podcast)
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
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    description: true,
                    transcript: true,
                    duration: true,
                    audioUrl: true,
                    imageUrl: true,
                    createdAt: true,
                    updatedAt: true,
                    published: true,
                    publishedAt: true,
                    hostId: true,
                    threadId: true,
                    heartsCount: true,
                }
            });

            if (!podcast) {
                return { success: false, error: 'NOT_FOUND' };
            }

            const podcastRecord = await this.buildPodcastRecord(podcast);

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
                await storage.delete(currentPodcast.imageUrl)
                imageUrl = await storage.save(image, "podcasts");
            }

            let audioUrl: string | undefined;
            let duration = 0;
            
            if (audio) {
                await storage.delete(currentPodcast.audioUrl)
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
                });
            });

            // Build and Return Result
            const podcastRecord = await this.buildPodcastRecord(updatedPodcast);

            return {
                success: true,
                data: podcastRecord
            };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },
}