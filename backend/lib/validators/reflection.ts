/** Zod validation schemas for reflection endpoints */
import z from 'zod';
import { uuidRule } from "./common.ts";

/** GET Schemas */
export const reflectionGetSchema = z.object({
    threadId: uuidRule,
    cursorId: uuidRule.optional(),
})

export const reflectionGetReplyParamSchema = z.object({
    id: uuidRule,
})

export const reflectionGetReplyQuerySchema = z.object({
    cursorId: uuidRule.optional(),
})

/** POST Schemas */
export const reflectionPostSchema = z.object({
    threadId: uuidRule,
    parentId: uuidRule.optional(),
    text: z.string()
        .min(1, "Reflection is required")
        .max(250, "Reflection must be 250 characters or less")
        .regex(/^[a-zA-Z0-9\s.,!?;:'"()-]+$/, "Reflection contains invalid characters"),
    isAnonymous: z.boolean().optional(),
});


/** PATCH Schemas */
export const reflectionHeartSchema = z.object({
    id: uuidRule
});