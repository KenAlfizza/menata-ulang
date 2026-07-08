import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { prisma } from "../lib/prisma.ts";
import { authMiddleware } from "../middleware/auth.ts";

const isProduction = Deno.env.get("DENO_ENV") === "production" || 
                     Deno.env.get("DENO_REGION") !== undefined;


const author = new Hono<{ Variables: AppVariables}>();

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
                // Ensure authors only fetch their own stories; superusers might see all or their own depending on requirement
                // Using 'id' link dynamically based on the current logged-in session profile context
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
 * * Behaviour: Returns a paginated list of up to 10 stories (default) for the author workspace view. 
 * Supports filtering by title, custom limit per page, and sorting by title or update date.
 * Also returns total record count for pagination UI.
 * * Query Parameters:
 * - filter (string): Search string for filtering story titles (case-insensitive)
 * - sort (string): Field to sort by ("title" | "updatedAt") - Default: "updatedAt"
 * - order (string): Sort order ("asc" | "desc") - Default: "desc"
 * - page (number): Page number for pagination - Default: 1
 * - limit (number): Number of records per page - Default: 10
 * * Responses:
 * - 200: success
 * - 401: unauthorized
 * - 403: forbidden
 * - 500: internal server error
 */
author.get("/my-stories/", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { id, role } = user;
    if (role !== "AUTHOR" && role !== "SUPERUSER") {
        return c.json({ error: "Forbidden: Authors only" }, 403);
    }

    // Parse query parameters
    const query = c.req.query();
    const filter = query.filter || "";
    const sortBy = query.sort === "title" ? "title" : "updatedAt";
    const sortOrder = query.order === "asc" ? "asc" : "desc";
    
    // Pagination logic
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 10, 50); // Cap at 50 to prevent abuse
    const skip = (page - 1) * limit;

    // Reusable where clause for consistent filtering
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
                orderBy: { [sortBy]: sortOrder },
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
            totalPages: Math.ceil(totalCount / limit),
            stories: stories 
        }, 200);

    } catch (error) {
        console.error("Fetch Stories Error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

export default author;