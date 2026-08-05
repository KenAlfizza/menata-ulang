"use client";

import Image from "next/image";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Shuffle,
    Repeat,
    Repeat1,
    Volume2,
    Volume1,
    VolumeX,
    X,
} from "lucide-react";
import { usePlayer } from "@/context/podcast/player-context.tsx";

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

interface podcastPlayerHorizontalProps {
    showHost: boolean;
}

export function PodcastPlayerHorizontal({ showHost }: podcastPlayerHorizontalProps) {
    const {
        currentTrack,
        isActive,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffled,
        repeatMode,
        togglePlayPause,
        next,
        previous,
        seek,
        setIsSeeking,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeatMode,
        closePlayer,
    } = usePlayer();

    if (!isActive || !currentTrack) return null;

    const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
    const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;
    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="w-full rounded-md border border-zinc-100 bg-white/50 shadow-sm px-3 sm:px-4 py-3">
            <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-4">
                
                {/* Top Row on Mobile / Left Section on Desktop: Track Info + Close Button */}
                <div className="flex items-center justify-between w-full lg:w-64 shrink-0 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-11 h-11 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                            <Image
                                src={currentTrack.imageUrl && currentTrack.imageUrl.trim() !== "" ? currentTrack.imageUrl : "/logo-icon.svg"}
                                alt={currentTrack.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-800 line-clamp-[2lh]">{currentTrack.title}</p>
                            {showHost && <p className="truncate text-xs text-zinc-500">{currentTrack.artist}</p> }
                        </div>
                    </div>
                    
                    {/* Close button for mobile view (hidden on md, shown on right inline) */}
                    <button
                        type="button"
                        onClick={closePlayer}
                        aria-label="Close player"
                        className="lg:hidden text-zinc-400 hover:text-zinc-600 transition-colors shrink-0 ml-2"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Transport + progress */}
                <div className="flex-1 w-full lg:w-auto min-w-0 flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={toggleShuffle}
                            aria-pressed={isShuffled}
                            aria-label="Toggle shuffle"
                            className={`p-1 rounded-full transition-colors ${
                                isShuffled ? "text-green-600" : "text-zinc-400 hover:text-zinc-600"
                            }`}
                        >
                            <Shuffle className="w-3.5 h-3.5" />
                        </button>

                        <button
                            type="button"
                            onClick={previous}
                            aria-label="Previous track"
                            className="text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                            <SkipBack className="w-4 h-4 fill-current" />
                        </button>

                        <button
                            type="button"
                            onClick={togglePlayPause}
                            aria-label={isPlaying ? "Pause" : "Play"}
                            className="bg-green-300 hover:bg-green-400 text-white p-2 rounded-full shadow-sm transition-colors"
                        >
                            {isPlaying ? (
                                <Pause className="w-4 h-4 fill-current" />
                            ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={next}
                            aria-label="Next track"
                            className="text-zinc-600 hover:text-zinc-900 transition-colors"
                        >
                            <SkipForward className="w-4 h-4 fill-current" />
                        </button>

                        <button
                            type="button"
                            onClick={cycleRepeatMode}
                            aria-label="Toggle repeat mode"
                            className={`p-1 rounded-full transition-colors ${
                                repeatMode !== "off" ? "text-green-600" : "text-zinc-400 hover:text-zinc-600"
                            }`}
                        >
                            <RepeatIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="w-full flex items-center gap-2">
                        <span className="text-[11px] tabular-nums text-zinc-400 w-9 text-right">
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
                                [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,_#22c55e_0%,_#22c55e_calc(var(--progress)_-_30px),_#2afa77_var(--progress),_#e4e4e7_var(--progress))]
                                
                                [&::-webkit-slider-thumb]:appearance-none
                                [&::-webkit-slider-thumb]:-mt-0.25
                                [&::-webkit-slider-thumb]:w-2
                                [&::-webkit-slider-thumb]:h-2
                                [&::-webkit-slider-thumb]:bg-green-500
                                [&::-webkit-slider-thumb]:shadow-sm
                                [&::-webkit-slider-thumb]:cursor-pointer
                                [&::-webkit-slider-thumb]:rounded-full
                                [&::-webkit-slider-thumb]:transition-[all_0.3s_ease]
                                [&::-webkit-slider-thumb]:hover:scale-150
                                
                                
                                [&::-moz-range-track]:h-1.5
                                [&::-moz-range-track]:rounded-full
                                [&::-moz-range-track]:bg-[linear-gradient(to_right,#22c55e_0%,#22c55e_var(--progress),#e4e4e7_var(--progress))]
                                [&::-moz-range-progress]:bg-transparent

                                [&::-moz-range-thumb]:appearance-none
                                [&::-moz-range-thumb]:w-2
                                [&::-moz-range-thumb]:h-2
                                [&::-moz-range-thumb]:rounded-full
                                [&::-moz-range-thumb]:bg-green-500
                                [&::-moz-range-thumb]:border-0
                                [&::-moz-range-thumb]:shadow-sm
                                [&::-moz-range-thumb]:cursor-pointer
                                [&::-moz-range-thumb]:transition-transform
                                [&::-moz-range-thumb]:hover:scale-150"
                            style={{ "--progress": `${progressPct}%` } as React.CSSProperties}
                            aria-label="Seek"
                        />
                        <span className="text-[11px] tabular-nums text-zinc-400 w-9">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Volume & Desktop Close */}
                <div className="hidden lg:flex items-center gap-4 shrink-0 justify-end w-64">
                    <div className="flex items-center gap-2">
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
                            className="w-20 h-1.5 appearance-none rounded-full bg-zinc-200 accent-green-500 cursor-pointer"
                            aria-label="Volume"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={closePlayer}
                        aria-label="Close player"
                        className="text-zinc-400 hover:text-zinc-600 transition-colors shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}