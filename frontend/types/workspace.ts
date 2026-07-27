import { StoryRecord } from "./story.ts";
import { ResearchRecord } from "./research";

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

/**
 * Workspace research record model optimized for lightweight card feeds
 */
export type WorkspaceResearchRecord = Pick<
    ResearchRecord, 
    "id" | 
    "title" | 
    "description" |
    "imageUrl" | 
    "published" | 
    "updatedAt"
>;
