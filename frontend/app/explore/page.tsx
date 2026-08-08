"use client"
import { ExploreNavbar } from "@/components/explore/explore-navbar.tsx";
import { ExploreBackground } from "@/components/explore/explore-background.tsx"; 
import { ExplorePodcast } from "@/components/explore/podcast/explore-podcast.tsx";
import { ExploreNavigation } from "@/components/explore/explore-navigation.tsx";
import { ExploreSearchBar } from "@/components/explore/explore-searchbar.tsx";
import { useState } from "react";
import { PlayerProvider } from "../../context/podcast/player-context.tsx";

export default function ExplorePage() {
    const [currentPage, setCurrentPage] = useState<'story' | 'podcast' | 'research'>('story');

    return (
        <PlayerProvider>
        <ExploreBackground page={currentPage}>
        <div className={`pt-20 space-y-8`}>
                <ExploreNavbar page={currentPage} route="explore"/>
                
                <section className="px-12 flex flex-col gap-2">  
                    <ExploreNavigation 
                        page={currentPage} 
                        onNavigate={(newPage) => setCurrentPage(newPage)} 
                    />
                    <ExploreSearchBar onSearch={() => (null)} />
                </section>

                
                <ExplorePodcast />
        </div>
        </ExploreBackground>
        </PlayerProvider>
    );
}