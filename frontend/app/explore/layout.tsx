"use client"
import { PlayerProvider } from "@/context/podcast/player-context.tsx";
import { ExplorePodcastPlayerHorizontal } from "@/components/explore/podcast/explore-podcast-player-horizontal.tsx";
import { useExplore } from "../../hooks/explore/use-explore.ts";

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
    const page  = useExplore();

    return (
        <PlayerProvider>
            { children }
            <div className="fixed z-10 bottom-0 w-full bg-white/80">
                <ExplorePodcastPlayerHorizontal page={page} />
            </div>
        </PlayerProvider>
    );
}