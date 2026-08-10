import { Hono } from "hono";
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { validate } from "../lib/validators/index.ts";
import { exploreParamSchema, exploreQuerySchema } from "../lib/validators/explore.ts";

import { ExploreServiceResult } from "../types/services/explore.ts";

import { ExplorePodcast, ExplorePodcastSummary } from "../types/services/explore/podcast.ts";
import { ExplorePodcastService } from "../services/explore/podcast.ts";

import { ExploreStory, ExploreStorySummary } from "../types/services/explore/story.ts";
import { ExploreStoryService } from "../services/explore/story.ts";

import { ExploreResearch, ExploreResearchSummary } from "../types/services/explore/research.ts";
import { ExploreResearchService } from "../services/explore/research.ts";
import { ExplorePaginatedResult } from "../types/services/explore/interface.ts";

const explore = new Hono();

// Helper function to map internal error codes to HTTP status codes and messages
function handleError(
    error: string,
    defaultStatus: ContentfulStatusCode = 500,
    defaultMessage: string = "An internal server error occurred"
): { status: ContentfulStatusCode; message: string } {
    switch (error) {
        case 'NOT_FOUND':
            return { status: 404, message: "Resource not found" };
        
        case 'UNAUTHORIZED':
            return { status: 401, message: "You are not authorized to access this resource" };
        
        case 'INTERNAL_ERROR':
        default:
            return { status: defaultStatus, message: defaultMessage };
    }
}

/**
 * GET /podcast/popular - Fetch the  popular podcasts
 * Authorization: Public route
 * 
 * Query Params:
 * - page (number), limit (number), search (string), sort (string), order (string)
 * 
 * Responses:
 * - 200: podcast feed payload
 * - 400: validation error
 * - 500: internal server error
 */
explore.get("/podcast/popular",
    async (c) => {
        const exploreService = new ExplorePodcastService();
        const result = await exploreService.getExplorePopular()
        console.log(result);

        if (!result.success) {
            const { status, message } = handleError(result.error);
            return c.json({
                success: false,
                error: {
                    message,
                    code: result.error
                }
            }, status);
        }

        return c.json({ success: true, data: result.data }, 200);
    }
);

/**
 * GET /story/:slug - Fetch a published story by its slug
 * 
 * Middleware: `validate("param", exploreParamSchema)`.
 * Authorization: Public route
 * 
 * Params:
 * - slug : unique slug of the story
 * 
 * Behavior: 
 * - retrieves the story and its associated page data via exploreService
 * 
 * Responses:
 * - 200: story payload
 * - 404: not found
 * - 500: internal server error
 */
explore.get("/story/:slug",
    validate("param", exploreParamSchema), 
    async (c) => {
        const { slug } = c.req.valid("param");

        // Get the story from the service layer
        const exploreService = new ExploreStoryService();
        const result: ExploreServiceResult<ExploreStory> = await exploreService.get(slug);
        console.log(exploreService)

        if (!result.success) {
            const { status, message } = handleError(result.error);
            return c.json({
                success: false,
                error: {
                    message,
                    code: result.error
                }
            }, status);
        }

        return c.json({ success: true, data: result.data.puckData }, 200);
    }
);

/**
 * GET /research/:slug - Fetch a published research by its slug
 * 
 * Middleware: `validate("param", exploreParamSchema)`.
 * Authorization: Public route
 * 
 * Params:
 * - slug : unique slug of the research
 * 
 * Behavior: 
 * - retrieves the research and its associated page data via exploreService
 * 
 * Responses:
 * - 200: research payload
 * - 404: not found
 * - 500: internal server error
 */
explore.get("/research/:slug",
    validate("param", exploreParamSchema), 
    async (c) => {
        const { slug } = c.req.valid("param");

        // Get the research from the service layer
        const exploreService = new ExploreResearchService();
        const result: ExploreServiceResult<ExploreResearch> = await exploreService.get(slug);
        console.log(exploreService)

        if (!result.success) {
            const { status, message } = handleError(result.error);
            return c.json({
                success: false,
                error: {
                    message,
                    code: result.error
                }
            }, status);
        }

        return c.json({ success: true, data: result.data.puckData }, 200);
    }
);

/**
 * GET /podcast/:slug - Fetch a published podcast by its slug
 * 
 * Middleware: `validate("param", exploreParamSchema)`.
 * Authorization: Public route
 * 
 * Params:
 * - slug : unique slug of the podcast
 * 
 * Behavior: 
 * - retrieves the podcast and its associated page data via exploreService
 * 
 * Responses:
 * - 200: podcast payload
 * - 404: not found
 * - 500: internal server error
 */
explore.get("/podcast/:slug",
    validate("param", exploreParamSchema), 
    async (c) => {
        const { slug } = c.req.valid("param");

        // Get the podcast from the service layer
        const exploreService = new ExplorePodcastService();
        const result: ExploreServiceResult<ExplorePodcast> = await exploreService.get(slug);
        console.log(result)

        if (!result.success) {
            const { status, message } = handleError(result.error);
            return c.json({
                success: false,
                error: {
                    message,
                    code: result.error
                }
            }, status);
        }

        return c.json({ success: true, data: result.data }, 200);
    }
);

/**
 * GET /podcast - Fetch the explore feed for podcasts with pagination and search
 * 
 * Middleware: `validate("query", exploreQuerySchema)`
 * Authorization: Public route
 * 
 * Query Params:
 * - page (number), limit (number), search (string), sort (string), order (string)
 * 
 * Responses:
 * - 200: podcast feed payload
 * - 400: validation error
 * - 500: internal server error
 */
explore.get("/podcast",
    validate("query", exploreQuerySchema),
    async (c) => {
        const { page, limit, search, sort, order } = c.req.valid("query");

        const exploreService = new ExplorePodcastService();
        const result = await exploreService.getExploreFeed({
            search,
            limit: limit ?? 10,
            page: page ?? 1,
            sort,
            order
        });
        console.log(result);

        if (!result.success) {
            const { status, message } = handleError(result.error);
            return c.json({
                success: false,
                error: {
                    message,
                    code: result.error
                }
            }, status);
        }

        return c.json({ success: true, ...result.data }, 200);
    }
);


/**
 * GET /story - Fetch the explore feed for stories with pagination and search
 * 
 * Middleware: `validate("query", exploreQuerySchema)`
 * Authorization: Public route
 * 
 * Query Params:
 * - page (number), limit (number), search (string), sort (string), order (string)
 * 
 * Responses:
 * - 200: story feed payload
 * - 400: validation error
 * - 500: internal server error
 */
explore.get("/story",
    validate("query", exploreQuerySchema),
    async (c) => {
        const { page, limit, search, sort, order } = c.req.valid("query");

        const exploreService = new ExploreStoryService();
        const result = await exploreService.getExploreFeed({
            search,
            limit: limit ?? 10,
            page: page ?? 1,
            sort,
            order
        });
        console.log(exploreService);

        if (!result.success) {
            const { status, message } = handleError(result.error);
            return c.json({
                success: false,
                error: {
                    message,
                    code: result.error
                }
            }, status);
        }

        return c.json({ success: true, ...result.data }, 200);
    }
);

/**
 * GET /research - Fetch the explore feed for research with pagination and search
 * 
 * Middleware: `validate("query", exploreQuerySchema)` (or your specific query schema)
 * Authorization: Public route
 * 
 * Query Params:
 * - page (number), limit (number), search (string), sort (string), order (string)
 * 
 * Responses:
 * - 200: research feed payload
 * - 400: validation error
 * - 500: internal server error
 */
explore.get("/research",
    validate("query", exploreQuerySchema),
    async (c) => {
        const { page, limit, search, sort, order } = c.req.valid("query");
        
        const exploreService = new ExploreResearchService();
        const result = await exploreService.getExploreFeed({
            search,
            limit: limit ?? 10,
            page: page ?? 1,
            sort,
            order
        });

        if (!result.success) {
            const { status, message } = handleError(result.error);
            return c.json({
                success: false,
                error: {
                    message,
                    code: result.error
                }
            }, status);
        }

        return c.json({ success: true, ...result.data }, 200);
    }
);
export default explore;