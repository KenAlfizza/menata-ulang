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
    puckData?: PuckData,
};