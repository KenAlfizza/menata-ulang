import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { prisma } from "../lib/prisma.ts";
import { authMiddleware } from "../middleware/auth.ts";

const user = new Hono<{ Variables: AppVariables }>();


/** Retrieve the current user details */
user.get("/me", authMiddleware, async (c) => {
    // Get user id from access token
    const { id } = c.get("user");
    // Get the current user from prisma
    const user = await prisma.user.findUnique({ 
        where: { id }, 
        omit: { id: true, password: true}
    });
    if (!user) return c.json({ error: "Unable to retrieve profile"}, 404);

    // Return profile
    return c.json({ message: "Profile loaded", ok: true, user }, 200);
});

/** Retrieve user details endpoint from id
 * Superuser only
*/
user.get("/:id", authMiddleware, async (c) => {
    // Priviledge check
    const { role } = c.get("user");
    if (role != "SUPERUSER") return c.json({ error: "Unauthorized" }, 401);

    // Get id from request param and id check
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid id"}, 400);

    // Get the user from prisma
    const user = await prisma.user.findUnique({ 
        where: { id }, 
        omit: { id: true, password: true }
    });
    if (!user) return c.json({ error: "User not found"}, 404);

    // Return user
    return c.json({ ok: true, user }, 200);

});

export default user;