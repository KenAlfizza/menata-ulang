/**
 * The podcast record data type
 */
export type PodcastRecord = {
    id: string,
    slug: string,
    
    title: string,
    description: string,
    transcript: string,
    duration: number,
    
    audioUrl: string,
    imageUrl: string,

    createdAt: Date,
    updatedAt: Date | null,
    
    published: boolean,
    publishedAt: Date | null,

    hostName: string,
    hostId: number,
    
    threadId: string,

    heartsCount: number,
}

/**
 * Defines the criteria for filtering and paginating podcasts.
 * All fields are optional to allow for flexible, partial filtering.
 */
export interface PodcastFilter {
    published?: boolean;
    search?: string;
    limit: number;
    page: number;
    sort?: "title" | "updatedAt";
    order?: "asc" | "desc";
}
