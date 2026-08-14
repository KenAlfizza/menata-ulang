"use client"
import { ExploreNavbar } from "@/components/explore/explore-navbar.tsx";
import { ExploreBackground } from "@/components/explore/explore-background.tsx"; 
import { useIsMobile } from "@/hooks/use-mobile.ts";
import { usePlayer } from "@/context/podcast/player-context.tsx";

export default function ExploreSlugLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();
    const { hidePlayer, isActive } = usePlayer();
    return (
        <ExploreBackground>
            <ExploreNavbar route="explore"/>
            <div className="w-full flex justify-center items-center">
                {isMobile
                ? 
                    <div className="w-full pt-20 p-6 space-y-8">
                        {children}
                        {!hidePlayer && isActive && <div className="w-full h-10"></div>}
                    </div>
                :  
                    <div className="w-8xl pt-20 p-8 space-y-8">
                        {children}
                        {!hidePlayer && isActive && <div className="w-full h-10"></div>}
                    </div>
                }
            </div>
        </ExploreBackground>
    );
}