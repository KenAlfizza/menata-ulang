import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { prisma } from "../lib/prisma.ts";
import { authMiddleware } from "../middleware/auth.ts";

import { validate } from "../lib/validators/index.ts";
import { storyCreateSchema, storyListQuerySchema, storyParamsSchema, storyPatchSchema } from "../lib/validators/author.ts";

const author = new Hono<{ Variables: AppVariables }>();

/**
 * GET /my-stories/recent - Fetch recently edited stories into author workspace
 * 
 * Behaviour: returns three most recent page for author workspace view
 * 
 * Responses:
 * - 200: success
 * - 401: unauthorized
 * - 403: forbidden
 * - 500: internal server error
 */
author.get("/my-stories/recent", authMiddleware, async (c) => {
    // Validate user context from authMiddleware
    const user = c.get("user");
    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const { id, role } = user;

    // Validate the role of current user (allow AUTHORS and SUPERUSER)
    if (role !== "AUTHOR" && role !== "SUPERUSER") {
        return c.json({ error: "Forbidden: Authors only" }, 403);
    }

    try {
        // Fetch the three most recent stories for this specific author
        const recentStories = await prisma.storyPage.findMany({
            where: {
                authorId: id,
            },
            orderBy: {
                updatedAt: "desc", // Sorts by recently edited/updated first
            },
            take: 3, // Limits the payload response block to exactly 3 items
            select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                published: true,
                updatedAt: true,
            }
        });

        return c.json({
            message: "Recent stories retrieved successfully",
            ok: true,
            stories: recentStories
        }, 200);

    } catch (error) {
        console.error("Fetch Recent Stories Error:", error);
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
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { id, role } = user;
    if (role !== "AUTHOR" && role !== "SUPERUSER") {
        return c.json({ error: "Forbidden: Authors only" }, 403);
    }

    // Validate and get query parameters
    const { filter, sort, order, page, limit } = c.req.valid("query");

    const skip = (page! - 1) * limit!;
    const where = {
        authorId: id,
        title: {
            contains: filter,
            mode: 'insensitive' as const
        },
    };

    try {
        // Execute findMany and count in a transaction for consistency
        const [stories, totalCount] = await prisma.$transaction([
            prisma.storyPage.findMany({
                where,
                orderBy: { [sort!]: order! },
                skip: skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    imageUrl: true,
                    published: true,
                    updatedAt: true,
                }
            }),
            prisma.storyPage.count({ where })
        ]);

        return c.json({
            message: "Stories retrieved successfully",
            ok: true,
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit!),
            stories: stories
        }, 200);

    } catch (error) {
        console.error("Fetch Stories Error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

/**
 * POST /story - Create a new story page entry
 *
 * Middleware: `authMiddleware`, `validate("json", storyCreateSchema)`.
 * Authorization: users with role `AUTHOR` or `SUPERUSER` may create pages.
 *
 * Accepted JSON fields: `title`, `slug`, `description`.
 * Behavior: sets up a default empty layout template structure for Puck. 
 * Prisma automatically handles generating the unique CUID2 string id.
 *
 * Responses:
 * - 201: page record created successfully
 * - 400: missing required title or slug fields
 * - 403: forbidden (insufficient role)
 * - 500: internal server error
 */
author.post("/story", authMiddleware, validate("json", storyCreateSchema), async (c) => {
    try {
        // Validate the role of current user (allow AUTHORS and SUPERUSER)
        const { id: userId, role } = c.get("user");
        if (role !== "AUTHOR" && role !== "SUPERUSER") {
            return c.json({ error: "Forbidden: Elevated access required" }, 403);
        }

        // Get the page parameters from validated JSON
        const { title, description, slug } = c.req.valid("json");
        
        // Define standard baseline parameters for Puck content schemas
        const defaultPuckSchema = {
            content: [],
            root: { props: { title: title } },
        };

        // Create the page record in database (Prisma automatically sets the CUID2)
        const newPage = await prisma.storyPage.create({
            data: {
                title,
                description,
                slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, ""), // Sanitize url strings
                puckData: defaultPuckSchema,
                authorId: userId,
            },
        });

        return c.json({ message: "Page created successfully", ok: true, page: newPage }, 201);
    } catch (error) {
        console.error("Page Creation Error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});


/**
 * PATCH /story/:id - Save workspace updates to a page layout
 *
 * Middleware: `authMiddleware`, `validate("param", storyParamsSchema)`,
 * `validate("json", storyPatchSchema)`.
 * Authorization: the page author or users with role `SUPERUSER` may
 * perform updates.
 *
 * Accepted JSON fields (all optional):
 * - `data` — the Puck canvas structure schema object to update when present
 * - `published` — boolean visibility toggle state to update when present
 * - `title` — string (1-100 chars)
 * - `description` — string (1-500 chars)
 * - `imageUrl` — string (optional)
 *
 * Responses:
 * - 200: page layout saved successfully
 * - 403: forbidden (not author and not SUPERUSER)
 * - 404: page not found
 * - 500: internal server error
 */
author.patch("/story/:id", authMiddleware, validate("param", storyParamsSchema), validate("json", storyPatchSchema), async (c) => {
    try {
        // Get the current user details
        const { id: userId, role } = c.get("user");

        // Get the target page id parameter from validated params
        const pageId = c.req.valid("param").id;

        // Get the data payload adjustments from validated JSON
        const updateData = c.req.valid("json");

        // Fetch page details from database to check ownership permissions
        const existingPage = await prisma.storyPage.findUnique({ where: { id: pageId } });
        if (!existingPage) {
            return c.json({ error: "Page not found" }, 404);
        }

        if (existingPage.authorId !== userId && role !== "SUPERUSER") {
            return c.json({ error: "Forbidden: You do not own this page asset" }, 403);
        }

        // Execute database update mutations safely
        const updatedPage = await prisma.storyPage.update({
            where: { id: pageId },
            data: {
                ...(updateData.data && { puckData: updateData.data }),
                ...(updateData.published !== undefined && { published: updateData.published }),
                ...(updateData.title && { title: updateData.title }),
                ...(updateData.description && { description: updateData.description }),
                ...(updateData.imageUrl && { imageUrl: updateData.imageUrl }), // Added: Map imageUrl to Prisma update
            },
        });

        return c.json({ message: "Page saved successfully", ok: true, page: updatedPage }, 200);
    } catch (error) {
        console.error("Page Save Error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

/**
 * GET /story/:id - Fetch page details to load into the workspace editor
 *
 * Middleware: `authMiddleware`, `validate("param", storyParamsSchema)`.
 * Behavior: returns the full page details matching the provided ID payload.
 *
 * Responses:
 * - 200: page record object payload
 * - 404: page not found
 * - 500: internal server error
 */
author.get("/story/:id", authMiddleware, validate("param", storyParamsSchema), async (c) => {
    try {
        const pageId = c.req.valid("param").id;
        const page = await prisma.storyPage.findUnique({ where: { id: pageId } });

        if (!page) {
            return c.json({ error: "Page not found" }, 404);
        }

        return c.json({ ok: true, page });
    } catch (error) {
        console.error("Page Fetch Error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

export default author;