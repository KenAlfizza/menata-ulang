/** Zod validation schemas for podcast endpoints **/

import { z } from 'zod';
import { idRule } from "./common.ts";

/**
 * Accepted audio MIME types for podcast uplaods
 */
const ACCEPTED_AUDIO_TYPES = [
    "audio/mpeg",       // MP3
    "audio/aac",        // AAC
    "audio/flac",       // FLAC
    "audio/x-flac",     // FLAC (alternate)
    "audio/wav",        // WAV
    "audio/x-wav",      // WAV (legacy)
    ] as const;

const AudioMimeType = z.enum(ACCEPTED_AUDIO_TYPES);

const PODCAST_MAX_SIZE_MB = 50;
const PODCAST_MAX_SIZE_BYTES = PODCAST_MAX_SIZE_MB * 1024 * 1024;

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
    .instanceof(File, { 
        message: "Please upload an audio file" 
    })
    .refine(
        (file) => file.size > 0,
        "Podcast file cannot be empty",
    )
    .refine(
        (file) => file.size <= PODCAST_MAX_SIZE_BYTES,
        `Podcast file must be ${PODCAST_MAX_SIZE_MB}MB or smaller`,
    )
    .refine(
        (file) => (ACCEPTED_AUDIO_TYPES as readonly string[]).includes(file.type),
        `Invalid audio type. Accepted types: ${ACCEPTED_AUDIO_TYPES.join(", ")}`,
    );

/**
 * Accepted image MIME types for podcast cover art uploads
 */
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",  // JPEG
    "image/png",   // PNG
    "image/webp",  // WebP
];

const IMAGE_MAX_SIZE_MB = 5;
const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024;


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
    .instanceof(File, { 
        message: "Please upload an image file" 
    })
    .refine(
        (file) => file.size > 0,
        "Image file cannot be empty",
    )
    .refine(
        (file) => file.size <= IMAGE_MAX_SIZE_BYTES,
        `Image file must be ${IMAGE_MAX_SIZE_MB}MB or smaller`,
    )
    .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        `Invalid image type. Accepted types: ${ACCEPTED_IMAGE_TYPES.join(", ")}`,
    );

/**
 * Podcast upload body schema
 * Validates the multipart form body for podcast upload endpoints:
 * - file: File
 * - title: string (max 100 chars)
 * - description: string (max 200 chars)
 */
export const podcastPostSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or fewer"),
    description: z.string().max(200, "Description must be 200 characters or fewer"),
    audio: podcastAudioRule,
    image: podcastImageRule,
});



/** GET Schemas **/
export const podcastGetByIdSchema = z.object({
    id: idRule,
});

export const podcastGetListSchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().max(100, "Search keyword must be 100 characters or fewer").optional(),
});

/** PATCH Schemas **/
export const podcastPatchFormSchema = podcastPostSchema.partial();
export const podcastPatchParamSchema = z.object({
    id: idRule,
});

/** DELETE Schemas **/
export const podcastDeleteParamSchema = z.object({
    id:idRule,
})