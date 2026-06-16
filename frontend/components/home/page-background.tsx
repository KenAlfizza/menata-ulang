"use client";
import React from "react";
import { DecorativeRope } from "../common/decorative-rope";
import { ViewSection } from "../common/view-section.tsx";

interface PageBackgroundProps {
  children: React.ReactNode;
}

export function PageBackground({ children }: PageBackgroundProps) {
  return (
    <div className="bg-[#D4E5A9] relative h-full min-h-screen overflow-x-hidden isolate">

      <ViewSection className="absolute mt-31 inset-0 z-0 pointer-events-none select-none">
        <DecorativeRope src="/rope/green1.svg" />
      </ViewSection>

      <ViewSection className="absolute mt-192 inset-0 z-0 pointer-events-none select-none">
        <DecorativeRope src="/rope/green2.svg"/>
      </ViewSection>

      <ViewSection className="absolute mt-392 inset-0 z-0 pointer-events-none select-none">
        <DecorativeRope src="/rope/green4.svg"/>
      </ViewSection>

      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}