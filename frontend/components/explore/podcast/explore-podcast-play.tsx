"use client";

import type { MouseEvent } from "react";
import { Play, Pause } from "lucide-react";
import { usePlayer, type PlayerTrack } from "@/context/podcast/player-context.tsx";
import { PageType } from "@/types/explore/explore.ts";

interface ExplorePodcastPlayButtonProps {
    track: PlayerTrack;
    queue?: PlayerTrack[]; // Optional full queue
    startIndex?: number;    // Optional index in the queue
    hidePlayer?: boolean;
    page: PageType;
    size?: number;
    padding?: string;
}

export const playButtonBgMap = {
    story: "bg-red-300 hover:bg-red-400",
    podcast: "bg-yellow-300 hover:bg-yellow-400",
    research: "bg-blue-300 hover:bg-blue-400",
};

export function ExplorePodcastPlayButton({ track, queue, startIndex, hidePlayer, page, size, padding }: ExplorePodcastPlayButtonProps) {
    const { currentTrack, isPlaying, togglePlayPause, setHidePlayer, playTrackWithQueue } = usePlayer();
    const isCurrentTrack = currentTrack?.id === track.id;
    const isDisabled = !track.src;
    const activePlayButtonBg = page ? playButtonBgMap[page] : playButtonBgMap.podcast;
    const currentSize = size ?? 20;
    const currentPadding = padding ?? "p-2"

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isDisabled) return;

        if (isCurrentTrack) {
            togglePlayPause();
        } else {
            playTrackWithQueue(track, queue, startIndex);
        }

        if (hidePlayer) {
            setHidePlayer(true);
        } else {
            setHidePlayer(false);
        }
    };

    return (
        <button
            type="button"
            data-play-button
            onClick={handleClick}
            disabled={isDisabled}
            aria-label={isCurrentTrack && isPlaying ? "Pause" : "Play"}
            className={`${activePlayButtonBg} relative z-50 pointer-events-auto ${currentPadding} rounded-full shadow-sm cursor-default transition-all duration-200 hover:scale-110 hover:shadow-md hover:cursor-pointer disabled:opacity-40 disabled:scale-100 disabled:bg-zinc-300 disabled:cursor-default disabled:hover:shadow-sm`}
        >
            {isCurrentTrack && isPlaying ? (
                <Pause size={currentSize} className="text-white" fill="currentColor" />
            ) : (
                <Play size={currentSize} className="text-white" fill="currentColor" />
            )}
        </button>
    );
}