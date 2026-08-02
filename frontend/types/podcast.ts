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

    hostId: number,
    threadId: string,

    heartsCount: number,
}