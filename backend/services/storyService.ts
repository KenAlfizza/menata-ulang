import { PuckOutputData } from "../types/puck.ts";
import { StoryPageRecord, StoryRecord } from "../types/story.ts";

export const storyService = {
    /**
     * Builds and returns a complete StoryRecord object using the provided story source data.
     * Expects the `author` relation (selecting `name`) and `page` relation to already be included.
     *
     * @param story - The source object from prisma containing the story properties, author, and page(s).
     * @returns A promise that resolves to the fully constructed StoryRecord.
     */
    async buildStoryRecord(
        story: {
            id: string;
            slug: string;
            title: string;
            description: string;
            createdAt: Date;
            updatedAt: Date | null;
            authorId: number;
            author: { name: string };
            imageUrl: string;
            published: boolean;
            publishedAt: Date | null;
            heartsCount: number;
            threadId: string;
            page: StoryPageRecord;
        }
    ): Promise<StoryRecord> {
        const storyRecord: StoryRecord = {
            id: story.id,
            slug: story.slug,
            title: story.title,
            description: story.description,
            createdAt: story.createdAt,
            updatedAt: story.updatedAt,
            authorId: story.authorId,
            authorName: story.author.name,
            imageUrl: story.imageUrl,
            published: story.published,
            publishedAt: story.publishedAt,
            heartsCount: story.heartsCount,
            threadId: story.threadId,
            page: {
                id: story.page.id,
                puckData: story.page.puckData as PuckOutputData,
            }
        };
        return storyRecord;
    },


    
}