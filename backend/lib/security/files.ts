export const SUPPORTED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
] as const;

export const SUPPORTED_AUDIO_TYPES = [
    "audio/mpeg",
    "audio/aac",
    "audio/mp4",
    "audio/flac",
    "audio/x-flac",
    "audio/wav",
    "audio/x-wav",
] as const;

export type SupportedImageType = typeof SUPPORTED_IMAGE_TYPES[number];
export type SupportedAudioType = typeof SUPPORTED_AUDIO_TYPES[number];
export type SupportedMimeType = SupportedImageType | SupportedAudioType;

/**
 * Checks if a given MIME type string is a supported image type.
 * 
 * @param type - The MIME type string to evaluate
 * @returns boolean - True if the MIME type is a supported image type, false otherwise
 */
export const isSupportedImageType = (type: string): type is SupportedImageType => {
    if (!type) return false;
    const normalized = type.toLowerCase();
    return (SUPPORTED_IMAGE_TYPES as readonly string[]).includes(normalized);
};

/**
 * Checks if a given MIME type string is a supported audio type.
 * 
 * @param type - The MIME type string to evaluate
 * @returns boolean - True if the MIME type is a supported audio type, false otherwise
 */
export const isSupportedAudioType = (type: string): type is SupportedAudioType => {
    if (!type) return false;
    const normalized = type.toLowerCase();
    return (SUPPORTED_AUDIO_TYPES as readonly string[]).includes(normalized);
};

/**
 * Verify file content matches MIME type using Magic Bytes (Content Sniffing)
 * 
 * Optimized to read only the first 8 bytes to reduce memory usage
 * Supports: PNG, JPEG, WebP, MP3, AAC, MP4/AAC (.m4a), FLAC, WAV
 * 
 * @param file - The File object to validate
 * @param type - The declared MIME type (strongly typed)
 * @returns Promise<void> - Resolves if valid, throws Error if invalid
 */
export const verifyMagicBytes = async (file: File, type: SupportedMimeType): Promise<void> => {
    // Ensure type is valid before checking
    if (!type || !type.includes('/')) {
        throw new Error("File type is invalid or missing");
    }

    // Normalize MIME type to lowercase for case-insensitive comparison
    const normalizedType = type.toLowerCase() as SupportedMimeType;

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

    switch (normalizedType) {
        // ==================== IMAGE VALIDATION ====================
        case "image/png":
            // PNG: 8 bytes: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A ("PNG...")
            if (!checkBytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
                throw new Error("Invalid PNG header");
            }
            break;

        case "image/jpeg":
            // JPEG: 3+ bytes: 0xFF 0xD8 0xFF (JFIF/Exif marker)
            if (bytes[0] !== 0xFF || bytes[1] !== 0xD8 || bytes[2] !== 0xFF) {
                throw new Error("Invalid JPEG header");
            }
            break;

        case "image/webp":
            // WebP: 8 bytes: 0x52 0x49 0x46 0x46 0x57 0x45 0x42 0x50 ("RIFF...WEBP")
            if (!checkBytes([0x52, 0x49, 0x46, 0x46, 0x57, 0x45, 0x42, 0x50])) {
                throw new Error("Invalid WebP header");
            }
            break;

        // ==================== AUDIO VALIDATION ====================
        case "audio/mpeg": {
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
            break;
        }

        case "audio/aac":
            // AAC: 0xFF followed by 0xE0-0xE3 (AAC raw)
            if (bytes[0] !== 0xFF || !([0xE0, 0xE1, 0xE2, 0xE3].includes(bytes[1]))) {
                throw new Error("Invalid AAC header");
            }
            break;

        case "audio/mp4":
            // MP4/AAC container: "ftyp" magic bytes (supports .m4a, .mp4, .m4b, etc.)
            if (!checkBytes([0x66, 0x74, 0x79, 0x70])) {
                throw new Error("Invalid MP4/AAC container header");
            }
            break;

        case "audio/flac":
        case "audio/x-flac":
            // FLAC: 4 bytes: 0x66 0x4C 0x41 0x43 ("fLAC")
            if (!checkBytes([0x66, 0x4C, 0x41, 0x43])) {
                throw new Error("Invalid FLAC header");
            }
            break;

        case "audio/wav":
        case "audio/x-wav":
            // WAV: 8 bytes: "RIFF" + "WAVE" (4 bytes each)
            if (!checkBytes([0x52, 0x49, 0x46, 0x46])) { // "RIFF"
                throw new Error("Invalid WAV header");
            }
            if (!checkBytes([0x57, 0x41, 0x56, 0x45], 4)) { // "WAVE"
                throw new Error("Invalid WAV header");
            }
            break;

        default:
            throw new Error(`Unsupported type for magic bytes check: ${type}`);
    }
};