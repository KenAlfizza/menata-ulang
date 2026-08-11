"use client"
import { ExploreBackground } from "@/components/explore/explore-background.tsx"; 
import { ExploreNavigation } from "@/components/explore/explore-navigation.tsx";
import { ExploreSearchBar } from "@/components/explore/explore-searchbar.tsx";
import { useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ExploreNavbar } from "@/components/explore/explore-navbar.tsx";
import { usePlayer } from "@/context/podcast/player-context.tsx";
import { PageType } from "@/types/explore/explore.ts";

export default function ExploreLayout({ children }: { children: React.ReactNode }) {  
    const router = useRouter();

    const handleNavigate = useCallback((newPage: PageType) => {
        router.push(`/explore/${newPage}`, { scroll: false });
    }, [router]);

    const { setHidePlayer } = usePlayer();
    useEffect(() => {
        setHidePlayer(false);
    })

    return (
        <ExploreBackground>
            <div className="pt-20 space-y-8 pb-28">
                <ExploreNavbar route="explore"/>
                <section className="px-12 flex flex-col gap-2">
                    <ExploreNavigation 
                        onNavigate={handleNavigate} 
                    />
                    <ExploreSearchBar onSearch={() => (null)} />           
                </section>
                
                {children}
            </div>
        </ExploreBackground>
    );
}