import { StoryRecord } from "./story.ts";
import { ResearchRecord } from "./research";
import { PodcastRecord } from "./podcast.ts";

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

/**
 * Workspace story record model optimized for lightweight card feeds
 */
export type WorkspacePodcastRecord = Pick<
    PodcastRecord, 
    "id" | 
    "title" | 
    "description" |
    "host" |
    "imageUrl" | 
    "audioUrl" |
    "published" | 
    "updatedAt"
>;

