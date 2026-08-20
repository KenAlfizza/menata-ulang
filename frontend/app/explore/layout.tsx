"use client"
import { PlayerProvider } from "@/context/podcast/player-context.tsx";
import { ExplorePodcastPlayer } from "@/components/explore/podcast/player/explore-podcast-player.tsx";
import { useExplore } from "../../hooks/explore/use-explore.ts";
import { ExplorePodcastPlaylist } from "@/components/explore/podcast/player/playlist/explore-podcast-playlist.tsx";

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
    const page  = useExplore();

    return (
        <PlayerProvider>
            { children }
            <div className="fixed z-10 bottom-0 w-full">
                <div className="bg-white/80">
                    <ExplorePodcastPlayer page={page} />
                </div>
            </div>
            <div className="fixed p-2 bottom-18 right-0 z-10 w-1/4">
                <div className="bg-white/80 rounded-lg">
                    <ExplorePodcastPlaylist page={page}/>
                </div>
            </div>
        </PlayerProvider>
    );
}