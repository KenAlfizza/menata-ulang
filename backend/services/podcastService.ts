import { PodcastRecord } from "../types/podcast.ts";

export const podcastService = {
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
            host: {name: string}
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
            hostName: podcast.host.name,
            hostId: podcast.hostId,
            threadId: podcast.threadId,
            heartsCount: podcast.heartsCount,
        };
        return podcastRecord;
    },
}