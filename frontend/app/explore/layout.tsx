"use client"
import { PlayerProvider } from "@/context/podcast/player-context.tsx";
import { ExplorePodcastPlayer } from "@/components/explore/podcast/player/explore-podcast-player.tsx";
import { useExplore } from "@/hooks/explore/use-explore.ts";

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
    const page = useExplore();
    return (
        <PlayerProvider>
            {children}
            <div className="fixed z-10 bottom-0 w-full pointer-events-none">
                <ExplorePodcastPlayer page={page} />
            </div>
        </PlayerProvider>
    );
}