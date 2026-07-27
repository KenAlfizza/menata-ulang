import { z } from 'zod';
import { isSupportedImageType, SUPPORTED_IMAGE_TYPES, SupportedImageType, verifyMagicBytes } from "../security/files.ts";

/** Zod validation rules reused in multiple validators **/

/**
 * Id validation rule
 * - Must be a non-empty string
 * - Transforms to an integer
 * - Must be a positive number
 * Usages:
 * - GET, PATCH, DELETE endpoints
 */

export const idRule = z.string()
    .trim()
    .min(1, "Id is required")
    .max(20, "Id is too long")
    .refine(val => !isNaN(parseInt(val, 10)), "Id must be a number")
    .refine(val => parseInt(val, 10) > 0, "Id must be positive")
    .transform(val => parseInt(val, 10));

/**
 * UUIDv7 validation rule
 * - Must be a non-empty string
 * Usages:
 * - GET, PATCH, DELETE endpoints
 */
export const uuidRule = z.uuidv7();


/**
 * CUID2 ID validation
 * Assuming your researcher ID is a string (CUID2)
 */
export const cuidRule = z.cuid2();;


/**
 * Max words validation rule
 * @param max 
 * @param message
 * Validates the text provided is less than or equal to the max words
 */
export const maxWordRule = (max: number, message?: string) =>
  z.string().refine(
    (val) => {
      const trimmed = val.trim();
      if (trimmed === '') return true; // Empty string has 0 words
      return trimmed.split(/\s+/).length <= max;
    },
    {
      message: message || `Must be ${max} words or less`
    }
  );


/**
 * Image validation rule
 *
 * Validates uploaded `File` objects:
 * - Non-empty
 * - Maximum size 10MB
 * - MIME type one of JPEG, PNG, WebP
 *
 * Note: Runtime must provide `File` (Deno/file API environment compatibility).
 */
const IMAGE_MAX_SIZE_MB = 10;
const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024;

export const imageRule = z
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
