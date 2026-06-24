"use client";

import Link from "next/link"
import Image from "next/image"

import { Navbar } from "@/components/common/navbar.tsx";
import { PageBackground } from "@/components/story/page-background.tsx"
import { FadeInSection } from "@/components/common/fade-section.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";


export default function StoryPage() {
    return (
    <div className="relative w-full min-h-screen flex flex-col">
      {/* Navbar sits out here at the absolute root layout level */}
      <Navbar showLogo showNavigation color="#D56F80" />
      {/* Background component acts as the canvas underneath the main body */}
      <PageBackground>
        <main className="relative pt-16 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            


        </main>

        {/** 📝 Mini Footer */}
        <footer className="border-t border-zinc-200/60 dark:border-zinc-800 mt-20 bg-white/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-xs text-zinc-500">
            <p>&copy; {new Date().getFullYear()} Menata Ulang. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
          </div>
        </footer>
      </PageBackground>
    </div>
    )
}