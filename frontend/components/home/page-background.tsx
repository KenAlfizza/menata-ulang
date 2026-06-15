"use client";
import React from "react";
import { DecorativeRope } from "../common/decorative-rope";

interface PageBackgroundProps {
  children: React.ReactNode;
}

export function PageBackground({ children }: PageBackgroundProps) {
  return (
    <div className="bg-[#D4E5A9] relative h-full min-h-screen overflow-x-hidden isolate">

      <div className="absolute mt-28 inset-0 z-0 pointer-events-none select-none">
        <DecorativeRope src="/rope/green1.svg"/>
      </div>

      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}