import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { authMiddleware } from "../middleware/auth.ts";

import { validate } from "../lib/validators/index.ts";
import { storyCreateSchema, storyListQuerySchema, storyParamsSchema, storyPatchSchema } from "../lib/validators/author.ts";
import { authorService } from "../services/authorService.ts";
import { CreateStoryData, UpdateStoryData } from "../types/services/author.ts";

const author = new Hono<{ Variables: AppVariables }>();

/**
 * POST /story - Create a new story page entry
 * 
 * Middleware: `authMiddleware`, `validate("form", storyCreateSchema)`.
 * Behaviour: Creates a new story page entry for the authenticated author workspace. Verifies user role (AUTHOR/SUPERUSER) before creation.
 * 
 * Request Body (Validated):
 * - title (string, required)
 * - slug (string, required)
 * - description (string, optional)
 * - image (File, optional)
 * 
 * Responses:
 * - 201: success
 * - 400: bad request (e.g., duplicate slug)
 * - 401: unauthorized
 * - 403: forbidden
 * - 500: internal server error
 */
author.post("/story", authMiddleware, validate("form", storyCreateSchema), async (c) => {
    const { id: userId, role } = c.get("user");
    if (role !== "AUTHOR" && role !== "SUPERUSER") return c.json({ error: "Forbidden" }, 403);

    const formData = c.req.valid("form");
    const createStoryData: CreateStoryData = {
        slug: formData.slug,
        title: formData.title,
        description: formData.description,
        image: formData.image,
    };

    const result = await authorService.createStory(userId, createStoryData);
    if (!result.success) {
        if (result.error == 'SLUG_TAKEN') {
            return c.json({error: "The provided slug is already taken"}, 409)
        }
        return c.json({ error: "Internal Server Error"}, 500)
    }
    return c.json({ message: "Story created successfully", ok: true, story: result.data}, 201);
});

/**
 * GET /story/:id
 * Retrieves a single story record by its unique identifier.
 * Description: Fetches the story and its associated page data. Validates that the requesting user owns the story before returning it.
 * Authentication: Required (authMiddleware).
 * 
 * Parameters:
 * - id (string): The UUID of the story to retrieve.
 * 
 * Responses:
 * - 200 OK: Returns the requested story object.
 * - 403 Forbidden: Returned if the authenticated user is not the owner of the story.
 * - 404 Not Found: The requested story does not exist.
 * - 500 Internal Server Error: Unexpected database or system error.
 */
author.get("/story/:id", authMiddleware, validate("param", storyParamsSchema), async (c) => {
    const { id: userId } = c.get("user");
    const storyId = c.req.valid("param").id;

    const result = await authorService.getStoryById(storyId, userId);

    if (!result.success) {
        if (result.error === 'NOT_FOUND') return c.json({ error: "Story not found" }, 404);
        if (result.error === 'UNAUTHORIZED') return c.json({ error: "Forbidden" }, 403);
        return c.json({ error: "Internal Server Error" }, 500);
    }

    return c.json({ success: true, story: result.data }, 200);
});

/**
 * PATCH /story/:id - Update story details
 * * Middleware: `authMiddleware`, `validate("form", storyPatchSchema)`.
 * Behaviour: Performs a partial update on the story and its page content.
 * * Responses:
 * - 200: success (returns updated story)
 * - 404: story not found
 * - 403: forbidden (unauthorized access)
 * - 500: internal server error
 */
author.patch("/story/:id", authMiddleware, validate("form", storyPatchSchema), async (c) => {
    const { id: userId } = c.get("user");
    const storyId = c.req.param("id");
    
    // Zod guarantees this data is valid based on your schema
    const updateData = c.req.valid("form") as UpdateStoryData;

    const result = await authorService.updateStory(storyId, userId, updateData);

    if (!result.success) {
        if (result.error === 'NOT_FOUND') return c.json({ error: "Story not found" }, 404);
        if (result.error === 'UNAUTHORIZED') return c.json({ error: "Forbidden" }, 403);
        if (result.error === 'SLUG_TAKEN') return c.json({ error: "Slug is already taken" }, 409);
        return c.json({ error: "Internal Server Error" }, 500);
    }

    return c.json({ success: true, story: result.data }, 200);
});



/**
 * GET /my-stories/recent - Fetch recent stories for author workspace
 * 
 * Middleware: `authMiddleware`.
 * Behaviour: Returns the most recently created stories associated with the authenticated user's workspace.
 * 
 * Query Parameters (Validated):
 * - None
 * 
 * Responses:
 * - 200: success
 * - 401: unauthorized
 * - 403: forbidden
 * - 500: internal server error
 */
author.get("/my-stories/recent", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user || (user.role !== "AUTHOR" && user.role !== "SUPERUSER")) {
        return c.json({ error: "Forbidden" }, 403);
    }

    try {
        const stories = await authorService.getRecentStories(user.id);
        return c.json({ ok: true, stories }, 200);
    } catch (e) {
        return c.json({ error: "Internal server error" }, 500);
    }
});

/**
 * GET /my-stories/ - Fetch all stories into author workspace
 * 
 * Middleware: `authMiddleware`, `validate("query", storyListQuerySchema)`.
 * Behaviour: Returns a paginated list of up to 10 stories (default) for the author workspace view. 
 * Supports filtering by title, custom limit per page, and sorting by title or update date.
 * 
 * Query Parameters (Validated):
 * - filter (string, optional)
 * - sort ("title" | "updatedAt", default: "updatedAt")
 * - order ("asc" | "desc", default: "desc")
 * - page (number, default: 1)
 * - limit (number, default: 10, max: 50)
 * 
 * Responses:
 * - 200: success
 * - 401: unauthorized
 * - 403: forbidden
 * - 500: internal server error
 */
author.get("/my-stories/", authMiddleware, validate("query", storyListQuerySchema), async (c) => {
    const user = c.get("user");
    if (!user || (user.role !== "AUTHOR" && user.role !== "SUPERUSER")) {
        return c.json({ error: "Forbidden" }, 403);
    }

    try {
        const { stories, totalCount } = await authorService.getStories(user.id, c.req.valid("query"));
        const limit = c.req.valid("query").limit!;
        
        return c.json({
            ok: true,
            stories,
            totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }, 200);
    } catch (e) {
        return c.json({ error: "Internal server error" }, 500);
    }
});

export default author;