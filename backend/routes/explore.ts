import { Hono } from "hono";
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { validate } from "../lib/validators/index.ts";
import { exploreParamSchema } from "../lib/validators/explore.ts";
import { ExplorePodcast, ExploreResearch, ExploreServiceResult, ExploreStory } from "../types/services/explore.ts";
import { exploreService } from "../services/exploreService.ts";

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
        const result: ExploreServiceResult<ExploreStory> = await exploreService.getStory(slug);
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
        const result: ExploreServiceResult<ExploreResearch> = await exploreService.getResearch(slug);
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
        const result: ExploreServiceResult<ExplorePodcast> = await exploreService.getPodcast(slug);
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

export default explore;