import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { prisma, Prisma } from "../lib/prisma.ts";

import { validate } from "../lib/validators/index.ts";
import { reflectionGetReplyQuerySchema, reflectionGetReplyParamSchema, reflectionGetSchema, reflectionPostSchema, reflectionPatchchema, reflectionParamSchema } from "../lib/validators/reflection.ts"

// Middleware Imports
import { authOptionalMiddleware } from "../middleware/authOptional.ts"
import { rateLimitMiddleware } from "../middleware/rateLimiter.ts";
import { authMiddleware } from "../middleware/auth.ts";

const reflection = new Hono<{ Variables: AppVariables}>();

/**
 * GET / - Root reflection messages
 * Behaviour: Returns a paginated array of root reflections for a thread.
 * Middleware: `validate("query", reflectionGetSchema)`.
 * Query:
 * - threadId : The master thread ID from the Podcast or Story
 * - cursorId : Optional reflection cursor ID for pagination
 */
reflection.get("/", validate("query", reflectionGetSchema), async (c) => {
    try {
        const q = c.req.valid("query");
        const { threadId, cursorId } = q; // Uses the master threadId
        
        const limit = 5; 

        // Fetch limit + 1 (6 items) to evaluate if there is a next page
        const reflections = await prisma.reflection.findMany({
            where: {
                threadId: threadId, 
                parentId: null // Pull ONLY top-level thread starters
            },
            take: limit + 1, 
            cursor: cursorId ? { id: cursorId } : undefined,
            skip: cursorId ? 1 : 0, // Skips the cursor element itself so it isn't duplicated
            orderBy: [{ createdAt: 'desc' }, { id: 'asc' }]
        });

        // Determine the precise next cursor for the "Load More" action
        let nextCursor: string | null = null;
        if (reflections.length > limit) {
            const nextItem = reflections.pop(); // Remove the extra 6th item from the array payload
            nextCursor = nextItem!.id;          // Use its ID as the definitive next page pointer
        }

        return c.json({ data: reflections, nextCursor }, 200);
    } catch (error) {
        console.error("Error fetching reflections:", error);
        return c.json({ error: "Failed to fetch reflections" }, 500);
    }
});

/**
 * GET / - Reflection message replies
 * Behaviour: Returns a paginated array of reflection message replies.
 * Middleware: `validate("query", reflectionGetSchema)`.
 * Params:
 * - id : The parent message Id from Podcast or Story
 * Query:
 * - cursorId   : Optional reflection cursor ID for pagination
 */
reflection.get("/:id/replies", validate("param", reflectionGetReplyParamSchema), validate("query", reflectionGetReplyQuerySchema), async (c) => {
    try {
        const p = c.req.valid("param");
        const id = p.id; // The parent message Id

        const q = c.req.valid("query");
        const cursorId = q.cursorId; // Uses the message Id
        
        const limit = 5; 

        // Fetch limit + 1 (6 items) to evaluate if there is a next page
        const reflections = await prisma.reflection.findMany({
            where: {
                parentId: id
            },
            take: limit + 1, 
            cursor: cursorId ? { id: cursorId } : undefined,
            skip: cursorId ? 1 : 0, // Skips the cursor element itself so it isn't duplicated
            orderBy: [{ createdAt: 'desc' }, { id: 'asc' }]
        });

        // Determine the precise next cursor for the "Load More" action
        let nextReplyCursor: string | null = null;
        if (reflections.length > limit) {
            const nextItem = reflections.pop(); // Remove the extra 6th item from the array payload
            nextReplyCursor = nextItem!.id;     // Use its ID as the definitive next page pointer
        }

        return c.json({ data: reflections, nextReplyCursor }, 200);
    } catch (error) {
        console.error("Error fetching reflections:", error);
        return c.json({ error: "Failed to fetch reflections" }, 500);
    }
});

/**
 * POST / - Post a reflection
 * Middleware   : rateLimitMiddleware, 
 *                authOptionalMiddleware,
 *                verify("form", reflectionPostSchema)
 * Behaviour    : Post a reflection or reply to existing reflection message
 * JSON:
 * - threadId   : The ID of the container Thread
 * - text       : The reflection content
 * - parentId   : Optional string ID of a parent reflection if replying
 * - isAnonymous: Optional boolean. Defaults to false.
 */
reflection.post("/", rateLimitMiddleware, authOptionalMiddleware, validate("json", reflectionPostSchema), async (c) => {
    try {
        const authUser = c.get("user");
        const j = c.req.valid("json");

        // Validate that the target master Thread container actually exists
        const threadExists = await prisma.thread.findUnique({
            where: { id: j.threadId }
        });
        if (!threadExists) {
            return c.json({ error: "Thread container not found" }, 404);
        }

        // Validate Parent Reflection (if it's a reply)
        if (j.parentId) {
            const parent = await prisma.reflection.findUnique({
                where: { id: j.parentId }
            });
            if (!parent) {
                return c.json({ error: "Parent reflection not found" }, 404);
            }
        }

        // Evaluate User Context & Handle Anonymity safely without DB fallbacks
        let targetUserId: number | null = null;
        let targetUserName = "Anonymous";

        const postAsAnonymous = j.isAnonymous === true;

        if (authUser && !postAsAnonymous) {
            // Logged-in user who wants their identity attached
            targetUserId = authUser.id;
            
            // Look up their name safely from the database
            const userRecord = await prisma.user.findUnique({
                where: { id: targetUserId },
                select: { name: true }
            });

            if (!userRecord) {
                return c.json({ error: "User record not found" }, 404);
            }
            targetUserName = userRecord.name;
        } else {
            // User is unauthenticated OR explicitly chose to post anonymously.
            // We keep targetUserId as null (allowed by our optional userId field) 
            // and keep targetUserName as "Anonymous"
            targetUserId = null;
            
            // If the isAnonymous fields is false, 
            // it is an error as unauthenticated user cannot post as a user
            if (j.isAnonymous !== undefined && j.isAnonymous === false) {
                return c.json({ error: "Unauthenticated user cannot post as a user" }, 401);
            }
        }

        // Create the Database Entry
        const reflection = await prisma.reflection.create({
            data: {
                userId: targetUserId,      // Will be an Int or null in the database
                userName: targetUserName,  // "Anonymous" or the DB authenticated user name
                threadId: j.threadId,
                parentId: j.parentId || null,
                text: j.text,
            },
        });

        return c.json({ message: "Reflection posted", ok: true, reflection }, 201);

    } catch (error) {
        console.error("Reflection creation error:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return c.json({ error: "Database constraint failure", details: error.message }, 400);
        }
        return c.json({ error: "Failed to create reflection" }, 500);
    }
});


/**
 * PATCH /:id/heart - Heart a reflection
 * Middleware   : rateLimitMiddleware
 * authMiddleware
 * validate("param", reflectionHeartSchema)
 * Behaviour    : Add 1 heart to a reflection message uniquely per user.
 * Uses a transaction to write to the Heart join table
 * and simultaneously increment the reflection's heartsCount.
 * Param        :
 * - id         : The string ID of the reflection to increment heart (passed as a URL path parameter).
 */
reflection.patch("/:id/heart", rateLimitMiddleware, authMiddleware, validate("param", reflectionParamSchema), async (c) => {
    try {
        const authUser = c.get("user");
        const p = c.req.valid("param");
        const reflectionId = p.id;

        // Run the atomic operation
        const [_heart, updatedReflection] = await prisma.$transaction([
            // Create the unique Heart record
            prisma.heart.create({
                data: {
                    userId: authUser.id,
                    reflectionId: reflectionId,
                },
            }),

            // Increment the cached counter. Throws P2025 automatically if ID doesn't exist.
            prisma.reflection.update({
                where: { id: reflectionId },
                data: {
                    heartsCount: {
                        increment: 1,
                    },
                },
            }),
        ]);

        return c.json({ message: "Reflection hearted", ok: true, reflection: updatedReflection }, 200);

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Target record unique constraint violation (User already liked it)
            if (error.code === "P2002") {
                return c.json({ error: "You have already hearted this reflection" }, 409); // 409 Conflict
            }
            // Record to update not found (Reflection does not exist)
            if (error.code === "P2003") {
                return c.json({ error: "Reflection message not found" }, 404); // 404 Not Found
            }
        }

        // Catch-all for genuine 500 runtime/connection errors
        console.error("Reflection heart system failure:", error);
        return c.json({ error: "Failed to heart reflection due to a server error" }, 500);
    }
});

/**
 * DELETE /:id/heart - Unheart a reflection
 * Middleware   : rateLimitMiddleware
 * authMiddleware
 * validate("param", reflectionParamSchema)
 * Behaviour    : Remove 1 heart from a reflection message uniquely per user.
 * Uses an atomic transaction to delete from the Heart join table
 * and simultaneously decrement the reflection's heartsCount.
 * Param        :
 * - id         : The string ID of the reflection to decrement heart (passed as a URL path parameter).
 */
reflection.delete("/:id/heart", rateLimitMiddleware, authMiddleware, validate("param", reflectionParamSchema), async (c) => {
    try {
        const authUser = c.get("user");
        const p = c.req.valid("param");
        const reflectionId = p.id;

        // Run the atomic operation
        const [_heart, updatedReflection] = await prisma.$transaction([
            // Delete the specific Heart record using its composite unique key
            prisma.heart.delete({
                where: {
                    user_reflection_heart_unique: {
                        userId: authUser.id,
                        reflectionId: reflectionId,
                    },
                },
            }),

            // Decrement the cached counter directly on the Reflection model
            prisma.reflection.update({
                where: { id: reflectionId },
                data: {
                    heartsCount: {
                        decrement: 1,
                    },
                },
            }),
        ]);

        return c.json({ message: "Reflection unhearted", ok: true, reflection: updatedReflection }, 200);

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2025: Record to delete not found (User never hearted it, or the reflection doesn't exist)
            if (error.code === "P2025") {
                return c.json({ error: "Reflection already unhearted" }, 404); // 404 Not Found
            }
        }

        // Catch-all for true 500 runtime/connection errors
        console.error("Reflection unheart system failure:", error);
        return c.json({ error: "Failed to unheart reflection due to a server error" }, 500);
    }
});

/**
 * PATCH /:id - Edit a user's own reflection message
 * Middleware   : 
 * - rateLimitMiddleware, 
 * - authMiddleware, 
 * - validate("param", reflectionParamSchema), 
 * - validate("json", reflectionPatchchema), 
 * Behaviour    : Update the text of a reflection message, ensuring the authenticated
 * user is the original author of the message.
 * Param:
 * - id     : The string ID of the reflection to edit (passed as a URL path parameter).
 * JSON:
 * - text   : The new string content of the reflection message (passed in JSON body).
 */
reflection.patch("/:id", 
    rateLimitMiddleware, 
    authMiddleware, 
    validate("param", reflectionParamSchema), 
    validate("json", reflectionPatchchema), 
    async (c) => {
    try {
        const authUser = c.get("user");
        const p = c.req.valid("param");
        const body = c.req.valid("json");
        const reflectionId = p.id;

        // Fetch the reflection to verify existence and ownership
        const reflection = await prisma.reflection.findUnique({
            where: { id: reflectionId },
            select: { userId: true } // Only select userId to keep the query lightweight
        });

        // 404 Error: The reflection simply doesn't exist in the database
        if (!reflection) {
            return c.json({ error: "Reflection message not found" }, 404);
        }

        // 403 Error: The reflection exists, but the userId doesn't match the authenticated user
        if (reflection.userId !== authUser.id) {
            return c.json({ error: "Unauthorized: You can only edit your own reflections" }, 403);
        }

        // Perform the update now that validation checks have passed safely
        const updatedReflection = await prisma.reflection.update({
            where: { id: reflectionId },
            data: {
                text: body.text,
            },
        });

        const isEdited = (updatedReflection.updatedAt.getTime() - updatedReflection.createdAt.getTime()) > 1000;

        return c.json({ message: "Reflection updated successfully", ok: true, isEdited, reflection: updatedReflection }, 200);

    } catch (error) {
        // Catch-all for true 500 runtime/connection errors
        console.error("Reflection edit system failure:", error);
        return c.json({ error: "Failed to update reflection due to a server error" }, 500);
    }
});

/**
 * DELETE /:id - Delete a reflection message
 * Middleware   : 
 * - rateLimitMiddleware, 
 * - authMiddleware, 
 * - validate("param", reflectionParamSchema), 
 * - validate("json", reflectionPatchchema), 
 * Behaviour    : Delete a reflection message, ensuring the authenticated user is superuser
 * Param:
 * - id     : The string ID of the reflection to delete (passed as a URL path parameter).
 */
reflection.delete("/:id",
    authMiddleware,
    validate("param", reflectionParamSchema),
    async (c) => {
        try {
            const authUser = c.get("user");
            const p = c.req.valid("param")
            const reflectionId = p.id;

            if (authUser.role !== "SUPERUSER") {
                return c.json({error: "Unauthorized"}, 401);
            }

            // Delete reflection message
            await prisma.reflection.delete({ where: { id: reflectionId } });

            return c.json({ message: "Reflection deleted", ok: true}, 200);

        } catch (error) {
            // Catch-all for true 500 runtime/connection errors
            console.error("Reflection edit system failure:", error);

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // P2025: Record to delete not found
                if (error.code === "P2025") {
                    return c.json({ error: "Reflection is not found" }, 404); // 404 Not Found
                }
            }

            return c.json({ error: "Failed to update reflection due to a server error" }, 500);
        }
    }
);

export default reflection;