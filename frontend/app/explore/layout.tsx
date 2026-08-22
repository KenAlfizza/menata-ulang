"use client"
import { PlayerProvider } from "@/context/podcast/player-context.tsx";
import { ExplorePodcastPlayer } from "@/components/explore/podcast/player/explore-podcast-player.tsx";
import { useExplore } from "@/hooks/explore/use-explore.ts";
import { ExplorePodcastPlaylist } from "@/components/explore/podcast/player/playlist/explore-podcast-playlist.tsx";
import { useIsMobile } from "@/hooks/use-mobile.ts";
import { PageType } from "@/types/explore/explore.ts";

function ExplorePodcastPlaylistOverlay({ page }: { page: PageType }) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <div className="fixed inset-0 p-2 w-full flex pointer-events-none">
                <ExplorePodcastPlaylist page={page} />
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 p-2 right-0 z-10 w-full md:w-1/3 lg:w-1/4">
            <ExplorePodcastPlaylist page={page} />
        </div>
    );
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
    const page = useExplore();

    return (
        <PlayerProvider>
            {children}
            <ExplorePodcastPlaylistOverlay page={page} />
            <div className="fixed z-10 bottom-0 w-full">
                <div className="bg-white/80">
                    <ExplorePodcastPlayer page={page} />
                </div>
            </div>
        </PlayerProvider>
    );
}