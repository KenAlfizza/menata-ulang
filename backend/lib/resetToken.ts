/**
 * Generate a password reset token.
 *
 * Behavior: Creates a cryptographically random token using `crypto.randomUUID()`.
 * Hyphens are removed from the UUID to produce a compact token suitable for use
 * in password reset links or database storage.
 *
 * Returns:
 * - string: A random reset token.
 */
export const generateResetToken = () => {
    return crypto.randomUUID().replace(/-/g, "");
};