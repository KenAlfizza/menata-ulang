import * as z from "zod";

export const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Kata sandi minimal harus 8 karakter")
    .regex(/[a-z]/, "Kata sandi harus mengandung setidaknya satu huruf kecil")
    .regex(/[A-Z]/, "Kata sandi harus mengandung setidaknya satu huruf besar")
    .regex(/[0-9]/, "Kata sandi harus mengandung setidaknya satu angka"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Nama harus minimal 2 karakter." }),
  email: z.email({ message: "Silakan masukkan alamat email yang valid." }),
  password: z.string().min(8, { message: "Kata sandi harus minimal 8 karakter." }),
  confirmPassword: z.string({ error: "Konfirmasi kata sandi wajib diisi." })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Kata sandi tidak cocok.",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;