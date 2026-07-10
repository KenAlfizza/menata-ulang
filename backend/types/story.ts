import { PuckData, StoryPageRecord } from "./storyPage.ts";

export type StoryRecord = {
    id: string,
    slug: string,
    title: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    authorId: number,
    image: File | undefined,
    published: boolean,
    publishedAt: Date,
    heartsCount: number,
    threadId: string,
    page: StoryPageRecord
}

export interface CreateStoryData extends Pick<
    StoryRecord, 
    'slug'|
    'title'|
    'description'|
    'image'
>{
    puckData: PuckData,
};

export interface UpdateStoryData extends Partial<Pick<
    StoryRecord,
    'slug'|
    'title'|
    'description'|
    'image'|
    'published'
>> {
    puckData?: PuckData,
};