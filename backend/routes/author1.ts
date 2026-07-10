// --- File: author.ts ---
import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { prisma } from "../lib/prisma.ts";
import { authMiddleware } from "../middleware/auth.ts";

import { validate } from "../lib/validators/index.ts";
import { storyCreateSchema, storyListQuerySchema, storyParamsSchema, storyPatchSchema } from "../lib/validators/author.ts";
import { authorService } from "../services/authorService.ts";
import { CreateStoryData, UpdateStoryData } from "../types/story.ts";
import { defaultPuckData } from "../types/storyPage.ts";

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
        image: formData.image || undefined,
        puckData: defaultPuckData(formData.title),
    };

    try {
        const newPage = await authorService.createStory(userId, createStoryData);
        return c.json({ message: "Page created successfully", ok: true, page: newPage }, 201);
    } catch (error) {
        // Intercept the custom slug error and return a descriptive 400 response
        if (error instanceof Error && error.message.includes("already taken")) {
            return c.json({ error: error.message }, 400);
        }

        console.error("Page Creation Error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});


/**
 * PATCH /story/:id - Save workspace updates to a story and its layout
 * Supports multipart/form-data for file uploads
 * 
 * Middleware: `authMiddleware`, `validate("param", storyParamsSchema)`, `validate("form", storyPatchSchema)`.
 * Behaviour: Updates an existing story entry. Supports conditional layout adjustments and replacing cover images. Verifies ownership.
 * 
 * Path Parameters:
 * - id (string, required) - The CUID storyId
 * 
 * Responses:
 * - 200: success
 * - 400: bad request (e.g., duplicate slug)
 * - 401: unauthorized
 * - 403: forbidden
 * - 404: not found
 * - 500: internal server error
 */
author.patch("/story/:id", 
    authMiddleware, 
    validate("param", storyParamsSchema), 
    validate("form", storyPatchSchema),
    async (c) => 
{
    // 1. Authenticate user roles at the gateway perimeter
    const { id: userId, role } = c.get("user");
    if (role !== "AUTHOR" && role !== "SUPERUSER") return c.json({ error: "Forbidden" }, 403);

    // 2. Extract CUID parameter safely as a string
    const storyId = c.req.valid("param").id;
    
    const formData = c.req.valid("form");
    const updateStoryData: UpdateStoryData = {
        slug: formData.slug,
        title: formData.title,
        description: formData.description,
        image: formData.image,
        published: formData.published,
        puckData: formData.puckData,
    };

    try {
        // OPTIMIZATION: Only request a relation join if puckData exists in the payload
        const needsPageContext = updateStoryData.puckData !== undefined;

        const existingStory = await prisma.story.findUnique({ 
            where: { id: storyId },
            include: { 
                page: needsPageContext ? { select: { id: true } } : false 
            }
        });

        // 3. Prevent structural timing leaks by throwing early
        if (!existingStory) {
            return c.json({ error: "Story not found" }, 404);
        }

        // 4. Enforce security sandbox constraints (SUPERUSERS bypass ownership)
        if (existingStory.authorId !== userId && role !== "SUPERUSER") {
            return c.json({ error: "Forbidden" }, 403);
        }

        // 5. Package pre-fetched details securely down to the execution worker
        const updatedPage = await authorService.updateStory(
            storyId, 
            updateStoryData, 
            { 
                imageUrl: existingStory.imageUrl,
                pageId: existingStory.page?.[0]?.id // Maps safely to schema array structure
            }
        );
        
        return c.json({ message: "Story saved successfully", ok: true, page: updatedPage }, 200);
    } catch (error) {
        // Catch duplicate slug validation failures thrown by the transaction
        if (error instanceof Error && error.message.includes("already taken")) {
            return c.json({ error: error.message }, 400);
        }
        console.error("Story Save Error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
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