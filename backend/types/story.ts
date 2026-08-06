import { PuckOutputData } from "./puck.ts";

/**
 * The story record data type
 */
export type StoryRecord = {
    id: string,
    slug: string,
    title: string,
    description: string,
    createdAt: Date,
    updatedAt: Date | null,
    authorName: string,
    authorId: number,
    imageUrl: string,
    published: boolean,
    publishedAt: Date | null,
    heartsCount: number,
    threadId: string,
    page: StoryPageRecord
}

/**
 * The story page data type
 */
export type StoryPageRecord = {
    id: string,
    puckData: PuckOutputData,
}

/**
 * Defines the criteria for filtering and paginating stories.
 * All fields are optional to allow for flexible, partial filtering.
 */
export interface StoryFilter {
    published?: boolean;
    search?: string;
    limit: number;
    page: number;
    sort?: "title" | "updatedAt";
    order?: "asc" | "desc";
}