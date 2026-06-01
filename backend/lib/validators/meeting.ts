// lib/validators/meeting.ts
import z from 'zod';
import { cuidRule } from "./common.ts";

/**
 * Common rules for meeting endpoints
 */
const textRule = z.string()
  .min(1, "Title is required")
  .max(100, "Title must be 100 characters or less")
  .regex(/^[a-zA-Z0-9\s.,!?;:'"()-]+$/, "Title contains invalid characters");

const dateTimeRule = z.iso.datetime()
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z?$/, "Invalid ISO Date format"))
  .transform((val) => new Date(val));

/** GET Schemas */
export const meetingGetListSchema = z.object({
  page: z.coerce.number().positive().int().optional(),
  limit: z.coerce.number().positive().int().max(100).optional(),
  search: z.string().optional(),
});

export const meetingGetByIdSchema = z.object({
  id: cuidRule,
});

/** POST Schemas */
export const meetingPostSchema = z.object({
  title: textRule,
  dateTime: dateTimeRule,
  meetingLink: z.url("Must be a valid URL"),
});

/** PATCH Schemas */
export const meetingPatchParamSchema = z.object({
  id: cuidRule,
});

export const meetingPatchJSONSchema = z.object({
  title: textRule.optional(),
  dateTime: dateTimeRule.optional(),
  meetingLink: z.url().optional(),
});

/** DELETE Schemas */
export const meetingDeleteParamSchema = z.object({
  id: cuidRule,
});
