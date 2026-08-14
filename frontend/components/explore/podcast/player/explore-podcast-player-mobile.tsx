"use client";
import Link from "next/link";
import Image from "next/image";
import {
    Play,
    Pause,
    Repeat,
    Repeat1,
} from "lucide-react";
import { 
    backgroundColorMap, 
    PodcastPlayerViewProps, 
    playButtonBgMap, 
    sliderColorMap, 
    thumbColorMap 
} from "./explore-podcast-player-config.tsx";

export function ExplorePodcastPlayerMobile({
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    repeatMode,
    togglePlayPause,
    next,
    previous,
    seek,
    setIsSeeking,
    toggleShuffle,
    isShuffled,
    cycleRepeatMode,
    closePlayer,
    page,
}: PodcastPlayerViewProps) {
    const activeColors = sliderColorMap[page] || sliderColorMap.story;
    const activeThumbColor = thumbColorMap[page] || thumbColorMap.story;
    const activePlayButtonBg = playButtonBgMap[page] || playButtonBgMap.story;
    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
    const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;

    return (
        <div className={`flex flex-col items-center gap-2 p-2 w-full ${backgroundColorMap[page]}`}>
            {/* Track Info & Close */}
            <div className="flex items-center justify-between w-full min-w-0">
                 <Link
                    href={`/explore/podcast/${currentTrack.id}`}
                    className="absolute inset-0 z-0 rounded-md cursor-pointer"
                    aria-label={`View ${currentTrack.title}`}
                />
                <div className="flex items-center gap-2 min-w-0">
                    <div className="relative w-11 h-11 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                        <Image
                            src={currentTrack.imageUrl?.trim() ? currentTrack.imageUrl : "/logo-icon.svg"}
                            alt={currentTrack.title}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-800 line-clamp-1">{currentTrack.title}</p>
                        <p className="truncate text-xs text-zinc-500">{currentTrack.artist}</p>
                    </div>
                </div>
                
                <button 
                    type="button"
                    onClick={togglePlayPause} 
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className={`${activePlayButtonBg} text-white p-2 rounded-full shadow-sm z-10`}
                >
                    {isPlaying ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current ml-0.5" />}
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center gap-2 z-10">
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
                        [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                        [&::-webkit-slider-thumb]:bg-[var(--thumb-color)]
                        [&::-webkit-slider-thumb]:rounded-full"
                    style={{
                        "--progress": `${progressPct}%`,
                        "--track-start": activeColors.start,
                        "--track-mid": activeColors.mid,
                        "--thumb-color": activeThumbColor,
                    } as React.CSSProperties}
                    aria-label="Seek"
                />
            </div>
        </div>
    );
}