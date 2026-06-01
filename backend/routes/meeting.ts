// routes/meeting.ts
import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { prisma, Prisma } from "../lib/prisma.ts";
import { validate } from "../lib/validators/index.ts";

// Middleware Imports
import { authOptionalMiddleware } from "../middleware/authOptional.ts";
import { authMiddleware } from "../middleware/auth.ts";

// Validators
import { 
    meetingPostSchema,
    meetingGetByIdSchema,
    meetingGetListSchema, 
} from "../lib/validators/meeting.ts";

const meeting = new Hono<{ Variables: AppVariables}>();

/**
 * POST / - Create a new meeting
 *
 * Middleware: `authMiddleware`, `validate("form", meetingPostSchema)`.
 * Authorization: users with any role may create a meeting
 *
 * JSON:
 * - title      : meeting title
 * - dateTime   : meeting date time
 * - meetingLink: meeting link
 *
 * Behavior: 
 * - create the meeting with the current user as host
 * - if the database creation failed, return error
 *
 * Responses:
 * - 200: meeting payload
 * - 403: forbidden
 * - 500: internal server error
 */
meeting.post("/", 
    authMiddleware, 
    validate("json", meetingPostSchema), 
    async (c) => {
        // Validate current user permission
        const user = c.get("user");
        if (!["HOST", "SUPERUSER"].includes(user.role)) {
            return c.json({ error: "Forbidden" }, 403);
        }
        
        // Get the meeting elements
        const b = c.req.valid("json");
        const title = b.title;
        const dateTime = b.dateTime;
        const meetingLink = b.meetingLink;

        // Store to database
        try {
            // Database create
            const meeting = await prisma.meeting.create({
                data: {
                    title,
                    dateTime: new Date(dateTime),
                    meetingLink,
                    host: { connect: { id: user.id } },
                },
            });
            return c.json({ message: "Meeting created", ok: true, meeting });
        } catch {
            return c.json({ error: "Internal server error"}, 500);
        }
    }
);

/**
 * GET /:id - Fetch a meeting by its ID
 *
 * Middleware: `authOptionalMiddleware`, `validate("param", meetingGetByIdSchema)`.
 * Authorization: public access, but `meetingLink` is only visible to authenticated users.
 *
 * Params:
 * - id         : meeting unique identifier
 *
 * Behavior: 
 * - fetch the meeting and its host from the database
 * - return 404 if the meeting doesn't exist
 * - include `meetingLink` in the payload only if an authenticated user is making the request
 *
 * Responses:
 * - 200: success payload with meeting details
 * - 404: meeting not found
 * - 400/500: handled by validation or global error middleware
 */
meeting.get("/:id", 
    authOptionalMiddleware,
    validate("param", meetingGetByIdSchema), 
    async (c) => {
        try {
            const p = c.req.valid("param");
            const meetingId = p.id;

            const storedMeeting = await prisma.meeting.findUnique({ 
                where: { id: meetingId },
                include: { host: true } 
            });
            
            if (!storedMeeting) return c.json({ error: "Meeting is not found" }, 404);
            
            const user = c.get("user");
            
            // Show meetingLink for ALL authenticated users, hide for unauthenticated
            const meetingPayload = user && user.id 
                ? {
                    id: storedMeeting.id,
                    title: storedMeeting.title,
                    host: storedMeeting.host.name,
                    dateTime: storedMeeting.dateTime,
                    meetingLink: storedMeeting.meetingLink
                }
                : {
                    id: storedMeeting.id,
                    title: storedMeeting.title,
                    host: storedMeeting.host.name,
                    dateTime: storedMeeting.dateTime,
                    meetingLink: undefined
                };
                
            return c.json({ message: "Meeting fetched", ok: true, meeting: meetingPayload });
        } catch {
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

export default meeting;
