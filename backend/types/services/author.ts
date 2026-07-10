import { StoryRecord } from "../story.ts";
import { PuckData } from "../puck.ts";
import { StatusCode } from 'hono/utils/http-status';

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
        'INTERNAL_ERROR'
  }

// Create story datatype
export type CreateStoryData = Pick<
    StoryRecord, 
    'slug'|
    'title'|
    'description'|
    'image'
>

// Update story datatype
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