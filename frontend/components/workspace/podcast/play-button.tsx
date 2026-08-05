"use client";

import type { MouseEvent } from "react";
import { Play, Pause } from "lucide-react";
import { usePlayer, type PlayerTrack } from "@/context/podcast/player-context.tsx";

interface PlayButtonProps {
    track: PlayerTrack;
}

export function PlayButton({ track }: PlayButtonProps) {
    const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();
    const isCurrentTrack = currentTrack?.id === track.id;
    const isDisabled = !track.src;

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isDisabled) return;
        if (isCurrentTrack) {
            togglePlayPause();
        } else {
            playTrack(track);
        }
    };

    return (
        <button
            type="button"
            data-play-button
            onClick={handleClick}
            disabled={isDisabled}
            aria-label={isCurrentTrack && isPlaying ? "Pause" : "Play"}
            className="relative z-50 pointer-events-auto bg-green-300 p-2 rounded-full shadow-sm transition-all duration-200 hover:bg-green-400 hover:scale-110 hover:shadow-md hover:cursor-pointer disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
            {isCurrentTrack && isPlaying ? (
                <Pause size={20} className="text-white" fill="currentColor" />
            ) : (
                <Play size={20} className="text-white" fill="currentColor" />
            )}
        </button>
    );
}