"use client"
import { ExploreBackground } from "@/components/explore/explore-background.tsx"; 
import { ExploreNavigation } from "@/components/explore/explore-navigation.tsx";
import { ExploreSearchBar } from "@/components/explore/explore-searchbar.tsx";
import { useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { PlayerProvider } from "@/context/podcast/player-context.tsx";
import { ExploreNavbar } from "@/components/explore/explore-navbar.tsx";

type PageType = 'story' | 'podcast' | 'research';

const isValidPageType = (value: string | undefined): value is PageType =>
    value === 'story' || value === 'podcast' || value === 'research';

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const params = useParams<{ page?: string }>();
    const currentPage: PageType = isValidPageType(params.page) ? params.page : 'story';

    const handleNavigate = useCallback((newPage: PageType) => {
        router.push(`/explore/${newPage}`, { scroll: false });
    }, [router]);

    return (
        <PlayerProvider>
        <ExploreBackground page={currentPage}>
        <div className={`pt-20 space-y-8`}>
                <ExploreNavbar page={currentPage} route="explore"/>
                
                <section className="px-12 flex flex-col gap-2">  
                    <ExploreNavigation 
                        page={currentPage} 
                        onNavigate={handleNavigate} 
                    />
                    <ExploreSearchBar onSearch={() => (null)} />
                </section>

                {children}
        </div>
        </ExploreBackground>
        </PlayerProvider>
    );
}