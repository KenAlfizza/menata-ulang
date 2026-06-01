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
    meetingPatchParamSchema,
    meetingPatchJSONSchema,

} from "../lib/validators/meeting.ts";

const meeting = new Hono<{ Variables: AppVariables}>();

/**
 * GET /host - Fetch a paginated list of meetings hosted by an authenticated user with host permission
 *
 * Middleware: `authMiddleware`, `validate("query", meetingGetListSchema)`.
 * Authorization: Users with 'HOST' or 'SUPERUSER' roles only. Filters results strictly by the logged-in user's ID.
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
 * Middleware: `authMiddleware`, `validate("json", meetingPostSchema)`.
 * Authorization: Users with 'HOST' or 'SUPERUSER' roles only.
 *
 * JSON:
 * - title      : Meeting title
 * - dateTime   : Meeting date and time (ISO string)
 * - meetingLink: URL link for the meeting
 *
 * Behavior: 
 * - Validates that the authenticated user possesses an allowed role.
 * - Creates a new meeting record in the database, connecting the current user as the host.
 * - Parses the provided dateTime string into a native Date object before insertion.
 *
 * Responses:
 * - 200: Success payload with a confirmation message and the full meeting object
 * - 403: Forbidden if the user lacks the necessary role permissions
 * - 500: Internal server error if the database operation fails
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
 * PATCH /host/:id - Update an existing meeting owned by the host
 *
 * Middleware: `authMiddleware`, `validate("param", meetingGetByIdSchema)`, `validate("json", meetingUpdateSchema)`.
 * Authorization: Users with 'HOST' or 'SUPERUSER' roles. Hosts can only update their own meetings.
 *
 * Params:
 * - id         : The unique identifier of the meeting to update
 *
 * JSON (All fields optional):
 * - title      : Updated meeting title
 * - dateTime   : Updated meeting date time
 * - meetingLink: Updated meeting link
 *
 * Behavior:
 * - Validates user permissions ('HOST' or 'SUPERUSER').
 * - Verifies the meeting exists and belongs strictly to the authenticated host.
 * - Updates the fields provided in the request body.
 *
 * Responses:
 * - 200: success payload with updated meeting details
 * - 403: forbidden (not the host or insufficient role)
 * - 404: meeting not found
 * - 500: internal server error
 */
/**
 * PATCH /host/:id - Partially update an existing meeting owned by the host
 *
 * Middleware: `authMiddleware`, `validate("param", meetingGetByIdSchema)`, `validate("json", meetingPatchSchema)`.
 * Authorization: Users with 'HOST' or 'SUPERUSER' roles. Hosts can only update their own meetings.
 *
 * Params:
 * - id         : The unique identifier of the meeting to update
 *
 * JSON (All fields optional):
 * - title      : Updated meeting title
 * - dateTime   : Updated meeting date time
 * - meetingLink: Updated meeting link
 *
 * Behavior:
 * - Validates user permissions ('HOST' or 'SUPERUSER').
 * - Verifies the meeting exists and belongs strictly to the authenticated host.
 * - Updates only the specific fields provided in the payload.
 *
 * Responses:
 * - 200: success payload with updated meeting details
 * - 403: forbidden (not the host or insufficient role)
 * - 404: meeting not found
 * - 500: internal server error
 */
meeting.patch("/host/:id",
    authMiddleware,
    validate("param", meetingPatchParamSchema),
    validate("json", meetingPatchJSONSchema), 
    async (c) => {
        try {
            // Validate current user permission
            const user = c.get("user");
            if (!["HOST", "SUPERUSER"].includes(user.role)) {
                return c.json({ error: "Forbidden" }, 403);
            }

            // Get the meeting elements from params
            const p = c.req.valid("param");
            const id = p.id;

            // Get the meeting elements from json body
            const b = c.req.valid("json");
            const title = b.title;
            const dateTime = b.dateTime;
            const meetingLink = b.meetingLink;

            // Verify meeting exists
            const existingMeeting = await prisma.meeting.findUnique({
                where: { id }
            });

            if (!existingMeeting) {
                return c.json({ error: "Meeting not found" }, 404);
            }

            // Verify resource ownership
            if (existingMeeting.hostId !== user.id) {
                return c.json({ error: "Forbidden" }, 403);
            }

            // Execute partial update
            const updatedMeeting = await prisma.meeting.update({
                where: { id },
                data: {
                    title: title !== undefined ? title : undefined,
                    dateTime: dateTime !== undefined ? new Date(dateTime) : undefined,
                    meetingLink: meetingLink !== undefined ? meetingLink : undefined,
                },
            });

            return c.json({ message: "Meeting updated", ok: true, meeting: updatedMeeting });
        } catch {
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

/**
 * DELETE /host/:id - Delete a meeting owned by the host
 *
 * Middleware: `authMiddleware`, `validate("param", meetingGetByIdSchema)`.
 * Authorization: Users with 'HOST' or 'SUPERUSER' roles. Hosts can only delete their own meetings.
 *
 * Params:
 * - id         : The unique identifier of the meeting to delete
 *
 * Behavior:
 * - Validates user permissions ('HOST' or 'SUPERUSER').
 * - Verifies the meeting exists and belongs strictly to the authenticated host.
 * - Deletes the record from the database.
 *
 * Responses:
 * - 200: success payload confirming deletion
 * - 403: forbidden (not the host or insufficient role)
 * - 404: meeting not found
 * - 500: internal server error
 */
meeting.delete("/host/:id",
    authMiddleware,
    validate("param", meetingGetByIdSchema),
    async (c) => {
        try {
            // Validate current user permission
            const user = c.get("user");
            if (!["HOST", "SUPERUSER"].includes(user.role)) {
                return c.json({ error: "Forbidden" }, 403);
            }

            // Get the meeting elements
            const p = c.req.valid("param");
            const id = p.id;

            // Verify meeting exists
            const existingMeeting = await prisma.meeting.findUnique({
                where: { id }
            });

            if (!existingMeeting) {
                return c.json({ error: "Meeting not found" }, 404);
            }

            // Verify resource ownership
            if (existingMeeting.hostId !== user.id) {
                return c.json({ error: "Forbidden" }, 403);
            }

            // Execute delete
            await prisma.meeting.delete({
                where: { id }
            });

            return c.json({ message: "Meeting deleted", ok: true });
        } catch {
            return c.json({ error: "Internal server error" }, 500);
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
