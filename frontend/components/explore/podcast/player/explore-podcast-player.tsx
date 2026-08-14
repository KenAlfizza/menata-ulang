"use client";
import { usePlayer } from "@/context/podcast/player-context.tsx";
import { useIsMobile } from "@/hooks/use-mobile.ts";
import { ExplorePodcastPlayerProps, PodcastPlayerViewProps } from "./explore-podcast-player-config.tsx";
import { ExplorePodcastPlayerMobile } from "./explore-podcast-player-mobile.tsx";
import { ExplorePodcastPlayerDesktop } from "./explore-podcast-player-desktop.tsx";

export function ExplorePodcastPlayer({ page }: ExplorePodcastPlayerProps) {
    const isMobile = useIsMobile();
    const playerProps = usePlayer();

    const { isActive, currentTrack, hidePlayer } = playerProps;

    if (!isActive || !currentTrack || hidePlayer) return null;

    const viewProps: PodcastPlayerViewProps = {
        ...playerProps,
        currentTrack,
        page,
    };

    return isMobile ? (
        <ExplorePodcastPlayerMobile {...viewProps} />
    ) : (
        <ExplorePodcastPlayerDesktop {...viewProps} />
    );
}