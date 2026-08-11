"use client";

import Image from "next/image";
import { formatTime } from "@/utils/format-time.ts";
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
import { PageType } from "@/types/explore/explore.ts";

interface ExplorePodcastPlayerHorizontalProps {
    page: PageType;
}

const sliderColorMap = {
    story: { start: "#f87171", mid: "#fca5a5" },     // red.400, red.300
    podcast: { start: "#fbbf24", mid: "#fde047" },   // yellow.400, yellow.300
    research: { start: "#60a5fa", mid: "#93c5fd" },  // blue.400, blue.300
};

const thumbColorMap = {
    story: "#f87171",
    podcast: "#fbbf24",
    research: "#60a5fa",
};

const playButtonBgMap = {
    story: "bg-red-300 hover:bg-red-400",
    podcast: "bg-yellow-300 hover:bg-yellow-400",
    research: "bg-blue-300 hover:bg-blue-400",
};

const backgroundColorMap = {
    story: "bg-red-300/60",
    podcast: "bg-yellow-300/60",
    research: "bg-blue-300/60",
};

export function ExplorePodcastPlayerHorizontal({ page }: ExplorePodcastPlayerHorizontalProps) {
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
        hidePlayer,
    } = usePlayer();

    if (!isActive || !currentTrack) return null;

    const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
    const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;
    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
    const volumePct = (isMuted ? 0 : volume) * 100;

    const currentPage = page;
    
    if (hidePlayer) {
        return null;
    }

    // Get active colors based on the current page type
    const activeColors = sliderColorMap[currentPage] || sliderColorMap.story;
    const activeThumbColor = thumbColorMap[currentPage] || thumbColorMap.story;
    const activePlayButtonBg = playButtonBgMap[currentPage] || playButtonBgMap.story;

    return (
        <div className={`flex flex-col lg:flex-row items-center gap-3 lg:gap-4 p-3 w-full ${backgroundColorMap[currentPage]}`}>
            
            {/* Track Info Section */}
            <div className="flex items-center justify-between w-full lg:w-80 shrink-0 min-w-0">
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
                        <p className="truncate text-xs text-zinc-500">{currentTrack.artist}</p>
                    </div>
                </div>
                
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
            <div className="flex-1 w-full lg:w-auto min-w-0 flex flex-col items-center gap-2">
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
                        className="flex-1 h-1.5 appearance-none bg-transparent cursor-pointer
                            [&::-webkit-slider-runnable-track]:h-1.5 
                            [&::-webkit-slider-runnable-track]:rounded-full
                            [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--track-start)_0%,var(--track-mid)_var(--progress),#ffffff_var(--progress))]
                            
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:-mt-0.25
                            [&::-webkit-slider-thumb]:w-2
                            [&::-webkit-slider-thumb]:h-2
                            [&::-webkit-slider-thumb]:bg-[var(--thumb-color)]
                            [&::-webkit-slider-thumb]:shadow-sm
                            [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:border-transparent
                            [&::-webkit-slider-thumb]:transition-transform
                            [&::-webkit-slider-thumb]:hover:scale-150

                            [&::-moz-range-track]:h-1.5
                            [&::-moz-range-track]:rounded-full
                            [&::-moz-range-track]:bg-[linear-gradient(to_right,var(--track-start)_0%,var(--track-mid)_var(--progress),#ffffff_var(--progress))]
                            [&::-moz-range-progress]:bg-transparent"
                        style={{
                            "--progress": `${progressPct}%`,
                            "--track-start": activeColors.start,
                            "--track-mid": activeColors.mid,
                            "--thumb-color": activeThumbColor,
                        } as React.CSSProperties}
                        aria-label="Seek"
                    />
                    <span className="text-[11px] tabular-nums text-zinc-400 w-9">
                        {formatTime(duration)}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={toggleShuffle}
                        aria-pressed={isShuffled}
                        aria-label="Toggle shuffle"
                        className={`p-1 rounded-full transition-colors ${
                            isShuffled ? "text-yellow-600 scale-105" : "text-zinc-400 hover:text-zinc-600"
                        }`}
                    >
                        <Shuffle className="w-4 h-4" />
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
                        className={`${activePlayButtonBg} hover:scale-110 hover:cursor-pointer text-white p-2 rounded-full shadow-sm transition`}
                    >
                        {isPlaying ? (
                            <Pause className="w-4.5 h-4.5 fill-current" />
                        ) : (
                            <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
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
                            repeatMode !== "off" ? "text-yellow-600" : "text-zinc-400 hover:text-zinc-600"
                        }`}
                    >
                        <RepeatIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Volume & Desktop Close */}
            <div className="hidden lg:flex items-center gap-4 shrink-0 justify-end lg:w-80">
                <div className="flex items-center gap-2 w-full">
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
                        className="flex-1 h-1.5 appearance-none bg-transparent cursor-pointer
                            [&::-webkit-slider-runnable-track]:h-1.5 
                            [&::-webkit-slider-runnable-track]:rounded-full
                            [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--track-start)_0%,var(--track-mid)_var(--volume-progress),#ffffff_var(--volume-progress))]
                            
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:-mt-0.25
                            [&::-webkit-slider-thumb]:w-2
                            [&::-webkit-slider-thumb]:h-2
                            [&::-webkit-slider-thumb]:bg-[var(--thumb-color)]
                            [&::-webkit-slider-thumb]:shadow-sm
                            [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:border-transparent

                            [&::-moz-range-track]:h-1.5
                            [&::-moz-range-track]:rounded-full
                            [&::-moz-range-track]:bg-[linear-gradient(to_right,var(--track-start)_0%,var(--track-mid)_var(--volume-progress),#ffffff_var(--volume-progress))]
                            [&::-moz-range-progress]:bg-transparent"
                        style={{
                            "--volume-progress": `${volumePct}%`,
                            "--track-start": activeColors.start,
                            "--track-mid": activeColors.mid,
                            "--thumb-color": activeThumbColor,
                        } as React.CSSProperties}
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
    );
}