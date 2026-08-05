import { StoryPageRecord } from "./page.ts";

/**
 * `StoryRecord` model returned by the backend.
 */
export interface StoryRecord {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    slug: string;
    published: boolean;
    publishedAt: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
    authorId: number;
    page: StoryPageRecord;
}

/**
 * Update story data similar to the backend update data
 */
export interface UpdateStoryData {
    title?: string;
    description?: string;
    slug?: string;
    image?: File;
    published?: boolean;

}