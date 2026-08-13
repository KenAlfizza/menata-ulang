"use client"
import { ExploreBackground } from "@/components/explore/explore-background.tsx"; 
import { ExploreNavigation } from "@/components/explore/explore-navigation.tsx";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExploreNavbar } from "@/components/explore/explore-navbar.tsx";
import { usePlayer } from "@/context/podcast/player-context.tsx";
import { PageType } from "@/types/explore/explore.ts";

export default function ExploreLayout({ children }: { children: React.ReactNode }) {  
    const router = useRouter();

    const handleNavigate = useCallback((newPage: PageType) => {
        router.push(`/explore/${newPage}`, { scroll: false });
    }, [router]);

    const { setHidePlayer, isActive } = usePlayer();
    useEffect(() => {
        setHidePlayer(false);
    })

    return (
        <ExploreBackground>
            <ExploreNavbar route="explore"/>
            <div className="w-full flex justify-center items-center">
                <div className="max-w-8xl pt-20 p-12 flex flex-col">
                    <ExploreNavigation 
                        onNavigate={handleNavigate} 
                    />
                    {children}
                    {isActive && <div className="w-full h-20"></div>}
                </div>
            </div>
        </ExploreBackground>
    );
}