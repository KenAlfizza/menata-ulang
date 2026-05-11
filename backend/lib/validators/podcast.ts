/** Zod validation schemas for podcast endpoints **/

import { z } from 'zod';
import { idRule } from "./common.ts";

/**
 * Accepted audio MIME types for podcast uplaods
 */
const ACCEPTED_AUDIO_TYPES = [
    "audio/mpeg",       // MP3
    "audio/aac",        // AAC (raw)
    "audio/mp4",        // MP4/AAC container (.m4a, .mp4)
    "audio/flac",       // FLAC
    "audio/x-flac",     // FLAC (alternate)
    "audio/wav",        // WAV
    "audio/x-wav",      // WAV (legacy)
];

const PODCAST_MAX_SIZE_MB = 50;
const PODCAST_MAX_SIZE_BYTES = PODCAST_MAX_SIZE_MB * 1024 * 1024;

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
 * Verify file content matches MIME type using Magic Bytes (Content Sniffing)
 * 
 * Optimized to read only the first 8 bytes to reduce memory usage
 * Supports: PNG, JPEG, WebP, MP3, AAC, MP4/AAC (.m4a), FLAC, WAV
 * 
 * @param file - The File object to validate
 * @param type - The declared MIME type
 * @returns Promise<void> - Resolves if valid, throws Error if invalid
 */
const verifyMagicBytes = async (file: File, type: string): Promise<void> => {
    // Ensure type is valid before checking
    if (!type || !type.includes('/')) {
        throw new Error("File type is invalid or missing");
    }

    // Normalize MIME type to lowercase for case-insensitive comparison
    const normalizedType = type.toLowerCase();

    // Optimize: Load only the first 8 bytes to reduce memory usage
    // Most headers are 4-8 bytes, so this is efficient
    const headerBuffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(headerBuffer);

    // Ensure we have enough bytes for the check
    if (bytes.length < 8) {
        throw new Error("File is too small to verify header");
    }

    const checkBytes = (expected: number[], startIndex: number = 0): boolean => {
        for (let i = 0; i < expected.length; i++) {
            if (bytes[startIndex + i] !== expected[i]) {
                return false;
            }
        }
        return true;
    };

    // ==================== IMAGE VALIDATION ====================
    if (normalizedType === "image/png") {
        // PNG: 8 bytes: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A ("PNG...")
        if (!checkBytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
            throw new Error("Invalid PNG header");
        }
    } else if (normalizedType === "image/jpeg") {
        // JPEG: 3+ bytes: 0xFF 0xD8 0xFF (JFIF/Exif marker)
        if (bytes[0] !== 0xFF || bytes[1] !== 0xD8 || bytes[2] !== 0xFF) {
            throw new Error("Invalid JPEG header");
        }
    } else if (normalizedType === "image/webp") {
        // WebP: 8 bytes: 0x52 0x49 0x46 0x46 0x57 0x45 0x42 0x50 ("RIFF...WEBP")
        if (!checkBytes([0x52, 0x49, 0x46, 0x46, 0x57, 0x45, 0x42, 0x50])) {
            throw new Error("Invalid WebP header");
        }
    }

    // ==================== AUDIO VALIDATION ====================
    else if (normalizedType === "audio/mpeg") {
        // Check for ID3v2 tag (common in MP3 files)
        // Accept both ID3v2.3 and ID3v2.4
        if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
            const version = bytes[3];
            const validVersions = [0x03, 0x04]; // v2.3 or v2.4
            if (validVersions.includes(version)) {
                return;
            }
        }

        // Check for standard MP3 (MPEG-1 Layer 3) header
        if (bytes[0] !== 0xFF || (bytes[1] !== 0xFA && bytes[1] !== 0xFB)) {
            throw new Error("Invalid MP3 header");
        }
    } else if (normalizedType === "audio/aac") {
        // AAC: 0xFF followed by 0xE0-0xE3 (AAC raw)
        if (bytes[0] !== 0xFF || !([0xE0, 0xE1, 0xE2, 0xE3].includes(bytes[1]))) {
            throw new Error("Invalid AAC header");
        }
    } else if (normalizedType === "audio/mp4") {
        // MP4/AAC container: "ftyp" magic bytes (supports .m4a, .mp4, .m4b, etc.)
        if (!checkBytes([0x66, 0x74, 0x79, 0x70])) {
            throw new Error("Invalid MP4/AAC container header");
        }
    } else if (normalizedType === "audio/flac" || normalizedType === "audio/x-flac") {
        // FLAC: 4 bytes: 0x66 0x4C 0x41 0x43 ("fLAC")
        if (!checkBytes([0x66, 0x4C, 0x41, 0x43])) {
            throw new Error("Invalid FLAC header");
        }
    } else if (normalizedType === "audio/wav" || normalizedType === "audio/x-wav") {
        // WAV: 8 bytes: "RIFF" + "WAVE" (4 bytes each)
        if (!checkBytes([0x52, 0x49, 0x46, 0x46])) { // "RIFF"
            throw new Error("Invalid WAV header");
        }
        if (!checkBytes([0x57, 0x41, 0x56, 0x45], 4)) { // "WAVE"
            throw new Error("Invalid WAV header");
        }
    } else {
        throw new Error(`Unsupported type for magic bytes check: ${type}`);
    }
};


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
    .refine((file) => ACCEPTED_AUDIO_TYPES.includes(file.type), `Invalid audio type. Accepted types: ${ACCEPTED_AUDIO_TYPES.join(", ")}`)
    .refine(
        async (file) => {
            try {
                await verifyMagicBytes(file, file.type);
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
    .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        `Invalid image type. Accepted types: ${ACCEPTED_IMAGE_TYPES.join(", ")}`,
    )
    .refine(
        async (file) => {
            try {
                await verifyMagicBytes(file, file.type);
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
    page: z.coerce.number().int().min(1).max(1000).optional(),
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