import { PodcastRecord } from "./podcast.ts";
import { ResearchRecord } from "./research.ts";
import { StoryRecord } from "./story.ts";

/**
 * Explore story record model optimized for lightweight card feeds
 */
export type ExploreStoryRecord = Pick<
    StoryRecord,
    "slug" | 
    "title" | 
    "description" | 
    "imageUrl" | 
    "publishedAt" |
    "authorName"
>;

/**
 * Explore research record model optimized for lightweight card feeds
 */
export type ExploreResearchRecord = Pick<
    ResearchRecord, 
    "id" | 
    "title" | 
    "description" |
    "imageUrl" | 
    "publishedAt" |
    "researcherName"
>;

/**
 * Explore story record model optimized for lightweight card feeds
 */
export type ExplorePodcastSummary = Pick<
    PodcastRecord, 
    "slug" | 
    "title" | 
    "description" |
    "hostId" |
    "hostName" |
    "imageUrl" | 
    "audioUrl" |
    'duration' |
    "publishedAt" |
    "heartsCount"
>;

/**
 * Explore story record model optimized for lightweight card feeds
 */
export type ExplorePodcastRecord = Pick<
    PodcastRecord, 
    "slug" | 
    "title" | 
    "description" |
    "hostId" |
    "hostName" |
    "imageUrl" | 
    "audioUrl" |
    'duration' |
    "publishedAt" |
    "heartsCount" |
    "transcript"
>;
