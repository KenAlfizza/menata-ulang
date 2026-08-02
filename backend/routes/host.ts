import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Validators
import { validate } from "../lib/validators/index.ts";
import { 
    podcastPostSchema, 
    podcastGetListSchema, 
    podcastGetByIdSchema,
    podcastPatchParamSchema,
    podcastPatchFormSchema,
    podcastDeleteParamSchema
} from "../lib/validators/host.ts";
import { authMiddleware } from "../middleware/auth.ts";
import { hostService } from "../services/hostService.ts";
import { HostServiceResult } from "../types/services/host.ts";
import { PodcastRecord } from "../types/podcast.ts";

const host = new Hono<{ Variables: AppVariables}>();

/**
 * POST / - Upload a new podcast
 * 
 * Middleware: `authMiddleware`, `validate("form", podcastPostSchema)`.
 * Autorization: users with role `HOST` or `SUPERUSER` may upload a podcast
 * 
 * Form:
 * - title      : podcast title
 * - description: podcast description
 * - file       : podcast audio file
 * - image      : podcast cover file
 * 
 * Behavior: 
 * - checks slug availability
 * - uploads the provided file and image
 * - creates the podcast with the current user as host via hostService
 * 
 * Responses:
 * - 200: podcast payload
 * - 400: bad request / slug taken
 * - 403: forbidden
 * - 500: internal server error
 */
host.post("/podcast",
    authMiddleware,
    validate("form", podcastPostSchema),
    async (c) => {
        // Validate current user permission
        const user = c.get("user");
        if (!["HOST", "SUPERUSER"].includes(user.role)) {
            return c.json({ error: "Forbidden" }, 403);
        }

        // Get the podcast elements from validated form
        const createPodcastData = c.req.valid("form");

        // Call the service layer to handle creation, file storage, and business logic
        const result : HostServiceResult<PodcastRecord> 
            = await hostService.createPodcast(user.id, createPodcastData);

        if (!result.success) {
            const status = result.error === 'SLUG_TAKEN' ? 409 : 500;
            return c.json({ 
            success: false, 
            error: { 
                message: result.error === 'SLUG_TAKEN' ? "Slug is taken" : "Internal error",
                code: result.error 
            } 
            }, status);
        }

        return c.json({ success: true, story: result.data }, 201);
    }
);

/**
 * GET /podcast/:id - Retrieve a single podcast by ID
 * 
 * Middleware: `authMiddleware` (Optional for public, but included per your pattern), `validate("query", podcastQuerySchema)` (Optional).
 * Autorization: `HOST` or `SUPERUSER` to access their own podcasts, or `PUBLIC` for general browsing.
 * 
 * Path Parameters:
 * - id        : UUID of the podcast to retrieve
 * 
 * Query Parameters:
 * - slug      : Optional filter to find podcast by slug
 * 
 * Behavior: 
 * - checks if podcast exists
 * - returns the fully constructed PodcastRecord via hostService
 * 
 * Responses:
 * - 200: podcast payload
 * - 404: not found
 * - 400: bad request / invalid ID
 * - 500: internal server error
 */
host.get("/podcast/:id",
    authMiddleware,
    validate("param", podcastGetByIdSchema), 
    async (c) => {
        const { id } = c.req.valid("param");

        // Get the podcast from the service layer
        const result : HostServiceResult<PodcastRecord> 
            = await hostService.getPodcastById(id);

        if (!result.success) {
            const status = result.error === 'NOT_FOUND' ? 404 : 500;
            return c.json({ 
            success: false, 
            error: { 
                message: result.error === 'NOT_FOUND' ? "Podcast not found" : "Internal error",
                code: result.error 
            } 
            }, status);
        }

        return c.json({ success: true, podcast: result.data }, 200);
    }
);

export default host;