"use client";
import { usePlayer } from "@/context/podcast/player-context.tsx";
import { useIsMobile } from "@/hooks/use-mobile.ts";
import { ExplorePodcastPlayerProps, PodcastPlayerViewProps } from "./explore-podcast-player-config.tsx";
import { ExplorePodcastPlayerMobile } from "./explore-podcast-player-mobile.tsx";
import { ExplorePodcastPlayerDesktop } from "./explore-podcast-player-desktop.tsx";
import { ExplorePodcastPlaylist } from "@/components/explore/podcast/player/playlist/explore-podcast-playlist.tsx"; 

export function ExplorePodcastPlayer({ page }: ExplorePodcastPlayerProps) {
    const isMobile = useIsMobile();
    const playerProps = usePlayer();

    const { isActive, currentTrack, isVisible } = playerProps;

    if (!isActive || !currentTrack || !isVisible) return null;

    const viewProps: PodcastPlayerViewProps = {
        ...playerProps,
        currentTrack,
        page,
    };

    return (
        <div className="relative w-full flex flex-col items-end">
            {/* Playlist */}
            <div 
                className={`absolute bottom-0 p-2 flex justify-end w-full ${
                    isMobile ? "h-[100vh]" : "right-0 md:w-1/3 lg:w-1/4"
                }`}
            >
                <ExplorePodcastPlaylist page={page} />
            </div>

            {/* Main Player */}
            <div className="w-full bg-white/80 pointer-events-auto z-10">
                {isMobile ? (
                    <ExplorePodcastPlayerMobile {...viewProps} />
                ) : (
                    <ExplorePodcastPlayerDesktop {...viewProps} />
                )}
            </div>
        </div>
    );
}