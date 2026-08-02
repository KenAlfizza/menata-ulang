import { prisma } from "../lib/prisma.ts";
import { storage } from "../lib/storage.ts";
import { PodcastRecord } from "../types/podcast.ts";
import { CreatePodcastData, HostServiceResult } from "../types/services/host.ts";
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
    }
}