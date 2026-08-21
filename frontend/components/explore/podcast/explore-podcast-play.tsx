"use client";

import type { MouseEvent } from "react";
import { Play, Pause } from "lucide-react";
import { usePlayer, type PlayerTrack } from "@/context/podcast/player-context.tsx";

interface ExplorePodcastPlayButtonProps {
    track: PlayerTrack;
    queue?: PlayerTrack[]; // Optional full queue
    startIndex?: number;    // Optional index in the queue
    hidePlayer?: boolean;
    popular?: boolean;
    recent?: boolean;
}

export function ExplorePodcastPlayButton({ track, queue, startIndex, hidePlayer }: ExplorePodcastPlayButtonProps) {
    const { currentTrack, isPlaying, togglePlayPause, setHidePlayer, playTrackWithQueue } = usePlayer();
    const isCurrentTrack = currentTrack?.id === track.id;
    const isDisabled = !track.src;

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
            className="relative z-50 pointer-events-auto bg-yellow-300 p-2 rounded-full shadow-sm cursor-default transition-all duration-200 hover:bg-yellow-400 hover:scale-110 hover:shadow-md hover:cursor-pointer disabled:opacity-40 disabled:scale-100 disabled:bg-zinc-300 disabled:cursor-default disabled:hover:shadow-sm"
        >
            {isCurrentTrack && isPlaying ? (
                <Pause size={20} className="text-white" fill="currentColor" />
            ) : (
                <Play size={20} className="text-white" fill="currentColor" />
            )}
        </button>
    );
}