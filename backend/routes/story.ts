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
        const limit = q.limit ?? 10;
        const search = q.search?.trim();

        const where: Prisma.StoryWhereInput = {
        published: true,
            ...(search && {
                AND: {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ],
                },
            }),
        };

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
            include: { author: true, research: true }
        });
        if (!storedStory) return c.json({ error: "Story is not found" }, 404)
        if (!storedStory.published) return c.json({ error: "Story is not yet published"}, 403)
        
        const author = storedStory.author;
        const story = {
            imageUrl: storedStory.imageUrl,
            title: storedStory.title,
            description: storedStory.description,
            text: storedStory.text,
            researchText: storedStory.research?.text,
            publishedAt: storedStory.publishedAt,
            author: author.name,
        }
        return c.json({ message: "Story fetched", ok:true, story});

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
 * Accepted form fields: 
 * `title`, `description`, `text`, `image`, `published`, `researchText`.
 * Behavior: uploads provided `image`, creates the story tied to the current
 * user, create the research tied to the story. If DB creation fails the 
 * uploaded image is deleted to avoid orphans.
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
        const { title, description, text, image, published, researchText } = c.req.valid("form");

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
                    research: {
                        // Create research
                        create: { 
                            text: researchText
                        }
                    },
                    thread: {
                        create: {
                            reflections: {
                                create: {
                                    userName: "admin",
                                    text: "Hi! Please write your own reflection to see what others have to say.",
                                }
                            }
                        }
                    }                    
                },
                include: {
                    research: true  // Include research in the result
                }
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
 * - `researchText` - if provided, the handler will update the research
 *   tied to the story.
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
        const { title, description, text, published, image, researchText } = c.req.valid("form");

        let newImageUrl: string | undefined;

        try {
            // Ensure story exists and user is the owner
            const existing = await prisma.story.findUnique({ 
                where: { id }, 
                include: { author: true, research: true } 
            });
            if (!existing) return c.json({ error: "Story does not exists" }, 404);
            // Allow owners or SUPERUSERs to edit
            if (existing.author?.id !== user.id && user.role !== "SUPERUSER") return c.json({ error: "Forbidden" }, 403);

            // Build update payload only with provided fields
            const data: Record<string, unknown> = {};
            if (title !== undefined) data.title = title;
            if (description !== undefined) data.description = description;
            if (text !== undefined) data.text = text;
            if (published !== undefined) data.published = published;
            
            // Handle research text update
            if (researchText !== undefined) {
                data.research = {
                    upsert: {
                        create: { text: researchText },
                        update: { text: researchText }
                    }
                }
            }

            // Handle image replacement if provided
            if (image) {
                newImageUrl = await storage.save(image, "stories");
                data.imageUrl = newImageUrl;
            }

            // Update database record
            const updatedStory = await prisma.story.update({ 
                where: { id }, data, include: { research: true } 
            });

            // Delete old image after successful update (avoid orphan on failure)
            if (newImageUrl && existing.imageUrl) {
                try { 
                    await storage.delete(existing.imageUrl); 
                } catch (e) { 
                    console.error("Failed deleting old image", e); 
                }
            }

            return c.json({ message: "Story updated", ok:true, story: updatedStory });
        } catch (error) {
            // Cleanup newly uploaded image if DB update failed
            if (newImageUrl) {
                try { await storage.delete(newImageUrl); } catch {
                    return c.json({ error: "Internal server error" }, 500);
                }
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
            const existing = await prisma.story.findUnique({ 
                where: { id }, 
                include: { author: true, research: true } 
            });
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

/**
 * POST / - Create a new story page entry
 *
 * Middleware: `authMiddleware`
 * Authorization: users with role `AUTHOR` or `SUPERUSER` may create pages.
 *
 * Accepted JSON fields: 
 * `title`, `slug`.
 * Behavior: sets up a default empty layout template structure for Puck. 
 * Prisma automatically handles generating the unique CUID2 string id.
 *
 * Responses:
 * - 201: page record created successfully
 * - 400: missing required title or slug fields
 * - 403: forbidden (insufficient role)
 * - 500: internal server error
 */

story.post("/page", authMiddleware, async (c) => {
  try {
    // Validate the role of current user (allow AUTHORS and SUPERUSER)
    const { id: userId, role } = c.get("user");
    if (role !== "AUTHOR" && role !== "SUPERUSER") {
      return c.json({ error: "Forbidden: Elevated access required" }, 403);
    }

    // Get the page parameters
    const { title, slug } = await c.req.json();
    if (!title || !slug) {
      return c.json({ error: "Missing required title or slug fields" }, 400);
    }

    // Define standard baseline parameters for Puck content schemas
    const defaultPuckSchema = {
      content: [],
      root: { props: { title: title } },
    };

    // Create the page record in database (Prisma automatically sets the CUID2)
    const newPage = await prisma.storyPage.create({
      data: {
        title,
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
 * PATCH /:id - Save workspace updates to a page layout
 *
 * Validates the `id` path parameter. Requires authentication.
 *
 * Authorization: the page author or users with role `SUPERUSER` may
 * perform updates.
 *
 * Accepted JSON fields (all optional):
 * - `data` — the Puck canvas structure schema object to update when present
 * - `published` — boolean visibility toggle state to update when present
 *
 * Responses:
 * - 200: page layout saved successfully
 * - 403: forbidden (not author and not SUPERUSER)
 * - 404: page not found
 * - 500: internal server error
 */
story.patch("/page/:id", authMiddleware, async (c) => {
  try {
    // Get the current user details
    const { id: userId, role } = c.get("user");
    
    // Get the target page id parameter
    const pageId = c.req.param("id");
    
    // Get the data payload adjustments
    const { data, published } = await c.req.json();

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
        ...(data && { puckData: data }),
        ...(typeof published === "boolean" && { published }),
      },
    });

    return c.json({ message: "Page saved successfully", ok: true, page: updatedPage }, 200);
  } catch (error) {
    console.error("Page Save Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /:id - Fetch page details to load into the workspace editor
 *
 * Behavior: returns the full page details matching the provided ID payload.
 *
 * Responses:
 * - 200: page record object payload
 * - 404: page not found
 * - 500: internal server error
 */
story.get("/page/:id", async (c) => {
  try {
    const pageId = c.req.param("id");
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

export default story;