"use client";

import {
    Play,
    Pause,
    Volume2,
    Volume1,
    VolumeX,
} from "lucide-react";
import { usePlayer } from "@/context/podcast/player-context.tsx";

export interface Track {
    id: string;
    title: string;
    artist: string;
    src: string;
    imageUrl?: string;
    duration?: number;
}

interface PodcastPlayerProps {
    showHost?: boolean;
}

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PodcastPlayer({ showHost = true }: PodcastPlayerProps) {
    const {
        currentTrack,
        isActive,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        togglePlayPause,
        seek,
        setIsSeeking,
        setVolume,
        toggleMute,
    } = usePlayer();

    if (!isActive || !currentTrack) {
        return (
            <div className="w-full rounded-md border border-zinc-100 bg-white/50 p-4 text-center text-sm text-zinc-400">
                No tracks available
            </div>
        );
    }

    const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="w-full rounded-md bg-white/50 px-4 py-3 flex flex-col gap-2">
            {/* Top Row: Play/Pause, Skip, Scrubber, Time, and Volume */}
            <div className="flex items-center gap-4 w-full">
                {/* Play Controls */}
                <div className="flex items-center gap-2 shrink-0">

                    <button
                        type="button"
                        onClick={togglePlayPause}
                        aria-label={isPlaying ? "Pause" : "Play"}
                        className="relative z-50 pointer-events-auto bg-yellow-300 p-2 rounded-full shadow-sm cursor-default transition-all duration-200 hover:bg-yellow-400 hover:scale-110 hover:shadow-md hover:cursor-pointer disabled:opacity-40 disabled:scale-100 disabled:bg-zinc-300 disabled:cursor-default disabled:hover:shadow-sm"
                    >
                        {isPlaying ? (
                            <Pause className="w-4 h-4 fill-current text-white" />
                        ) : (
                            <Play className="w-4 h-4 fill-current text-white ml-0.5" />
                        )}
                    </button>
                </div>
                {/* Progress Bar & Times */}
                <div className="w-full flex-1 flex items-center gap-2">
                    <span className="text-[11px] tabular-nums text-zinc-400 w-8 text-right shrink-0">
                        {formatTime(currentTime)}
                    </span>
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={currentTime}
                        onMouseDown={() => setIsSeeking(true)}
                        onMouseUp={() => setIsSeeking(false)}
                        onChange={(e) => seek(Number(e.target.value))}
                        /* 
                        ========================================
                        PROGRESS BAR STYLING (Webkit-specific pseudo-elements)
                        ========================================
                        */
                        className="flex-1 h-1.5 appearance-none bg-transparent cursor-pointer
                            [&::-webkit-slider-runnable-track]:h-1.5 
                            [&::-webkit-slider-runnable-track]:rounded-full
                            [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,_theme(colors.yellow.400)_0%,_theme(colors.yellow.300)_var(--progress),_theme(colors.zinc.200)_var(--progress))]
                            
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:-mt-0.25
                            [&::-webkit-slider-thumb]:w-2
                            [&::-webkit-slider-thumb]:h-2
                            [&::-webkit-slider-thumb]:bg-yellow-500
                            [&::-webkit-slider-thumb]:shadow-sm
                            [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:border
                            [&::-webkit-slider-thumb]:border-transparent
                            [&::-webkit-slider-thumb]:transition-[all_0.3s_ease]
                            [&::-webkit-slider-thumb]:hover:scale-200
                            [&::-webkit-slider-thumb]:hover:border-white
                            
                            
                            [&::-moz-range-track]:h-1.5
                            [&::-moz-range-track]:rounded-full
                            [&::-moz-range-track]:bg-[linear-gradient(to_right,theme(colors.yellow.400)_0%,theme(colors.yellow.300)_var(--progress),theme(colors.zinc.200)_var(--progress))]
                            [&::-moz-range-progress]:bg-transparent

                            [&::-moz-range-thumb]:appearance-none
                            [&::-moz-range-thumb]:w-2
                            [&::-moz-range-thumb]:h-2
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-yellow-500
                            [&::-moz-range-thumb]:border-2
                            [&::-moz-range-thumb]:border-transparent
                            [&::-moz-range-thumb]:shadow-sm
                            [&::-moz-range-thumb]:cursor-pointer
                            [&::-moz-range-thumb]:transition-transform
                            [&::-moz-range-thumb]:hover:scale-150
                            [&::-moz-range-thumb]:hover:border-white"
                        style={{ "--progress": `${progressPct}%` } as React.CSSProperties}
                        aria-label="Seek"
                    />
                    <span className="text-[11px] tabular-nums text-zinc-400 w-8 shrink-0">
                        {formatTime(duration)}
                    </span>
                </div>
                {/* Volume Controls */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={toggleMute}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                        className="text-zinc-500 hover:text-zinc-700 transition-colors"
                    >
                        <VolumeIcon className="w-4 h-4" />
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-20 h-1.5 appearance-none bg-transparent cursor-pointer
                            [&::-webkit-slider-runnable-track]:h-1.5
                            [&::-webkit-slider-runnable-track]:rounded-full
                            [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,_theme(colors.yellow.400)_0%,_theme(colors.yellow.300)_var(--volume-progress),_theme(colors.zinc.200)_var(--volume-progress))]

                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:-mt-0.25
                            [&::-webkit-slider-thumb]:w-2
                            [&::-webkit-slider-thumb]:h-2
                            [&::-webkit-slider-thumb]:bg-yellow-500
                            [&::-webkit-slider-thumb]:shadow-sm
                            [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:border
                            [&::-webkit-slider-thumb]:border-transparent
                            [&::-webkit-slider-thumb]:transition-[all_0.3s_ease]
                            [&::-webkit-slider-thumb]:hover:scale-200
                            [&::-webkit-slider-thumb]:hover:border-white

                            [&::-moz-range-track]:h-1.5
                            [&::-moz-range-track]:rounded-full
                            [&::-moz-range-track]:bg-[linear-gradient(to_right,theme(colors.yellow.400)_0%,theme(colors.yellow.300)_var(--volume-progress),theme(colors.zinc.200)_var(--volume-progress))]
                            [&::-moz-range-progress]:bg-transparent

                            [&::-moz-range-thumb]:appearance-none
                            [&::-moz-range-thumb]:w-2
                            [&::-moz-range-thumb]:h-2
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-yellow-500
                            [&::-moz-range-thumb]:border-2
                            [&::-moz-range-thumb]:border-transparent
                            [&::-moz-range-thumb]:shadow-sm
                            [&::-moz-range-thumb]:cursor-pointer
                            [&::-moz-range-thumb]:transition-transform
                            [&::-moz-range-thumb]:hover:scale-150
                            [&::-moz-range-thumb]:hover:border-white"
                        style={{ "--volume-progress": `${(isMuted ? 0 : volume) * 100}%` } as React.CSSProperties}
                        aria-label="Volume"
                    />
                </div>
            </div>
        </div>
    );
}