import { Hono } from "hono";
import type { AppVariables } from "../types.ts";
import type { ContentfulStatusCode } from 'hono/utils/http-status';

// Validators
import { validate } from "../lib/validators/index.ts";
import { 
    podcastPostSchema, 
    podcastGetByIdSchema,
    podcastPatchParamSchema,
    podcastPatchFormSchema,
    podcastDeleteParamSchema,
    podcastListQuerySchema
} from "../lib/validators/host.ts";
import { authMiddleware } from "../middleware/auth.ts";
import { hostService } from "../services/hostService.ts";
import { HostServiceResult, UpdatePodcastData } from "../types/services/host.ts";
import { PodcastFilter, PodcastRecord } from "../types/podcast.ts";

// Helper function to map internal error codes to HTTP status codes and messages
function handleError(
    error: string,
    defaultStatus: ContentfulStatusCode = 500,
    defaultMessage: string = "An internal server error occurred"
): { status: ContentfulStatusCode; message: string } {
    switch (error) {
        case 'NOT_FOUND':
            return { status: 404, message: "Podcast not found" };
        
        case 'UNAUTHORIZED':
            return { status: 401, message: "You are not authorized to update this podcast" };
        
        case 'SLUG_TAKEN':
            return { status: 400, message: "This custom link (slug) is already in use" };
        
        case 'INTERNAL_ERROR':
        default:
            return { status: defaultStatus, message: defaultMessage };
    }
}

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

        return c.json({ success: true, podcast: result.data }, 201);
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

/**
 * GET /my-podcasts/recent - Retrieve the 3 most recently updated podcasts for the current host
 * 
 * Middleware: `authMiddleware`, `validate("query", podcastListQuerySchema)`
 * Authorization: `HOST` or `SUPERUSER`
 * 
 * Responses:
 * - 200: recent podcast list payload
 * - 403: forbidden
 * - 500: internal server error
 */
host.get("/my-podcasts/recent",
    authMiddleware,
    async (c) => {
        // Validate user role
        const user = c.get("user");
        if (!user || !["HOST", "SUPERUSER"].includes(user.role)) {
            return c.json({
                success: false,
                error: {
                    message: "Forbidden",
                    code: "FORBIDDEN"
                }
            }, 403);
        }

        // Call the service layer to fetch the recent podcasts
        const result = await hostService.getRecentPodcasts(user.id);

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
 * GET /my-podcasts - Retrieve a paginated list of the current host's podcasts
 * 
 * Middleware: `authMiddleware`, `validate("query", podcastListQuerySchema)`
 * Authorization: `HOST` or `SUPERUSER`
 * 
 * Query Parameters:
 * - search    : string (optional) - Filter by title
 * - published : boolean (optional) - Filter by publication status
 * - sort      : "title" | "updatedAt" (optional) - Sort field
 * - order     : "asc" | "desc" (optional) - Sort direction
 * - page      : number (optional) - Page number
 * - limit     : number (optional) - Items per page
 * 
 * Responses:
 * - 200: paginated podcast list payload
 * - 403: forbidden
 * - 500: internal server error
 */
host.get("/my-podcasts",
    authMiddleware,
    validate("query", podcastListQuerySchema),
    async (c) => {
        // Validate user role
        const user = c.get("user");
        if (!user || !["HOST", "SUPERUSER"].includes(user.role)) {
            return c.json({
                success: false,
                error: {
                    message: "Forbidden",
                    code: "FORBIDDEN"
                }
            }, 403);
        }

        // Get validated query filter parameters
        const filter = c.req.valid("query") as PodcastFilter;

        // Call the service layer to fetch the paginated list
        const result = await hostService.getMyPodcasts(user.id, filter);

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
 * PATCH /podcast/:id - Update an existing podcast
 * 
 * Middleware: `authMiddleware`, `validate("param", podcastPatchParamSchema)`, `validate("form", podcastPatchFormSchema)`
 * Authorization: `HOST` (owner) or `SUPERUSER`
 * 
 * Path Parameters:
 * - id : UUID of the podcast to update
 * 
 * Form:
 * - title        : string (Optional)
 * - description  : string (Optional)
 * - slug         : string (Optional)
 * - transcript   : string (Optional)
 * - audio        : File (Optional)
 * - image        : File (Optional)
 */
host.patch("/podcast/:id",
    authMiddleware,
    validate("param", podcastPatchParamSchema),
    validate("form", podcastPatchFormSchema),
    async (c) => {
        // Validate User Role
        const user = c.get("user");
        if (!user || !["HOST", "SUPERUSER"].includes(user.role)) {
            return c.json({
                success: false,
                error: {
                    message: "Forbidden",
                    code: "FORBIDDEN"
                }
            }, 403);
        }

        // Get validated parameters and form data
        const { id } = c.req.valid("param");
        const updateData: UpdatePodcastData = c.req.valid("form");

        // all the service layer to handle updates, file replacements, and ownership checks
        const result: HostServiceResult<PodcastRecord> = await hostService.updatePodcast(user.id, id, updateData);

        // Handle Service Response
        if (!result.success) {
            const { status, message } = handleError(result.error);
            
            return c.json({ 
                success: false, 
                error: { 
                    message: message,
                    code: result.error 
                } 
            }, status);
        }

        return c.json({ success: true, podcast: result.data }, 200);
    }
);

/**
 * DELETE /podcast/:id - Delete a podcast (Soft Delete)
 * 
 * Middleware: `authMiddleware`, `validate("param", podcastDeleteParamSchema)`
 * Authorization: `HOST` (owner) or `SUPERUSER`
 * 
 * Path Parameters:
 * - id : UUID of the podcast to delete
 * 
 * Behavior: 
 * - Checks ownership (only the host can delete their own podcast)
 * - Soft-deletes the record (sets published: false, deletedAt: now)
 * - Removes associated audio and image files from storage
 * 
 * Responses:
 * - 200: success (no data returned)
 * - 404: not found
 * - 401: unauthorized (not the owner)
 * - 500: internal server error
 */
host.delete("/podcast/:id",
    authMiddleware,
    validate("param", podcastDeleteParamSchema),
    async (c) => {
        // Get the podcast ID from the path parameter
        const { id } = c.req.valid("param");

        // Get the user from the auth middleware
        const user = c.get("user");
        
        // Validate user role
        if (!user || !["HOST", "SUPERUSER"].includes(user.role)) {
            return c.json({
                success: false,
                error: {
                    message: "Forbidden",
                    code: "FORBIDDEN"
                }
            }, 403);
        }

        // Call the service layer to handle soft deletion, file cleanup, and checks
        const result: HostServiceResult<void> = await hostService.deletePodcast(user.id, id);

        // Handle Service Response
        if (!result.success) {
            const { status, message } = handleError(result.error);
            
            return c.json({ 
                success: false, 
                error: { 
                    message: message,
                    code: result.error 
                } 
            }, status);
        }

        // Return success response (no data payload)
        return c.json({ success: true }, 200);
    }
);


export default host;