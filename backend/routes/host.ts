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
} from "../lib/validators/podcast.ts";
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
            if (result.error === 'SLUG_TAKEN') {
                return c.json({ error: "Slug is already taken" }, 400);
            }
            return c.json({ error: "Internal server error" }, 500);
        }

        return c.json({ message: "Podcast created", ok: true, podcast: result.data });
    }
);

export default host;