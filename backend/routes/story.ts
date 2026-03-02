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
  ? new StorageDisk("uploads") // Change this to AWS A3 or Clouldflare R2
  : new StorageDisk("uploads");

const story = new Hono<{ Variables: AppVariables}>();

/**
 * GET / - List brief story summaries
 *
 * Returns an array of story summaries. Each item includes `title`,
 * `description`, `author` (author object), and `imageUrl`.
 *
 * Validation: none (consider adding query params for pagination/filtering).
 * Success: 200 with JSON array. Failure: 500 with `{ error: "Internal server error" }`.
 */
story.get("/", validate("query", listQuerySchema), async (c) => {
    try {
        const q = c.req.valid("query");
        const page = q.page ?? 1;
        const limit = q.limit ?? 20;
        const search = q.search?.trim();

        const where: Prisma.StoryWhereInput = { published: true };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [total, stories] = await prisma.$transaction([
        // The count of total published stories (for pagination)
        prisma.story.count({ where }),
        // The stories with pagination and author details
        prisma.story.findMany({
            where,
            select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            publishedAt: true,
            author: { select: { id: true, name: true } },
            },
            orderBy: { publishedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        ]);

        // Normalize author shape to `author: { id, name }` already returned
        return c.json({ data: stories, meta: { page, limit, total } });
    } catch (error) {
        console.error('List Error:', error);
        return c.json({ error: "Internal server error"}, 500);
    }
});


/**
 * GET /:id - Fetch a single published story
 *
 * Validation: `paramsSchema` validates the `id` path parameter.
 * Behavior: returns the story (including author.name) only if it exists and
 * is published.
 * Responses:
 * - 200: story payload
 * - 403: story exists but is not published
 * - 404: story not found
 * - 500: internal server error
 */
story.get("/:id", validate("param", paramsSchema), async (c) => {
    // The the story id
    const { id } = c.req.valid("param");

    // Fetch story and other details from database
    try {
        const storedStory = await prisma.story.findUnique({ 
            where: { id },
            include: { author: true }
        });
        if (!storedStory) return c.json({ error: "Story does not exists" }, 404)
        if (!storedStory.published) return c.json({ error: "Story is not yet published"}, 403)
        const author = storedStory.author;
        const story = {
            imageUrl: storedStory.imageUrl,
            title: storedStory.title,
            description: storedStory.description,
            text: storedStory.text,
            pubslishedAt: storedStory.publishedAt,
            author: author.name,
        }
        return c.json({ message: "Profile loaded", ok:true, story});

    } catch {
        return c.json({ error: "Internal server error" }, 500);
    }
});

/**
 * POST / - Create a new story
 *
 * Middleware: `authMiddleware`, `validate("form", storySchema)`.
 * Authorization: users with role `AUTHOR` or `SUPERUSER` may create stories.
 *
 * Accepted form fields: `title`, `description`, `text`, `image`, `published`.
 * Behavior: uploads provided `image`, creates the story tied to the current
 * user. If DB creation fails the uploaded image is deleted to avoid orphans.
 *
 * Responses:
 * - 201: story created
 * - 403: forbidden (insufficient role)
 * - 500: internal server error
 */
story.post("/", 
    authMiddleware, 
    validate("form", storySchema), 
    async (c) => {

        // Validate the role of current user (allow AUTHORS and SUPERUSER)
        const { id, role } = c.get("user");
        if (role !== "AUTHOR" && role !== "SUPERUSER") return c.json({ error: "Forbidden: Authors only" }, 403);

        // Get the story elements
        const { title, description, text, image, published } = c.req.valid("form");
        
        // Upload image
        const imageUrl = await storage.save(image, "stories");

        // Create the story record in database
        try {
            const story = await prisma.story.create({
                data: {
                    title,
                    description,
                    text,
                    author: {connect: {id: id}},
                    published,
                    imageUrl,
                },
            });
            return c.json({ message: "Story created", ok:true, story }, 201);
        } catch (error) {
            // On failure, delete the uploaded image to prevent orphaned files
            if (imageUrl) {
                console.error("Database failed, deleting orphaned file...");
                await storage.delete(imageUrl);
            }
            // Log the error for debugging and return a generic error message to the client
            console.error("Creation Error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

/**
 * PATCH /:id - Update a story
 *
 * Validates the `id` parameter and a partial form body via
 * `storyPatchSchema`. Requires authentication.
 *
 * Authorization: the story author or users with role `SUPERUSER` may
 * perform updates.
 *
 * Accepted fields (all optional):
 * - `title`, `description`, `text`, `published` — updated when present
 * - `image` — if provided, the handler uploads the new image, updates
 *   the DB with the new URL, and deletes the old image after success.
 *   If DB update fails the newly uploaded image is deleted to avoid
 *   orphaned files.
 *
 * Responses:
 * - 200: updated story
 * - 403: forbidden (not author and not SUPERUSER)
 * - 404: story not found
 * - 500: internal server error
 */
story.patch("/:id",
    authMiddleware,
    validate("param", paramsSchema),
    validate("form", storyPatchSchema),
    async (c) => {
        const { id } = c.req.valid("param");
        const user = c.get("user");
        const { title, description, text, published, image } = c.req.valid("form");

        let newImageUrl: string | undefined;

        try {
            // Ensure story exists and user is the owner
            const existing = await prisma.story.findUnique({ where: { id }, include: { author: true } });
            if (!existing) return c.json({ error: "Story does not exists" }, 404);
            // Allow owners or SUPERUSERs to edit
            if (existing.author?.id !== user.id && user.role !== "SUPERUSER") return c.json({ error: "Forbidden" }, 403);

            // Build update payload only with provided fields
            const data: Record<string, unknown> = {};
            if (title !== undefined) data.title = title;
            if (description !== undefined) data.description = description;
            if (text !== undefined) data.text = text;
            if (published !== undefined) data.published = published;

            // Handle image replacement if provided
            if (image) {
                newImageUrl = await storage.save(image, "stories");
                data.imageUrl = newImageUrl;
            }

            const updatedStory = await prisma.story.update({ where: { id }, data });

            // Delete old image after successful update (avoid orphan on failure)
            if (newImageUrl && existing.imageUrl) {
                try { await storage.delete(existing.imageUrl); } catch (e) { console.error("Failed deleting old image", e); }
            }

            return c.json({ message: "Story updated", ok:true, story: updatedStory });
        } catch (error) {
            // Cleanup newly uploaded image if DB update failed
            if (newImageUrl) {
                try { await storage.delete(newImageUrl); } catch {}
            }
            console.error("Update Error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

/**
 * DELETE /:id - Delete a story
 *
 * Validates the `id` parameter. Requires authentication.
 *
 * Authorization: the story author or users with role `SUPERUSER` may
 * perform deletion.
 *
 * Responses:
 * - 200: success message
 * - 403: forbidden (not author and not SUPERUSER)
 * - 404: story not found
 * - 500: internal server error
 */
story.delete("/:id",
    authMiddleware,
    validate("param", paramsSchema),
    async (c) => {
        const { id } = c.req.valid("param");
        const user = c.get("user");

        try {
            // Ensure story exists and user is the owner
            const existing = await prisma.story.findUnique({ where: { id }, include: { author: true } });
            if (!existing) return c.json({ error: "Story does not exists" }, 404);
            // Allow owners or SUPERUSERs to delete
            if (existing.author?.id !== user.id && user.role !== "SUPERUSER") return c.json({ error: "Forbidden" }, 403);

            // Delete image if exists
            if (existing.imageUrl) {
                try { 
                    await storage.delete(existing.imageUrl); 
                } catch (e) { 
                    console.error("Failed deleting image", e); 
                    return c.json({ error: "Internal server error" }, 500);
                }
            }

            // Delete story from DB
            await prisma.story.delete({ where: { id } });

            return c.json({ message: "Story deleted", ok:true });
        } catch (error) {
            console.error("Delete Error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

export default story;