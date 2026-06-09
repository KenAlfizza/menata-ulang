import React from "react";
import { DecorativeRope } from "../common/decorative-rope";

interface PageBackgroundProps {
  children: React.ReactNode;
}

export function PageBackground({ children }: PageBackgroundProps) {
  return (
    /* Main visual canvas container */
    <div className="bg-[#D4E5A9] relative h-full min-h-screen overflow-x-hidden isolate">

      {/* Background Decorative Layer (Locked behind content using z-0) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        
        {/* Your constant-sized rope decoration, anchored 25% down from the top */}
        <div className="absolute top-[5%] sm:top-[5%] left-0 w-full flex justify-center">
            <DecorativeRope src={"/rope/green1.svg"} width={1500} height={150} />
        </div>

        <div className="absolute top-[10%] top-[30%] xl:top-[38%]  lg:left-0 w-full flex justify-center">
            <DecorativeRope src={"/rope/green2.svg"} width={1500} height={150} />
        </div>

        <div className="absolute top-[10%] top-[70%] xl:top-[70%]  lg:left-0 w-full flex justify-center">
            <DecorativeRope src={"/rope/green3.svg"} width={1500} height={150} />
        </div>
        
      </div>

      {/* 3. Foreground Interactive Content Layer (Forced to the front using z-10) */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}