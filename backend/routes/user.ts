import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { Prisma, prisma } from "../lib/prisma.ts";
import { authMiddleware } from "../middleware/auth.ts";

// Validators
import { validate } from "../lib/validators/index.ts";
import { paramsSchema, updateUserSchema} from "../lib/validators/user.ts";

const user = new Hono<{ Variables: AppVariables }>();

/** Retrieve the current user details */
user.get("/me", authMiddleware, async (c) => {
    // Get user id from access token
    const { id } = c.get("user");
    // Get the current user from prisma
    try {
        const user = await prisma.user.findUnique({ 
            where: { id }, 
            omit: { id: true, password: true}
        });
        if (!user) return c.json({ error: "Unable to retrieve profile"}, 404);

        // Return profile
        return c.json({ message: "Profile loaded", ok: true, user }, 200);
    } catch {
        return c.json({ error: 'Internal server error' }, 500);
    }
});

/** Retrieve user details endpoint from id
 * Superuser only
*/
user.get("/:id", authMiddleware,
    validate("param", paramsSchema), 
    async (c) => {
    // Priviledge check
    const { role } = c.get("user");
    if (role != "SUPERUSER") return c.json({ error: "Unauthorized" }, 401);

    // Get id from request param and id check
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid id"}, 400);

    // Get the user from prisma
    try {
        const user = await prisma.user.findUnique({ 
            where: { id }, 
            omit: { id: true, password: true }
        });
        if (!user) return c.json({ error: "User not found"}, 404);

        // Return user
        return c.json({ ok: true, user }, 200);
    } catch {
        return c.json({ error: 'Internal server error' }, 500);
    }

});

/** Update the current user details */
user.patch("/me", authMiddleware, 
    validate("json", updateUserSchema), 
    async (c) => {
    // Get user id from access token
    const { id } = c.get("user");

    // Get the updated fields
    const updates = c.req.valid("json");

    // Update the current user
    try {
        const updated = await prisma.user.update({
            where: { id },
            data: updates,
            omit: { id: true, password: true }
        });
        if (!updated) {
            return c.json({ error: 'User not found' }, 404);
        }
        return c.json({ message: 'Profile updated', user: updated }, 200);
    } catch {
        return c.json({ error: 'Internal server error' }, 500);
    }
});

/** Update user details with specified id 
 * Superuser only
*/
user.patch("/:id", authMiddleware,
    validate("param", paramsSchema),
    validate("json", updateUserSchema),
    async (c) => {
    // Priviledge check
    const { role } = c.get("user");
    if (role !== "SUPERUSER") return c.json({ error: "Unauthorized" }, 401);
    
    // Get user id from validated params
    const { id } = c.req.valid("param");
    // Get the updated fields from validated json
    const updates = c.req.valid("json");

    // Update the user with specified id
    try {
        const updated = await prisma.user.update({
            where: { id },
            data: updates,
            omit: { id: true, password: true }
        });
        if (!updated) {
            return c.json({ error: 'User not found' }, 404);
        }
        return c.json({ message: 'Profile updated', user: updated }, 200);
    } catch {
        return c.json({ error: 'Internal server error' }, 500);
    }
});

/** Delete the current user's account 
 * Permanetly removes the user from the server
*/
user.delete("/me/delete", authMiddleware, async (c) => {
    // Get the current user's id from access token
    const { id } = c.get("user");
    
    try {
        await prisma.$transaction([
            // Remove user access and refresh tokens
            prisma.token.deleteMany({where: { userId: id}}),
            // Scrub user data
            prisma.user.update({where: {id}, 
                data: {
                    name: "Deleted user",
                    email: `deleted-${id}@internal.system`,
                    password: "",
                    role: "USER",
                    deletedAt: new Date(),
                }
            })
        ]);
        
        return c.json({error: "Your account successfully deleted"})

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code == "P2025") {
            return c.json({error: "Account does not exists"}, 404);
        } else {
            return c.json({error: "Internal server error"}, 500);
        }
    }
});

/** Delete the a user's account 
 * Permanetly removes a user from the server
 * Superuser only
*/
user.delete("/:id/delete", 
    authMiddleware, 
    validate("param", paramsSchema),
    async (c) => {

    // Validate the role of current user
    const { role } = c.get("user");
    if (role !== "SUPERUSER") return c.json({ error: "Unauthorized" }, 401);
    
    // Get user id
    const { id } = c.req.valid("param");
    // Delete the user
    try {
        await prisma.$transaction([
            // Remove user access and refresh tokens
            prisma.token.deleteMany({where: { userId: id}}),
            // Scrub user data
            prisma.user.update({where: {id}, 
                data: {
                    name: "Deleted user",
                    email: `deleted-${id}@internal.system`,
                    password: "",
                    role: "USER",
                    deletedAt: new Date(),
                }
            })
        ]);
        
        return c.json({error: "Account successfully deleted"})

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code == "P2025") {
            return c.json({error: "Account does not exists"}, 404);
        } else {
            return c.json({error: "Internal server error"}, 500);
        }
    }
});

export default user;