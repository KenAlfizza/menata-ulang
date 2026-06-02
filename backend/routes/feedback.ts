import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { prisma, Prisma } from "../lib/prisma.ts";
import { validate } from "../lib/validators/index.ts";

// Middleware Imports
import { authOptionalMiddleware } from "../middleware/authOptional.ts";
import { authMiddleware } from "../middleware/auth.ts";
import { rateLimitMiddleware } from "../middleware/rateLimiter.ts";

// Validators
import { 
    feedbackPostSchema, 
    feedbackGetListSchema,
    feedbackParamSchema,
    feedbackPatchSchema 
} from "../lib/validators/feedback.ts";

const feedback = new Hono<{ Variables: AppVariables }>();

/**
 * POST / - Submit feedback (Open to all users)
 *
 * Middleware: `authOptionalMiddleware`, `validate("json", feedbackPostSchema)`
 * Authorization: Public access.
 *
 * JSON Body:
 * - content     : The main body text of the feedback (min 3, max 2000 chars)
 * - userName    : (Optional) The name of the submitter provided via form input
 * - email       : (Optional) Contact email address provided via form input
 * - isAnonymous : (Optional) Boolean flag to obscure name and email fields (defaults to false)
 *
 * Behavior:
 * - Validates basic structural shape via Zod.
 * - Checks if the user is posting as non-anonymous but left the `userName` empty; throws a 400 Bad Request error if so.
 * - If `isAnonymous` is true, sets identity fields to "Anonymous" and an empty string.
 * - Falls back to "Guest" for any other valid structural bypass edge cases.
 *
 * Responses:
 * - 201: Success payload acknowledging entry creation alongside the newly generated record ID
 * - 400: Bad Request if non-anonymous submission lacks a valid name
 * - 500: Handled by global error middleware
 */
feedback.post("/",
    authOptionalMiddleware,
    rateLimitMiddleware,
    validate("json", feedbackPostSchema),
    async (c) => {
        try {
            const body = c.req.valid("json");
            const trimmedName = body.userName?.trim();

            // If NOT anonymous, and no name is provided (or it's just whitespace) return error
            if (!body.isAnonymous && (!trimmedName || trimmedName === "")) {
                return c.json({
                    success: false,
                    error: "Name is required when submission is not anonymous"
                }, 400);
            }

            // Determine final database values based on identity rules
            const finalName = body.isAnonymous 
                ? "Anonymous" 
                : (trimmedName || "Guest");

            const finalEmail = body.isAnonymous 
                ? "" 
                : (body.email?.trim() || "");

            const newFeedback = await prisma.feedback.create({
                data: {
                    content: body.content,
                    userName: finalName,
                    email: finalEmail,
                },
            });

            return c.json({
                message: "Feedback submitted successfully",
                ok: true,
                id: newFeedback.id
            }, 201);
        } catch {
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

/**
 * GET / - Fetch a paginated list of all feedback submissions
 *
 * Middleware: `authMiddleware`, `validate("query", feedbackGetListSchema)`
 * Authorization: Users with 'HOST' or 'SUPERUSER' roles only.
 *
 * Query Parameters:
 * - page     : (Optional) The page number for pagination (defaults to 1)
 * - limit    : (Optional) The number of items to return per page (defaults to 10, max 100)
 * - resolved : (Optional) Explicit string filter ("true" or "false") to isolate items by completion status
 *
 * Behavior:
 * - Validates that the requesting client possesses adequate administrative credentials.
 * - Evaluates optional filter expressions onto the targeting Prisma condition query layer.
 * - Executes a unified database transaction block to collect both aggregate counting metrics and subset target rows.
 * - Post-processes the resulting dataset to truncate long text contents to a preview maximum threshold (100 characters), appending ellipses where truncated.
 *
 * Responses:
 * - 200: Success payload containing the preview-optimized flat list of feedback submissions and associated pagination metadata
 * - 403: Forbidden if the user lacks the necessary administrative role permissions
 * - 500: Handled by global error middleware
 */
feedback.get("/",
    authMiddleware,
    validate("query", feedbackGetListSchema),
    async (c) => {
        try {
            const user = c.get("user");
            
            if (!["HOST", "SUPERUSER"].includes(user.role)) {
                return c.json({ error: "Forbidden" }, 403);
            }

            const q = c.req.valid("query");
            const page = q.page ?? 1;
            const limit = q.limit ?? 10;
            
            const where: Prisma.FeedbackWhereInput = {};
            if (q.resolved !== undefined) {
                where.resolved = q.resolved;
            }

            const [total, feedbackItems] = await prisma.$transaction([
                prisma.feedback.count({ where }),
                prisma.feedback.findMany({
                    where,
                    select: {
                        id: true,
                        userName: true,
                        email: true,
                        content: true,
                        resolved: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                    skip: (page - 1) * limit,
                    take: limit,
                })
            ]);

            // Truncate the content field dynamically for the list view
            const MAX_PREVIEW_LENGTH = 100;
            const processedItems = feedbackItems.map(item => ({
                ...item,
                content: item.content.length > MAX_PREVIEW_LENGTH
                    ? `${item.content.substring(0, MAX_PREVIEW_LENGTH)}...`
                    : item.content
            }));

            return c.json({
                message: "Feedback records fetched successfully",
                ok: true,
                data: processedItems,
                meta: { page, limit, total }
            });
        } catch {
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

/**
 * GET /:id - Fetch an individual feedback record by its unique ID
 *
 * Middleware: `authMiddleware`, `validate("param", feedbackParamSchema)`
 * Authorization: Users with 'HOST' or 'SUPERUSER' roles only.
 *
 * Params:
 * - id       : The unique UUID identifier of the target feedback entry
 *
 * Behavior:
 * - Verifies that the client possesses required administrative privileges.
 * - Validates the path parameter string layout via Zod.
 * - Queries the database for a matching record, executing a 404 block if absent.
 *
 * Responses:
 * - 200: Success payload returning the isolated feedback entry
 * - 403: Forbidden if the user lacks sufficient role permissions
 * - 404: Feedback record not found
 * - 500: Handled by global error middleware
 */
feedback.get("/:id",
    authMiddleware,
    validate("param", feedbackParamSchema),
    async (c) => {
        try {
            const user = c.get("user");
            
            if (!["HOST", "SUPERUSER"].includes(user.role)) {
                return c.json({ error: "Forbidden" }, 403);
            }

            const { id } = c.req.valid("param");

            const feedbackItem = await prisma.feedback.findUnique({
                where: { id }
            });

            if (!feedbackItem) {
                return c.json({ error: "Feedback record not found" }, 404);
            }

            return c.json({
                message: "Feedback record retrieved successfully",
                ok: true,
                data: feedbackItem
            });
        } catch {
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

/**
 * PATCH /:id - Toggle or change the resolved flag of a feedback entry
 *
 * Middleware: `authMiddleware`, `validate("param", feedbackParamSchema)`, `validate("json", feedbackPatchSchema)`
 * Authorization: Users with 'HOST' or 'SUPERUSER' roles only.
 *
 * Params:
 * - id       : The unique UUID identifier of the target feedback entry
 *
 * JSON Body:
 * - resolved : Target boolean state indicating if the issue is addressed
 *
 * Behavior:
 * - Verifies that the client possesses required administrative privileges.
 * - Validates parameter formats and looks up matching records in the database.
 * - Returns a 404 status instantly if the target row entry cannot be found.
 * - Applies specific attribute mutations to the matching record on validation success.
 *
 * Responses:
 * - 200: Success payload displaying individual row identifiers along with changed state flags
 * - 403: Forbidden if the user lacks sufficient role permissions
 * - 404: Feedback record not found
 * - 500: Handled by global error middleware
 */
feedback.patch("/:id",
    authMiddleware,
    validate("param", feedbackParamSchema),
    validate("json", feedbackPatchSchema),
    async (c) => {
        try {
            const user = c.get("user");
            
            if (!["HOST", "SUPERUSER"].includes(user.role)) {
                return c.json({ error: "Forbidden" }, 403);
            }

            const { id } = c.req.valid("param");
            const body = c.req.valid("json");

            const targetFeedback = await prisma.feedback.findUnique({
                where: { id }
            });

            if (!targetFeedback) {
                return c.json({ error: "Feedback record not found" }, 404);
            }

            const updatedFeedback = await prisma.feedback.update({
                where: { id },
                data: {
                    resolved: body.resolved
                },
                select: {
                    id: true,
                    resolved: true
                }
            });

            return c.json({
                message: `Feedback marked as ${updatedFeedback.resolved ? 'resolved' : 'unresolved'}`,
                ok: true,
                data: updatedFeedback
            });
        } catch {
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

/**
 * DELETE /:id - Remove a feedback entry permanently from the database
 *
 * Middleware: `authMiddleware`, `validate("param", feedbackParamSchema)`
 * Authorization: Users with 'HOST' or 'SUPERUSER' roles only.
 *
 * Params:
 * - id       : The unique UUID identifier of the target feedback entry
 *
 * Behavior:
 * - Verifies that the client possesses required administrative privileges.
 * - Looks up the targeted record first to issue an immediate 404 if missing.
 * - Executes a delete call targeting the matched primary key record structure.
 *
 * Responses:
 * - 200: Success payload confirming deletion alongside the obsolete resource identifier
 * - 403: Forbidden if the user lacks sufficient role permissions
 * - 404: Feedback record not found
 * - 500: Handled by global error middleware
 */
feedback.delete("/:id",
    authMiddleware,
    validate("param", feedbackParamSchema),
    async (c) => {
        try {
            const user = c.get("user");
            
            if (!["HOST", "SUPERUSER"].includes(user.role)) {
                return c.json({ error: "Forbidden" }, 403);
            }

            const { id } = c.req.valid("param");

            const targetFeedback = await prisma.feedback.findUnique({
                where: { id }
            });

            if (!targetFeedback) {
                return c.json({ error: "Feedback record not found" }, 404);
            }

            await prisma.feedback.delete({
                where: { id }
            });

            return c.json({
                message: "Feedback record deleted successfully",
                ok: true,
                id
            });
        } catch {
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

export default feedback;