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

export default meeting;
