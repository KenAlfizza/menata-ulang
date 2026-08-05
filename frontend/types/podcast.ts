/**
 * Podcast Record model returned by the backend
 */
export type PodcastRecord = {
    id: string,
    slug: string,
    
    title: string,
    description: string,
    transcript: string,
    duration: number,
    
    audioUrl: string | null,
    imageUrl: string | null,

    createdAt: Date,
    updatedAt: Date | null,
    
    published: boolean,
    publishedAt: Date | null,

    host: string,
    threadId: string,

    heartsCount: number,
}

/**
 * Update podcast data similar to the backend update data
 */
export interface UpdatePodcastData {
    title?: string;
    slug?: string;
    description?: string;
    transcript?: string;
    published?: boolean;
    image?: File;
    audio?: File;
}