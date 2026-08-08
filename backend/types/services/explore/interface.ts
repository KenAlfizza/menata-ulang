import { ExploreServiceResult } from "../explore.ts";

import { ExplorePodcast } from "./podcast.ts";
import { ExplorePodcastSummary } from "./podcast.ts";

import { ExploreStory } from "./story.ts";
import { ExploreStorySummary } from "./story.ts";

import { ExploreResearch } from "./research.ts";
import { ExploreResearchSummary } from "./research.ts";


export interface ExplorePaginatedResult<T> {
    /** The paginated slice of data */
    items: T[];
    /** Total count of items available in the database matching the filter */
    total: number;
    /** Current page number */
    page: number;
    /** Number of items returned per page */
    limit: number;
    /** Total number of pages available */
    totalPages: number;
}


export interface ExploreFilter {
    search?: string;
    limit: number;
    page: number;
    sort?: "" | "title" | "updatedAt";
    order?: "asc" | "desc";
}

export interface IExploreService {
    // Explore podcast methods
    get(slug: string): Promise<ExploreServiceResult<
        ExplorePodcast
        | ExploreStory
        | ExploreResearch
    >>;
    getExploreFeed(filter: ExploreFilter): Promise<ExploreServiceResult<ExplorePaginatedResult<
        ExplorePodcastSummary
        | ExploreStorySummary
        | ExploreResearchSummary
    >>>;
}