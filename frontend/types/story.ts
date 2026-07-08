import { Data } from "@puckeditor/core";

/**
 * `StoryPage` model returned by the backend.
 */
export interface StoryRecord {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    slug: string;
    puckData: Data;
    published: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
    authorId: number;
}
