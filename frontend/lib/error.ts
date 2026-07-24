/**
 * Parses and extracts a user-friendly error message from various error formats,
 * including JSON-serialized error strings, Axios/fetch response objects, and standard Errors.
 * 
 * @param error - The caught error object, string, or unknown value.
 * @param fallbackMessage - A default message to return if no specific error message can be parsed.
 * @returns A cleaned, human-readable error message string.
 */
export function getErrorMessage(error: unknown, fallbackMessage = "Something went wrong"): string {
    const rawMessage = error instanceof Error ? error.message : String(error);
    const cleanedMessage = rawMessage.replace(/^Error:\s*/, "");

    try {
        const parsedError = JSON.parse(cleanedMessage);

        if (parsedError?.fields?.image) {
            return parsedError.fields.image;
        }
        if (parsedError?.message) {
            return parsedError.message;
        }
    } catch {
        // Fallback if parsing fails
    }

    if (error && typeof error === "object" && "response" in error) {
        const response = (error as any).response;
        if (response?.data?.message) {
            return response.data.message;
        }
    }

    return error instanceof Error ? error.message : fallbackMessage;
}