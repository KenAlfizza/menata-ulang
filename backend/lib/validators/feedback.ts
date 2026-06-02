import { z } from "zod";
/**
 * Zod validation schemas for user-related operations.
 *
 * Behavior: These schemas enforce input validation and transformations for
 * user update requests and route parameters, ensuring type safety and
 * preventing invalid data from reaching business logic.
 */
import { uuidRule } from "./common.ts";

/**
 * Schema for updating user information.
 *
 * Fields:
 * - name: Optional string. Must be at least 1 character if provided.
 *
 * Behavior: Validates user update payloads to ensure the `name` field, if
 * present, is not empty.
 */
export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
});

/**
 * Schema for validating route parameters containing an ID.
 *
 * Fields:
 * - id: Required string from route parameters. Parsed into an integer.
 *
 * Behavior: Transforms the string `id` parameter to a number and ensures
 * it is a positive integer. Throws an error if invalid.
 */
export const paramsSchema = z.object({
  id: z.string().min(1, "Id is required")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Invalid id"),
});

/**
 * Schema for submitting feedback entries.
 *
 * Fields:
 * - userName: Optional string or empty literal. Must be at least 1 character if provided.
 * - email: Optional string or empty literal. Must conform to a valid email format if provided.
 * - content: Required string. Must be between 3 and 2000 characters long.
 * - isAnonymous: Optional boolean. Defaults to false.
 *
 * Behavior: Validates public feedback payloads, ensuring the main text meets length constraints
 * while providing soft fallbacks for identification data based on anonymity flags.
 */
export const feedbackPostSchema = z.object({
  userName: z.string().min(1, "Name is required").optional().or(z.literal("")),
  email: z.email("Invalid email address").optional().or(z.literal("")),
  content: z.string().min(3, "Feedback must be at least 3 characters long").max(2000),
  isAnonymous: z.boolean().optional().default(false),
});

/**
 * Schema for validating feedback route parameters containing an ID.
 *
 * Fields:
 * - id: Required string from route parameters. Must conform to a valid UUID format.
 *
 * Behavior: Ensures the provided resource identifier is structurally sound before executing
 * read, update, or delete operations on specific feedback data.
 */
export const feedbackParamSchema = z.object({
  id: uuidRule,
});

/**
 * Schema for modifying the resolution state of a feedback record via JSON body.
 *
 * Fields:
 * - resolved: Required boolean flag indicating if the issue is addressed.
 *
 * Behavior: Restricts the patching payload strictly to administrative state changes, forcing
 * an explicit boolean assignment.
 */
export const feedbackPatchSchema = z.object({
  resolved: z.boolean({ error: "resolved flag is required" }),
});

/**
 * Schema for parsing and validating feedback list query parameters.
 *
 * Fields:
 * - page: Optional coerced positive integer. Defaults to 1.
 * - limit: Optional coerced positive integer up to a maximum of 100. Defaults to 10.
 * - resolved: Optional string. Transformed into a boolean (true/false) or left undefined.
 *
 * Behavior: Coerces and sanitizes incoming string query parameters into proper runtime numbers 
 * and booleans to safely drive pagination limits and conditional filtering layers.
 */
export const feedbackGetListSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  resolved: z.string().transform(val => val === "true" ? true : val === "false" ? false : undefined).optional(),
});