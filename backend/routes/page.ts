import { Hono } from "hono";
import type { AppVariables } from "../types.ts";
import { prisma } from "../lib/prisma.ts";
import { authMiddleware } from "../middleware/auth.ts";

const page = new Hono<{ Variables: AppVariables }>();

/**
 * POST / - Create a new page entry
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
page.post("/", authMiddleware, async (c) => {
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
    const newPage = await prisma.page.create({
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
page.patch("/:id", authMiddleware, async (c) => {
  try {
    // Get the current user details
    const { id: userId, role } = c.get("user");
    
    // Get the target page id parameter
    const pageId = c.req.param("id");
    
    // Get the data payload adjustments
    const { data, published } = await c.req.json();

    // Fetch page details from database to check ownership permissions
    const existingPage = await prisma.page.findUnique({ where: { id: pageId } });
    if (!existingPage) {
      return c.json({ error: "Page not found" }, 404);
    }

    if (existingPage.authorId !== userId && role !== "SUPERUSER") {
      return c.json({ error: "Forbidden: You do not own this page asset" }, 403);
    }

    // Execute database update mutations safely
    const updatedPage = await prisma.page.update({
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
page.get("/:id", async (c) => {
  try {
    const pageId = c.req.param("id");
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    
    if (!page) {
      return c.json({ error: "Page not found" }, 404);
    }
    
    return c.json({ ok: true, page });
  } catch (error) {
    console.error("Page Fetch Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { page };
