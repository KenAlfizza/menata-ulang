import type { Metadata } from "next";
import { REM } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "../context/auth-context.tsx";

const sansFont = REM({
  subsets: ["latin"],
  variable: "--font-rem", // ← use --font-rem, not --font-sans
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Menata Ulang",
  description: "Workspace Architecture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sansFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}