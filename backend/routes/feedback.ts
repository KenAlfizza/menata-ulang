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
 * - Reads metadata directly from the incoming form/JSON payload rather than database user contexts.
 * - If `isAnonymous` evaluates to true, values default to "Anonymous" and an empty string respectively.
 * - If `isAnonymous` is false, it sanitizes input or defaults empty structures to "Guest".
 *
 * Responses:
 * - 201: Success payload acknowledging entry creation alongside the newly generated record ID
 * - 400/500: Handled by validation or global error middleware
 */
feedback.post("/",
    authOptionalMiddleware,
    validate("json", feedbackPostSchema),
    async (c) => {
        try {
            const body = c.req.valid("json");

            // Fallback to "Anonymous" or empty string if fields are empty
            const finalName = body.isAnonymous 
                ? "Anonymous" 
                : (body.userName?.trim() || "Guest");

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
 * - resolved : (Optional) Explicit string filter ("true" or "false") to isolate items by resolution status
 *
 * Behavior:
 * - Validates that the requesting client possesses adequate administrative credentials.
 * - Applies optional filter expressions onto the targeting Prisma condition query layer.
 * - Executes a unified database transaction block to collect aggregate counts and flat row structures.
 *
 * Responses:
 * - 200: Success payload containing the flat feedback list and associated pagination metadata
 * - 403: Forbidden if the user lacks the necessary administrative role permissions
 * - 400/500: Handled by validation or global error middleware
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

            return c.json({
                message: "Feedback records fetched successfully",
                ok: true,
                data: feedbackItems,
                meta: { page, limit, total }
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
 * - Instantly yields a 404 response if the targeted feedback row cannot be verified.
 * - Commits mutations directly against the targeted entry row structure upon validation success.
 *
 * Responses:
 * - 200: Success payload displaying individual row identifiers along with changed state flags
 * - 403: Forbidden if the user lacks sufficient role permissions
 * - 404: Feedback record not found
 * - 400/500: Handled by validation or global error middleware
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

export default feedback;