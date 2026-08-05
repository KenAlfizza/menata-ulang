import { Hono } from "hono";
import { StatusCode } from 'hono/utils/http-status';
import type { AppVariables } from "../types.ts";

// Library imports
import { authMiddleware } from "../middleware/auth.ts";

import { validate } from "../lib/validators/index.ts";

import { researcherCreateSchema, researcherListQuerySchema, researcherParamsSchema, researcherPatchSchema, researcherPagePatchSchema, publishResearchSchema } from "../lib/validators/researcher.ts";

import { researcherService } from "../services/researcherService.ts";
import { UpdateResearchData, UpdateResearchPageData } from "../types/services/researcher.ts";

const researcher = new Hono<{ Variables: AppVariables }>();

/**
 * POST /research - Create a new research record entry
 * 
 * Middleware: `authMiddleware`, `validate("form", researchCreateSchema)`.
 * Behaviour: Creates a new research page entry for the authenticated researcher workspace. Verifies user role (RESEARCHER/SUPERUSER) before creation.
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
researcher.post("/research", authMiddleware, validate("form", researcherCreateSchema), async (c) => {
    const { id: userId, role } = c.get("user");
    if (role !== "RESEARCHER" && role !== "SUPERUSER") 
        return c.json({ success: false, error: { message: "Forbidden", code: "FORBIDDEN" } }, 403);

    const result = await researcherService.createResearch(userId, c.req.valid("form"));
    
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
    
    return c.json({ success: true, research: result.data }, 201);
});

/**
 * GET /research/page/:id
 * Retrieves a single research page record by its unique identifier.
 * Description: Fetches the research page. Validates that the requesting user owns the research before returning it.
 * Authentication: Required (authMiddleware).
 * 
 * Parameters:
 * - id (string): The UUID of the research page to retrieve.
 * 
 * Responses:
 * - 200 OK: Returns the requested research page object.
 * - 403 Forbidden: Returned if the authenticated user is not the owner of the research page.
 * - 404 Not Found: The requested research does not exist.
 * - 500 Internal Server Error: Unexpected database or system error.
 */
researcher.get("/research/page/:id", authMiddleware, validate("param", researcherParamsSchema), async (c) => {
    const { id: userId } = c.get('user');
    const pageId = c.req.valid("param").id;

    const result = await researcherService.getResearchPageById(pageId, userId);
    if (!result.success) {
        // Map service errors to appropriate status codes and error objects
        let status: StatusCode = 500;
        let message = "Internal Server Error";
        let code = "INTERNAL_SERVER_ERROR";

        if (result.error === 'NOT_FOUND') {
            status = 404;
            message = "Research page not found";
            code = "NOT_FOUND";
        } else if (result.error === 'UNAUTHORIZED') {
            status = 403;
            message = "You do not have permission to access this research page";
            code = "FORBIDDEN";
        }

        return c.json({ 
            success: false, 
            error: { message, code } 
        }, status);
    }

    return c.json({ success: true, researchPage: result.data }, 200);
});

/**
 * GET /research/:id
 * Retrieves a single research record by its unique identifier.
 * Description: Fetches the research and its associated page data. Validates that the requesting user owns the research before returning it.
 * Authentication: Required (authMiddleware).
 * 
 * Parameters:
 * - id (string): The UUID of the research to retrieve.
 * 
 * Responses:
 * - 200 OK: Returns the requested research object.
 * - 403 Forbidden: Returned if the authenticated user is not the owner of the research.
 * - 404 Not Found: The requested research does not exist.
 * - 500 Internal Server Error: Unexpected database or system error.
 */
researcher.get("/research/:id", authMiddleware, validate("param", researcherParamsSchema), async (c) => {
    const { id: userId } = c.get("user");
    const researchId = c.req.valid("param").id;

    const result = await researcherService.getResearchById(researchId, userId);

    if (!result.success) {
        // Map service errors to appropriate status codes and error objects
        let status: StatusCode = 500;
        let message = "Internal Server Error";
        let code = "INTERNAL_SERVER_ERROR";

        if (result.error === 'NOT_FOUND') {
            status = 404;
            message = "Research not found";
            code = "NOT_FOUND";
        } else if (result.error === 'UNAUTHORIZED') {
            status = 403;
            message = "You do not have permission to access this research";
            code = "FORBIDDEN";
        }

        return c.json({ 
            success: false, 
            error: { message, code } 
        }, status);
    }

    return c.json({ success: true, research: result.data }, 200);
});


/**
 * PATCH /research/page/:id - Update research page
 * * Middleware: `authMiddleware`, `validate("form", researchPagePatchSchema)`.
 * Behaviour: Performs a partial update on the research and its page content.
 * * Responses:
 * - 200: success (returns updated research)
 * - 404: research not found
 * - 403: forbidden (unauthorized access)
 * - 500: internal server error
 */
researcher.patch("/research/page/:id", authMiddleware, validate("json", researcherPagePatchSchema), async (c) => {
    const { id: userId } = c.get("user");
    const pageId = c.req.param("id");
    
    // Zod guarantees this data is valid based on your schema
    const updateData = c.req.valid("json") as UpdateResearchPageData;

    const result = await researcherService.updateResearchPage(pageId, userId, updateData);

    if (!result.success) {
        if (result.error === 'NOT_FOUND') return c.json({ error: "Research page not found" }, 404);
        if (result.error === 'UNAUTHORIZED') return c.json({ error: "Forbidden" }, 403);
        return c.json({ error: "Internal Server Error" }, 500);
    }

    return c.json({ success: true, researchPage: result.data }, 200);
});

/**
 * PATCH /research/:id - Update research details
 * * Middleware: `authMiddleware`, `validate("form", researchPatchSchema)`.
 * Behaviour: Performs a partial update on the research and its page content.
 * * Responses:
 * - 200: success (returns updated research)
 * - 404: research not found
 * - 403: forbidden (unauthorized access)
 * - 500: internal server error
 */
researcher.patch("/research/:id", authMiddleware, validate("form", researcherPatchSchema), async (c) => {
    const { id: userId } = c.get("user");
    const researchId = c.req.param("id");
    
    // Zod guarantees this data is valid based on your schema
    const updateData = c.req.valid("form") as UpdateResearchData;

    const result = await researcherService.updateResearch(researchId, userId, updateData);

    if (!result.success) {
        if (result.error === 'NOT_FOUND') return c.json({ error: "Research not found" }, 404);
        if (result.error === 'UNAUTHORIZED') return c.json({ error: "Forbidden" }, 403);
        if (result.error === 'SLUG_TAKEN') return c.json({ error: "Slug is already taken" }, 409);
        return c.json({ error: "Internal Server Error" }, 500);
    }

    return c.json({ success: true, research: result.data }, 200);
});

/**
 * PATCH /research/:id/publish - Update research publish status
 * Middleware: `authMiddleware`, `validate("form", publishResearchSchema)`.
 * Behaviour: Sets the published state of the research and manages the publishedAt timestamp.
 * 
 * @param {string} id - The unique identifier of the research.
 * @param {boolean} published - The target publish state.
 * 
 * @returns {Promise<Response>} JSON response containing:
 * - 200: success with updated `research` record
 * - 404: research not found
 * - 403: forbidden (unauthorized access)
 * - 500: internal server error
 */
researcher.patch("/research/:id/publish", authMiddleware, validate("form", publishResearchSchema), async (c) => {
    const { id: userId } = c.get("user");
    const researchId = c.req.param("id");
    
    // Zod guarantees this data is valid based on your schema
    const { published } = c.req.valid("form");

    const result = await researcherService.setResearchPublishStatus(researchId, userId, published);

    if (!result.success) {
        if (result.error === 'NOT_FOUND') return c.json({ error: "Research not found" }, 404);
        if (result.error === 'UNAUTHORIZED') return c.json({ error: "Forbidden" }, 403);
        return c.json({ error: "Internal Server Error" }, 500);
    }

    return c.json({ success: true, research: result.data }, 200);
});

/**
 * DELETE /research/:id - Remove a research
 * * Middleware: `authMiddleware`.
 * Behaviour: Validates ownership and permanently removes the research and dependent records.
 * * Responses:
 * - 200: success
 * - 404: research not found
 * - 403: forbidden (unauthorized access)
 * - 500: internal server error
 */
researcher.delete("/research/:id", authMiddleware, validate("param", researcherParamsSchema), async (c) => {
    const { id: userId } = c.get("user");
    const researchId = c.req.param("id");

    const result = await researcherService.deleteResearch(researchId, userId);

    if (!result.success) {
        if (result.error === 'NOT_FOUND') return c.json({ error: "Research not found" }, 404);
        if (result.error === 'UNAUTHORIZED') return c.json({ error: "Forbidden" }, 403);
        return c.json({ error: "Internal Server Error" }, 500);
    }

    return c.json({ success: true, message: "Research deleted successfully" }, 200);
});

/**
 * GET /my-research/recent - Retrieve the authenticated researcher's research
 * * Middleware: `authMiddleware`, `validate` (query schema).
 * Behaviour: Fetches a paginated, searchable, and sortable list of research 
 * created by the requesting user.
 * * Query Params: 
 * - page (number), limit (number), search (string), sort (string), order (string)
 * * Responses:
 * - 200: success (returns `items`, `total`, `page`, `limit`, `totalPages`)
 * - 400: validation error (invalid query parameters)
 * - 500: internal server error
 */
researcher.get("/my-researches/recent", authMiddleware, async (c) => {
    const { id: userId } = c.get("user");
    const result = await researcherService.getMyRecentResearches(userId)

    if (!result.success) {
        return c.json({ error: "Failed to fetch research" }, 500);
    }

    // Return the paginated response directly
    return c.json({ 
        success: true, 
        items: result.data 
    }, 200);
});


/**
 * GET /my-research - Retrieve the authenticated researcher's research
 * * Middleware: `authMiddleware`, `validate` (query schema).
 * Behaviour: Fetches a paginated, searchable, and sortable list of research 
 * created by the requesting user.
 * * Query Params: 
 * - page (number), limit (number), search (string), sort (string), order (string)
 * * Responses:
 * - 200: success (returns `items`, `total`, `page`, `limit`, `totalPages`)
 * - 400: validation error (invalid query parameters)
 * - 500: internal server error
 */
researcher.get("/my-researches", authMiddleware, validate("query", researcherListQuerySchema), async (c) => {
    const { id: userId } = c.get("user");
    const { page, limit, search, sort, order } = c.req.valid("query");
    const result = await researcherService.getMyResearches(userId, {
        search,
        limit: limit ?? 10,
        page: page ?? 1,
        sort,
        order
    });

    if (!result.success) {
        return c.json({ error: "Failed to fetch research" }, 500);
    }

    // Return the paginated response directly
    return c.json({ success: true, ...result.data }, 200);
});

export default researcher;
