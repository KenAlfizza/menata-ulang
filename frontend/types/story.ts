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
    createdAt: Date | string;
    updatedAt: Date | string;
    authorId: number;
    page: StoryPageRecord;
}
