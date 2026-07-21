import { StoryRecord } from "../story.ts";
import { PuckInputData } from "../puck.ts";

/** 
 * Author Services data type
 * A shared data type between API and Author Service
 */

// Services response data type
export type AuthorServiceResult<StoryRecord> = 
| { success: true; data: StoryRecord }
| { success: false; 
    error: 
        'SLUG_TAKEN' | 
        'NOT_FOUND' |
        'UNAUTHORIZED' |
        'INTERNAL_ERROR'
  }

// Create story datatype
export interface CreateStoryData extends Pick<
    StoryRecord, 
    'slug'|
    'title'|
    'description'
> {
    image?: File,
};

// Update story datatype
export interface UpdateStoryData extends Partial<Pick<
    StoryRecord,
    'slug'|
    'title'|
    'description'|
    'published'
>> {
    image?: File,
};

// Update story page datatype
export interface UpdateStoryPageData {
    puckData: PuckInputData;
}


/**
 * MyStorySummary: My story items
 * Use this for the "My Stories" list/search endpoints.
 */
export type MyStorySummary = Pick<
    StoryRecord, 
    'id' |
    'title'|
    'description' |
    'updatedAt' |
    'imageUrl' |
    'published' |
    'heartsCount'
>;