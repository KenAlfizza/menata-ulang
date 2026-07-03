import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { Prisma, prisma } from "../lib/prisma.ts";
import { authMiddleware } from "../middleware/auth.ts";

// Validators
import { validate } from "../lib/validators/index.ts";
import { paramsSchema, listQuerySchema } from "../lib/validators/story.ts";
import { storySchema, storyPatchSchema } from "../lib/validators/story.ts";

// Storage service
import { StorageDisk } from "../services/storageDisk.ts";
import { StorageProvider } from "../services/storageInterface.ts";

const isProduction = Deno.env.get("DENO_ENV") === "production" || 
                     Deno.env.get("DENO_REGION") !== undefined;

export const storage: StorageProvider = isProduction
  ? new StorageDisk() // Change this to AWS A3 or Clouldflare R2
  : new StorageDisk();

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

export default author;