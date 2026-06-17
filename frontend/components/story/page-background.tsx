"use client";
import React from "react";
import { DecorativeRope } from "../common/decorative-rope";
import { ViewSection } from "../common/view-section.tsx";

interface PageBackgroundProps {
  children: React.ReactNode;
}

export function PageBackground({ children }: PageBackgroundProps) {
  return (
    <div className="bg-[#FFB7C3] relative h-full min-h-screen overflow-x-hidden isolate">
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}