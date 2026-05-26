import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { prisma, Prisma } from "../lib/prisma.ts";

import { validate } from "../lib/validators/index.ts";
import { reflectionGetReplyQuerySchema, reflectionGetReplyParamSchema, reflectionGetSchema, reflectionPostSchema } from "../lib/validators/reflection.ts"

// Middleware Imports
import { authOptionalMiddleware } from "../middleware/authOptional.ts"

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
 * Middleware   : verify("form", reflectionPostSchema)
 * Behaviour    : Post a reflection or reply to existing reflection message
 * JSON:
 * - threadId   : The ID of the container Thread
 * - text       : The reflection content
 * - parentId   : Optional string ID of a parent reflection if replying
 * - isAnonymous: Optional boolean. Defaults to false.
 */
reflection.post("/", authOptionalMiddleware, validate("json", reflectionPostSchema), async (c) => {
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
            if (j.isAnonymous === false) {
                return c.json({ error: "Unauthenticated user cannot post as a user" }, 404);
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

export default reflection;