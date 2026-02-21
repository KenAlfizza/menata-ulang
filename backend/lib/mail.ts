import nodemailer from "nodemailer"

// Transporter to handle the SMTP email
const transporter = nodemailer.createTransport({
    host: Deno.env.get("SMTP_HOST"),
    port: Number(Deno.env.get("SMTP_PORT")),
    auth: {
        user: Deno.env.get("SMTP_USER"),
        pass: Deno.env.get("SMTP_PASS"),
    },
});

// Send the password reset email
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