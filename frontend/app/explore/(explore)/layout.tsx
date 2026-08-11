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
            <div className="pt-20 p-12">
                <section className="flex flex-col gap-2">
                    <ExploreNavigation 
                        onNavigate={handleNavigate} 
                    />   
                </section>
                {children}
                {isActive && <div className="w-full h-20"></div>}
            </div>
        </ExploreBackground>
    );
}