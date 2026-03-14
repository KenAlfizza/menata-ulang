import nodemailer from "nodemailer"

/**
 * SMTP transporter for sending application emails.
 *
 * Behavior: Configures a Nodemailer transporter using SMTP credentials
 * provided through environment variables. This transporter is used to send
 * system emails such as password reset requests.
 *
 * Required environment variables:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port
 * - SMTP_USER: SMTP authentication username
 * - SMTP_PASS: SMTP authentication password
 */
const transporter = nodemailer.createTransport({
    host: Deno.env.get("SMTP_HOST"),
    port: Number(Deno.env.get("SMTP_PORT")),
    secure: false,
    auth: {
        user: Deno.env.get("SMTP_USER"),
        pass: Deno.env.get("SMTP_PASS"),
    },
});

/**
 * Send a password reset email to a user.
 *
 * @param email The recipient's email address.
 * @param token The password reset token associated with the user.
 *
 * Behavior: Generates a password reset URL using the application base URL
 * and the provided reset token. An email containing the reset link is sent
 * to the user with instructions to reset their password. The reset link is
 * intended to expire after 15 minutes.
 *
 * Environment variables used:
 * - APP_URL: Base URL of the application used to construct the reset link
 * - SMTP_USER: Used as the sender email address
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetUrl = `${Deno.env.get("APP_URL")}/reset-password?token=${token}`;

    await transporter.sendMail({
        from: `"Menata Ulang" <${Deno.env.get("SMTP_USER")}>`,
        to: email,
        subject: "Password Reset Request",
        html: `   
            <h2>Password Reset</h2>
            <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>If you did not request this, ignore this email.</p>
        `,
    });
};