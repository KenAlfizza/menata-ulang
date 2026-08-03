/** Zod validation schemas for podcast endpoints **/

import { cuid2, z } from 'zod';
import { cuidRule, idRule } from "./common.ts";
import { SupportedAudioType, SUPPORTED_AUDIO_TYPES, isSupportedAudioType, SupportedImageType, SUPPORTED_IMAGE_TYPES, isSupportedImageType, verifyMagicBytes } from "../security/files.ts";

const PODCAST_MAX_SIZE_MB = 25;
const PODCAST_MAX_SIZE_BYTES = PODCAST_MAX_SIZE_MB * 1024 * 1024;

const IMAGE_MAX_SIZE_MB = 15;
const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024;


/**
 * Podcast validation rule
 * 
 * Validates uploaded `File` objects
 * - Must be a File instance
 * - Non-empty (size > 0)
 * - Maximum size: PODCAST_MAX_SIZE_MB
 * - MIME type must be one of: MP3, AAC, FLAC, WAV
 */
const podcastAudioRule = z
    .instanceof(File, { message: "Please upload an audio file" })
    .refine((file) => file.size > 0, "Podcast file cannot be empty")
    .refine((file) => file.size <= PODCAST_MAX_SIZE_BYTES, `Podcast file must be ${PODCAST_MAX_SIZE_MB}MB or smaller`)
    .refine((file) => isSupportedAudioType(file.type), `Invalid audio type. Accepted types: ${SUPPORTED_AUDIO_TYPES.join(", ")}`)
    .refine(
        async (file) => {
            try {
                await verifyMagicBytes(file, file.type as SupportedAudioType);
                return true; 
            } catch {
                return false;
            }
        },
        { message: "Audio content does not match declared MIME type" }
    );


/**
 * Image validation rule
 *
 * Validates uploaded `File` objects:
 * - Must be a File instance
 * - Non-empty (size > 0)
 * - Maximum size: IMAGE_MAX_SIZE_MB
 * - MIME type must be one of: JPEG, PNG, WebP
 *
 * Note: Runtime must provide `File` (Deno/Web API environment).
 */
const podcastImageRule = z
    .instanceof(File, 
        { message: "Please upload an image file" }
    )
    .refine((file) => file.size > 0,
        "Image file cannot be empty",
    )
    .refine((file) => file.size <= IMAGE_MAX_SIZE_BYTES,
        `Image file must be ${IMAGE_MAX_SIZE_MB}MB or smaller`,
    )
    .refine((file) => isSupportedImageType(file.type), `Invalid image type. Accepted types: ${SUPPORTED_IMAGE_TYPES.join(", ")}`)
    .refine(
        async (file) => {
            try {
                await verifyMagicBytes(file, file.type as SupportedImageType);
                return true; 
            } catch {
                return false;
            }
        },
        { message: "Image content does not match declared MIME type" }
    );


/**
 * Podcast upload body schema
 * Validates the multipart form body for podcast upload endpoints:
 * - file: File
 * - title: string (max 100 chars)
 * - description: string (max 200 chars)
 * - transcript: string
 */
export const podcastPostSchema = z.object({
    slug: z.string().min(1, "Slug is required").max(100, "Slug must be 100 characters or fewer"),
    title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or fewer"),
    description: z.string().max(200, "Description must be 200 characters or fewer"),
    transcript: z.string().min(1, "Transcript is required"),
    
    audio: podcastAudioRule,
    image: podcastImageRule.optional(),
});

/** GET Schemas **/
export const podcastGetByIdSchema = z.object({
    id: cuidRule,
});

export const podcastGetListSchema = z.object({
    page: z.coerce.number().int().min(1).max(1000).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().max(100, "Search keyword must be 100 characters or fewer").optional(),
});

/** PATCH Schemas **/
export const podcastPatchFormSchema = 
    podcastPostSchema.partial().extend({
        published: z.preprocess((val) => {
            if (val === "true" || val === true) return true;
            if (val === "false" || val === false) return false;
            return val;
        }, z.boolean().optional()),
    });
export const podcastPatchParamSchema = z.object({
    id: cuidRule,
});

/** DELETE Schemas **/
export const podcastDeleteParamSchema = z.object({
    id: cuidRule,
})