import type { Metadata } from "next";
// Import your preferred font from next/font/google
import { REM } from "next/font/google"; 
import "./globals.css";

// Initialize the font configuration
const sansFont = REM({
  subsets: ["latin"],
  variable: "--font-sans", // This creates a CSS variable mapping
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
    <html lang="en">
      {/* Inject the font's class and variable name directly into the body tag */}
      <body className={`${sansFont.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}