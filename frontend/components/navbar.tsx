"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface NavbarProps {
    show?: boolean;
    showLogo?: boolean;
}

export function Navbar({show = true, showLogo = true}: NavbarProps) {
  return (show && (
    /* 🍦 Warm cream tone (60% opacity) flowing smoothly down into full transparency */
    <header className="sticky top-0 z-50 bg-[#B2CC71]/50 border-b-1 border-b-black/25 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        {showLogo && (
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-text.svg"
              alt="Menata Ulang Logo"
              width={128}
              height={128}
              priority
              className="w-auto h-8 brightness-0 dark:brightness-100"
            />
          </Link>
        </div>
        )}
        
        {/* Actions Section */}
        <nav className="ml-auto flex items-center gap-4">
          <Button variant="ghost" className="text-zinc-800 hover:text-zinc-900 hover:bg-white/50" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button className="bg-zinc-900 text-amber-50 hover:bg-zinc-800 rounded-full" asChild>
            <Link href="/register">Registrasi</Link>
          </Button>
        </nav>

      </div>
    </header>
  ));
}