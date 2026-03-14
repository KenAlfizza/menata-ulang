import bcrypt from "bcryptjs";

/**
 * Hash a plain-text password.
 *
 * @param password The plain-text password to hash.
 *
 * Behavior: Uses bcrypt with a salt round of 10 to securely hash the password.
 *
 * Returns:
 * - string: The hashed password suitable for storage in the database.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compare a plain-text password against a hashed password.
 *
 * @param password The plain-text password to verify.
 * @param hash The hashed password from the database.
 *
 * Behavior: Uses bcrypt to securely compare the password with the hash.
 *
 * Returns:
 * - boolean: True if the password matches the hash, false otherwise.
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};