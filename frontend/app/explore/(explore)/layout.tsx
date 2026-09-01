"use client"
import { ExploreBackground } from "@/components/explore/explore-background.tsx"; 
import { ExploreNavigation } from "@/components/explore/explore-navigation.tsx";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExploreNavbar } from "@/components/explore/explore-navbar.tsx";
import { usePlayer } from "@/context/podcast/player-context.tsx";
import { PageType } from "@/types/explore/explore.ts";
import { useIsMobile } from "@/hooks/use-mobile.ts";

export default function ExploreLayout({ children }: { children: React.ReactNode }) {  
    const router = useRouter();
    const isMobile = useIsMobile();

    const handleNavigate = useCallback((newPage: PageType) => {
        router.push(`/explore/${newPage}`, { scroll: false });
    }, [router]);

    const { isActive, isVisible, setVisibility } = usePlayer();
    useEffect(() => {
        setVisibility(true);
    }, [router])

    if (isMobile)  {
        return (
            <ExploreBackground>
                <ExploreNavbar route="explore"/>
                <div className="w-full flex justify-center items-center">
                    <div className="w-full pt-20 p-6 flex flex-col">
                        <ExploreNavigation 
                            onNavigate={handleNavigate} 
                        />
                        {children}
                        {isVisible && isActive && <div className="w-full h-18"></div>}
                    </div>
                </div>
            </ExploreBackground>
        );
    }

    return (
        <ExploreBackground>
            <ExploreNavbar route="explore"/>
            <div className="w-full flex justify-center items-center">
                <div className="w-8xl pt-20 p-12 flex flex-col">
                    <ExploreNavigation 
                        onNavigate={handleNavigate} 
                    />
                    {children}
                    {isVisible && isActive && <div className="w-full h-18"></div>}
                </div>
            </div>
        </ExploreBackground>
    );
}