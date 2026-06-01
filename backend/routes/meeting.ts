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
 * GET /host - Fetch a paginated list of meetings hosted by an authenticated user with host permission
 *
 * Middleware: `authMiddleware`, `validate("query", meetingGetListSchema)`.
 * Authorization: Authenticated users only. Filters results strictly by the logged-in user's ID.
 *
 * Query Parameters:
 * - page   : (Optional) The page number for pagination (defaults to 1)
 * - limit  : (Optional) The number of items to return per page (defaults to 10)
 * - search : (Optional) Case-insensitive search filter matching against `title` or `meetingLink`
 *
 * Behavior:
 * - Extracts the current authenticated host's ID from context.
 * - Constructs a where clause targeting only the host's hosted meetings.
 * - If a search term exists, appends an OR clause to match the term in either titles or links.
 * - Executes a database transaction to concurrently fetch the total count and the paginated subset.
 *
 * Responses:
 * - 200: success payload containing the list of meetings and pagination metadata
 * - 400/500: handled by validation or global error middleware
 */
meeting.get("/host",
    authMiddleware, 
    validate("query", meetingGetListSchema), 
    async (c) => {
        try {
            // Get queries
            const q = c.req.valid("query");
            const page = q.page ?? 1;
            const limit = q.limit ?? 10;
            const search = q.search?.trim();
            
            // Meeting host
            const user = c.get("user");
            const hostId = user.id;
            if (!["HOST", "SUPERUSER"].includes(user.role)) {
                return c.json({ error: "Forbidden" }, 403);
            }

            // Strictly filter by user's own meetings
            const where: Prisma.MeetingWhereInput = { 
                hostId: { equals: hostId } 
            };

            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { meetingLink: { contains: search, mode: 'insensitive' } },
                ];
            }

            const [total, meetings] = await prisma.$transaction([
                prisma.meeting.count({ where }),
                prisma.meeting.findMany({
                    where,
                    select: {
                        id: true,
                        title: true,
                        hostId: true,
                        host: { select: { id: true, name: true } },
                        dateTime: true,
                        meetingLink: true,
                        createdAt: true,
                    },
                    orderBy: { dateTime: 'desc' },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
            ]);

            return c.json({ 
                data: meetings, 
                meta: { page, limit, total } 
            });
        } catch {
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

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
meeting.post("/host", 
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
