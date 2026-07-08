import { Hono } from "hono";
import type { AppVariables } from "../types.ts";
import { prisma } from "../lib/prisma.ts";
import { authMiddleware } from "../middleware/auth.ts";

// Validators
import { validate } from "../lib/validators/index.ts";
import {
    paramsSchema,
    researchSchema,
    researchPatchSchema,
    researchListQuerySchema,
} from "../lib/validators/researcher.ts";

const researcher = new Hono<{ Variables: AppVariables }>();

/**
 * GET /my-researches/recent - Fetch recently edited research pages
 *
 * Middleware: `authMiddleware`
 * Authorization: Restricted to `AUTHOR` or `SUPERUSER`.
 *
 * Behavior: Returns the three most recently updated research pages for the 
 * author dashboard workspace.
 *
 * Responses:
 * - 200: Recent researches retrieved successfully
 * - 401: Unauthorized
 * - 403: Forbidden (insufficient role)
 * - 500: Internal server error
 */
researcher.get("/my-researches/recent", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user || (user.role !== "AUTHOR" && user.role !== "SUPERUSER")) {
        return c.json({ error: "Forbidden: Access denied" }, 403);
    }

    try {
        const recentResearches = await prisma.researchPage.findMany({
            where: { researcherId: user.id },
            orderBy: { updatedAt: "desc" },
            take: 3,
            select: { id: true, title: true, description: true, published: true, updatedAt: true }
        });
        return c.json({ message: "Success", ok: true, researches: recentResearches }, 200);
    } catch (error) {
        return c.json({ error: "Internal server error" }, 500);
    }
});

/**
 * GET /my-researches/ - Fetch all researches (paginated)
 *
 * Middleware: `authMiddleware`, `validate("query", researchListQuerySchema)`.
 * Authorization: Restricted to `AUTHOR` or `SUPERUSER`.
 * Query Parameters (Validated):
 * - filter (string, optional)
 * - sort ("title" | "updatedAt", default: "updatedAt")
 * - order ("asc" | "desc", default: "desc")
 * - page (int, default: 1)
 * - limit (int, default: 10, max: 50)
 *
 * Behavior: Returns a paginated list of researches with metadata.
 *
 * Responses:
 * - 200: Success
 * - 401: Unauthorized
 * - 403: Forbidden
 * - 500: Internal server error
 */
researcher.get("/my-researches/",
    authMiddleware,
    validate("query", researchListQuerySchema),
    async (c) => {
        const user = c.get("user");
        if (!user || (user.role !== "AUTHOR" && user.role !== "SUPERUSER")) {
            return c.json({ error: "Forbidden: Access denied" }, 403);
        }

        const { filter, sort, order, page, limit } = c.req.valid("query");

        const skip = (page! - 1) * limit!;
        const where = {
            researcherId: user.id,
            title: { contains: filter, mode: 'insensitive' as const }
        };

        try {
            const [researches, totalCount] = await prisma.$transaction([
                prisma.researchPage.findMany({ 
                    where, 
                    orderBy: { [sort!]: order! }, 
                    skip, 
                    take: limit, 
                    select: { id: true, title: true, description: true, published: true, updatedAt: true }
                }),
                prisma.researchPage.count({ where })
            ]);
            return c.json({
                message: "Researches retrieved successfully",
                ok: true,
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit!),
                researches
            }, 200);
        } catch (error) {
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

/**
 * POST / - Create a new research page entry
 *
 * Middleware: `authMiddleware`, `validate("json", researchSchema)`.
 * Authorization: Restricted to `AUTHOR` or `SUPERUSER`.
 * Accepted JSON fields: `title`, `description`, `slug`.
 *
 * Behavior: Initializes a research page with an empty default Puck layout.
 *
 * Responses:
 * - 201: Research page created successfully
 * - 400: Validation error
 * - 401: Unauthorized
 * - 403: Forbidden
 * - 500: Internal server error
 */
researcher.post("/",
    authMiddleware,
    validate("json", researchSchema),
    async (c) => {
        const user = c.get("user");
        if (!user || (user.role !== "AUTHOR" && user.role !== "SUPERUSER")) {
            return c.json({ error: "Forbidden: Access denied" }, 403);
        }

        const { title, slug, description } = c.req.valid("json");

        try {
            const newResearch = await prisma.researchPage.create({
                data: {
                    title,
                    slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, ""),
                    description,
                    puckData: { content: [], root: { props: { title } } },
                    researcherId: user.id,
                },
            });
            return c.json({ message: "Created successfully", ok: true, research: newResearch }, 201);
        } catch (error) {
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

/**
 * PATCH /page/:id - Update an existing research page entry
 *
 * Middleware: `authMiddleware`, `validate("param", paramsSchema)`,
 * `validate("json", researchPatchSchema)`.
 * Authorization: Restricted to original author or `SUPERUSER`.
 * Accepted JSON fields (Partial): `data`, `published`, `title`, `description`.
 *
 * Behavior: Performs an atomic, partial update on the research record.
 *
 * Responses:
 * - 200: Research page updated successfully
 * - 400: Validation error
 * - 403: Forbidden
 * - 404: Not found
 * - 500: Internal server error
 */
researcher.patch("/page/:id",
    authMiddleware,
    validate("param", paramsSchema),
    validate("json", researchPatchSchema),
    async (c) => {
        const { id: pageId } = c.req.valid("param");
        const updateData = c.req.valid("json");
        const user = c.get("user");

        try {
            const existingPage = await prisma.researchPage.findUnique({ where: { id: pageId } });
            if (!existingPage) return c.json({ error: "Research page not found" }, 404);

            if (existingPage.researcherId !== user.id && user.role !== "SUPERUSER") {
                return c.json({ error: "Forbidden: You do not own this asset" }, 403);
            }

            const updatedPage = await prisma.researchPage.update({
                where: { id: pageId },
                data: {
                    ...(updateData.data && { puckData: updateData.data }),
                    ...(updateData.published !== undefined && { published: updateData.published }),
                    ...(updateData.title && { title: updateData.title }),
                    ...(updateData.description && { description: updateData.description }),
                },
            });
            return c.json({ message: "Saved successfully", ok: true, page: updatedPage }, 200);
        } catch (error) {
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

export default researcher;