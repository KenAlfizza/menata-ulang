import { ResearchRecord } from "../research.ts";
import { PuckInputData } from "../puck.ts";

/** 
 * Researcher Services data type
 * A shared data type between API and Researcher Service
 */

// Services response data type
export type ResearcherServiceResult<ResearchRecord> = 
| { success: true; data: ResearchRecord }
| { success: false; 
    error: 
        'SLUG_TAKEN' | 
        'NOT_FOUND' |
        'UNAUTHORIZED' |
        'BAD_REQUEST' |
        'INTERNAL_ERROR'
  }

// Create research datatype
export interface CreateResearchData extends Pick<
    ResearchRecord, 
    'slug'|
    'title'|
    'description'
> {
    image?: File,
};

// Update research datatype
export interface UpdateResearchData extends Partial<Pick<
    ResearchRecord,
    'slug'|
    'title'|
    'description'|
    'published'
>> {
    image?: File,
};

// Update research page datatype
export interface UpdateResearchPageData {
    puckData: PuckInputData;
}


/**
 * MyResearchSummary: My research items
 * Use this for the "My Research" list/search endpoints.
 */
export type MyResearchSummary = Pick<
    ResearchRecord, 
    'id' |
    'title'|
    'description' |
    'updatedAt' |
    'imageUrl' |
    'published' |
    'heartsCount'
>;
