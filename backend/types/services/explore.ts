import { PodcastRecord } from "../podcast.ts";
import { ResearchPageRecord, ResearchRecord } from "../research.ts";
import { StoryRecord, StoryPageRecord } from "../story.ts";

export type ExploreServiceResult<T> = 
| { success: true; data: T }
| { success: false;
    error: 
        | 'NOT_FOUND' 
        | 'BAD_REQUEST' 
        | 'INTERNAL_ERROR'
  }

export type ExploreStory = Pick<
    StoryPageRecord,
    'puckData'
>;

export type ExploreStorySummary = Pick<
    StoryRecord,
    | 'slug' 
    | 'title' 
    | 'authorName' 
    | 'description' 
    | 'publishedAt' 
    | 'imageUrl' 
    | 'heartsCount'
>;


export type ExploreResearch = Pick<
    ResearchPageRecord,
    'puckData'
>;

export type ExploreResearchSummary = Pick<
    ResearchRecord,
    | 'slug' 
    | 'title' 
    | 'researcherName' 
    | 'description' 
    | 'publishedAt' 
    | 'imageUrl' 
    | 'heartsCount'
>;


export type ExplorePodcast = Pick<
    PodcastRecord,
    | 'slug'
    | 'title'
    | 'description'
    | 'transcript'
    | 'duration'

    | 'audioUrl'
    | 'imageUrl'

    | 'hostName'
    | 'hostId'
    
    | 'threadId'
    | 'heartsCount'

>;

export type ExplorePodcastSummary = Pick<
    PodcastRecord,
    | 'slug' 
    | 'title' 
    | 'description'

    | 'hostName'
    | 'hostId' 

    | 'imageUrl' 
    | 'audioUrl'

    | 'publishedAt' 
    | 'heartsCount'
>;