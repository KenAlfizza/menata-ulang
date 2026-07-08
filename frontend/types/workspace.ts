import { ResearchRecord } from "./research";
import { StoryRecord } from "./story.ts";

/**
 * Workspace research record model optimized for lightweight card feeds
 */
export type WorkspaceResearchRecord = Pick<
    ResearchRecord, 
    "id" | 
    "title" | 
    "description" | 
    "published" | 
    "updatedAt"
>;

/**
 * Workspace story record model optimized for lightweight card feeds
 */
export type WorkspaceStoryRecord = Pick<
    StoryRecord,
    "id" | 
    "title" | 
    "description" | 
    "imageUrl" | 
    "published" | 
    "updatedAt"
>;