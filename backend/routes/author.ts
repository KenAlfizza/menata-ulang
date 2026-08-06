import { Hono } from "hono";
import { StatusCode } from 'hono/utils/http-status';
import type { AppVariables } from "../types.ts";

// Library imports
import { authMiddleware } from "../middleware/auth.ts";

import { validate } from "../lib/validators/index.ts";

import { storyCreateSchema, storyListQuerySchema, storyParamsSchema, storyPatchSchema, storyPagePatchSchema, publishStorySchema } from "../lib/validators/author.ts";

import { authorService } from "../services/authorService.ts";
import { UpdateStoryData, UpdateStoryPageData } from "../types/services/author.ts";

const author = new Hono<{ Variables: AppVariables }>();

/**
 * POST /story - Create a new story record entry
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
    if (role !== "AUTHOR" && role !== "SUPERUSER") 
        return c.json({ success: false, error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);

    const result = await authorService.createStory(userId, c.req.valid("form"));
    
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
    
    return c.json({ success: true, story: { "id": result.data.id } }, 201);
});

/**
 * GET /story/page/:id
 * Retrieves a single story page record by its unique identifier.
 * Description: Fetches the story page. Validates that the requesting user owns the story before returning it.
 * Authentication: Required (authMiddleware).
 * 
 * Parameters:
 * - id (string): The UUID of the story page to retrieve.
 * 
 * Responses:
 * - 200 OK: Returns the requested story page object.
 * - 403 Forbidden: Returned if the authenticated user is not the owner of the story page.
 * - 404 Not Found: The requested story does not exist.
 * - 500 Internal Server Error: Unexpected database or system error.
 */
author.get("/story/page/:id", authMiddleware, validate("param", storyParamsSchema), async (c) => {
    const { id: userId } = c.get('user');
    const pageId = c.req.valid("param").id;

    const result = await authorService.getStoryPageById(pageId, userId);
    if (!result.success) {
        // Map service errors to appropriate status codes and error objects
        let status: StatusCode = 500;
        let message = "Internal Server Error";
        let code = "INTERNAL_SERVER_ERROR";

        if (result.error === 'NOT_FOUND') {
            status = 404;
            message = "Story page not found";
            code = "NOT_FOUND";
        } else if (result.error === 'UNAUTHORIZED') {
            status = 403;
            message = "You do not have permission to access this story page";
            code = "FORBIDDEN";
        }

        return c.json({ 
            success: false, 
            error: { message, code } 
        }, status);
    }

    return c.json({ success: true, storyPage: result.data }, 200);
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
        // Map service errors to appropriate status codes and error objects
        let status: StatusCode = 500;
        let message = "Internal Server Error";
        let code = "INTERNAL_SERVER_ERROR";

        if (result.error === 'NOT_FOUND') {
            status = 404;
            message = "Story not found";
            code = "NOT_FOUND";
        } else if (result.error === 'UNAUTHORIZED') {
            status = 403;
            message = "You do not have permission to access this story";
            code = "FORBIDDEN";
        }

        return c.json({ 
            success: false, 
            error: { message, code } 
        }, status);
    }

    return c.json({ success: true, story: result.data }, 200);
});


/**
 * PATCH /story/page/:id - Update story page
 * * Middleware: `authMiddleware`, `validate("form", storyPatchSchema)`.
 * Behaviour: Performs a partial update on the story and its page content.
 * * Responses:
 * - 200: success (returns updated story)
 * - 404: story not found
 * - 403: forbidden (unauthorized access)
 * - 500: internal server error
 */
author.patch("/story/page/:id", authMiddleware, validate("json", storyPagePatchSchema), async (c) => {
    const { id: userId } = c.get("user");
    const pageId = c.req.param("id");
    
    // Zod guarantees this data is valid based on your schema
    const updateData = c.req.valid("json") as UpdateStoryPageData;

    const result = await authorService.updateStoryPage(pageId, userId, updateData);

    if (!result.success) {
        if (result.error === 'NOT_FOUND') return c.json({ error: "Story page not found" }, 404);
        if (result.error === 'UNAUTHORIZED') return c.json({ error: "Forbidden" }, 403);
        return c.json({ error: "Internal Server Error" }, 500);
    }

    return c.json({ success: true, storyPage: result.data }, 200);
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
 * PATCH /story/:id/publish - Update story publish status
 * Middleware: `authMiddleware`, `validate("form", publishStorySchema)`.
 * Behaviour: Sets the published state of the story and manages the publishedAt timestamp.
 * 
 * @param {string} id - The unique identifier of the story.
 * @param {boolean} published - The target publish state.
 * 
 * @returns {Promise<Response>} JSON response containing:
 * - 200: success with updated `story` record
 * - 404: story not found
 * - 403: forbidden (unauthorized access)
 * - 500: internal server error
 */
author.patch("/story/:id/publish", authMiddleware, validate("form", publishStorySchema), async (c) => {
    const { id: userId } = c.get("user");
    const storyId = c.req.param("id");
    
    // Zod guarantees this data is valid based on your schema
    const { published } = c.req.valid("form");

    const result = await authorService.setStoryPublishStatus(storyId, userId, published);

    if (!result.success) {
        if (result.error === 'NOT_FOUND') return c.json({ error: "Story not found" }, 404);
        if (result.error === 'UNAUTHORIZED') return c.json({ error: "Forbidden" }, 403);
        return c.json({ error: "Internal Server Error" }, 500);
    }

    return c.json({ success: true, story: result.data }, 200);
});

/**
 * DELETE /story/:id - Remove a story
 * * Middleware: `authMiddleware`.
 * Behaviour: Validates ownership and permanently removes the story and dependent records.
 * * Responses:
 * - 200: success
 * - 404: story not found
 * - 403: forbidden (unauthorized access)
 * - 500: internal server error
 */
author.delete("/story/:id", authMiddleware, validate("param", storyParamsSchema), async (c) => {
    const { id: userId } = c.get("user");
    const storyId = c.req.param("id");

    const result = await authorService.deleteStory(storyId, userId);

    if (!result.success) {
        if (result.error === 'NOT_FOUND') return c.json({ error: "Story not found" }, 404);
        if (result.error === 'UNAUTHORIZED') return c.json({ error: "Forbidden" }, 403);
        return c.json({ error: "Internal Server Error" }, 500);
    }

    return c.json({ success: true, message: "Story deleted successfully" }, 200);
});

/**
 * GET /my-stories/recent - Retrieve the authenticated author's stories
 * * Middleware: `authMiddleware`, `validate` (query schema).
 * Behaviour: Fetches a paginated, searchable, and sortable list of stories 
 * created by the requesting user.
 * * Query Params: 
 * - page (number), limit (number), search (string), sort (string), order (string)
 * * Responses:
 * - 200: success (returns `items`, `total`, `page`, `limit`, `totalPages`)
 * - 400: validation error (invalid query parameters)
 * - 500: internal server error
 */
author.get("/my-stories/recent", authMiddleware, async (c) => {
    const { id: userId } = c.get("user");
    const result = await authorService.getMyRecentStories(userId)

    if (!result.success) {
        return c.json({ error: "Failed to fetch stories" }, 500);
    }

    // Return the paginated response directly
    return c.json({ 
        success: true, 
        items: result.data 
    }, 200);
});


/**
 * GET /my-stories - Retrieve the authenticated author's stories
 * * Middleware: `authMiddleware`, `validate` (query schema).
 * Behaviour: Fetches a paginated, searchable, and sortable list of stories 
 * created by the requesting user.
 * * Query Params: 
 * - page (number), limit (number), search (string), sort (string), order (string)
 * * Responses:
 * - 200: success (returns `items`, `total`, `page`, `limit`, `totalPages`)
 * - 400: validation error (invalid query parameters)
 * - 500: internal server error
 */
author.get("/my-stories", authMiddleware, validate("query", storyListQuerySchema), async (c) => {
    const { id: userId } = c.get("user");
    const { page, limit, search, sort, order } = c.req.valid("query");
    const result = await authorService.getMyStories(userId, {
        search,
        limit: limit ?? 10,
        page: page ?? 1,
        sort,
        order
    });

    if (!result.success) {
        return c.json({ error: "Failed to fetch stories" }, 500);
    }

    // Return the paginated response directly
    return c.json({ success: true, ...result.data }, 200);
});

export default author;