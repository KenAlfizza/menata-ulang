import { PuckData } from "./puck.ts";

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
    authorId: number,
    image: File | undefined,
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
    puckData: PuckData,
}