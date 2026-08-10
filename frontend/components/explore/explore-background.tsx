"use client";
import React from "react";
import { DecorativeRope } from "../common/decorative-rope";
import { ViewSection } from "../common/view-section.tsx";

type PageType = 'story' | 'podcast' | 'research';

interface ExploreBackgroundProps {
  children: React.ReactNode;
  page: PageType;
}

// Map each page to its corresponding background class
const backgroundMap = {
    story: "bg-red-200/75",
    podcast: "bg-yellow-200/75",
    research: "bg-blue-200/75",
};

export function ExploreBackground({ children, page }: ExploreBackgroundProps) {
    const currentBgColor = backgroundMap[page];
    return (
        <div className={`fixed inset-0 h-full min-h-screen transition-colors duration-300 ${currentBgColor}`}>
            {(page === 'story') && 
                <ViewSection className="absolute mt-115 inset-0 z-0 pointer-events-none select-none overflow-hidden">
                    <DecorativeRope className="scale-105" src="/explore/rope1.svg" />
                </ViewSection>
            }
            {(page === 'podcast') && 
                <ViewSection className="absolute mt-80 inset-0 z-0 pointer-events-none select-none overflow-hidden">
                    <DecorativeRope className="scale-105" src="/explore/rope2.svg" />
                </ViewSection>
            }

            {(page === 'research') && 
                <ViewSection className="absolute mt-95 inset-0 z-0 pointer-events-none select-none overflow-hidden">
                    <DecorativeRope className="scale-100" src="/explore/rope3.svg" />
                </ViewSection>
            }

            <div className="relative z-10 w-full h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {children}
            </div>
        </div>
    );
}