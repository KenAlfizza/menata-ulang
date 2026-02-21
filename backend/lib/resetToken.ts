// Generate random reset token using crypto and random UUID
export const generateResetToken = () => {
    return crypto.randomUUID().replace(/-/g, "");
};