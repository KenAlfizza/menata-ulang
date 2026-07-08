import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { prisma } from "../lib/prisma.ts";
import { authMiddleware } from "../middleware/auth.ts";

const researcher = new Hono<{ Variables: AppVariables}>();

/**
 * GET /my-researches/recent - Fetch recently edited researches into author workspace
 * * Behaviour: returns three most recent page for author workspace view
 * * Responses:
 * - 200: success
 * - 401: unauthorized
 * - 403: forbidden
 * - 500: internal server error
 */
researcher.get("/my-researches/recent", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const { id, role } = user;

    if (role !== "AUTHOR" && role !== "SUPERUSER") {
        return c.json({ error: "Forbidden: Authors only" }, 403);
    }

    try {
        const recentResearches = await prisma.researchPage.findMany({
            where: {
                researcherId: id, 
            },
            orderBy: {
                updatedAt: "desc",
            },
            take: 3,
            select: {
                id: true,
                title: true,
                imageUrl: true,
                published: true,
                updatedAt: true,
            }
        });

        return c.json({ 
            message: "Recent researches retrieved successfully", 
            ok: true, 
            researches: recentResearches 
        }, 200);

    } catch (error) {
        console.error("Fetch Recent Researches Error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

/**
 * GET /my-researches/ - Fetch all researches into author workspace
 * * Behaviour: Returns a paginated list of up to 10 researches (default) for the author workspace view. 
 * Supports filtering by title, custom limit per page, and sorting by title or update date.
 * Also returns total record count for pagination UI.
 * * Query Parameters:
 * - filter (string): Search string for filtering research titles (case-insensitive)
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
researcher.get("/my-researches/", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { id, role } = user;
    if (role !== "AUTHOR" && role !== "SUPERUSER") {
        return c.json({ error: "Forbidden: Authors only" }, 403);
    }

    const query = c.req.query();
    const filter = query.filter || "";
    const sortBy = query.sort === "title" ? "title" : "updatedAt";
    const sortOrder = query.order === "asc" ? "asc" : "desc";
    
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const where = {
        researcherId: id,
        title: { 
            contains: filter, 
            mode: 'insensitive' as const
        },
    };

    try {
        const [researches, totalCount] = await prisma.$transaction([
            prisma.researchPage.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: skip,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    imageUrl: true,
                    published: true,
                    updatedAt: true,
                }
            }),
            prisma.researchPage.count({ where })
        ]);

        return c.json({ 
            message: "Researches retrieved successfully", 
            ok: true, 
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            researches: researches 
        }, 200);

    } catch (error) {
        console.error("Fetch Researches Error:", error);
        return c.json({ error: "Internal server error" }, 500);
    }
});

export default researcher;
