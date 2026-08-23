"use client";

import { Pause, Play, Repeat, Repeat1, RepeatIcon, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { usePlayer, type PlayerTrack } from "@/context/podcast/player-context.tsx";
import { formatTime } from "@/utils/format-time.ts";
import { playButtonBgMap } from "../explore-podcast-play.tsx";
import { accentColorMap, sliderColorMap, thumbColorMap } from "./explore-podcast-player-config.tsx";

interface PodcastPlayerProps {
    track: PlayerTrack;
    showHost?: boolean;
}

export function PodcastPlayerInline({ track }: PodcastPlayerProps) {
    const {
        currentTrack,
        isActive,
        currentTime,
        duration,
        togglePlayPause,
        toggleShuffle,
        isPlaying,
        isShuffled,
        next,
        previous,
        repeatMode,
        cycleRepeatMode,
        seek,
        setIsSeeking,
    } = usePlayer();

    const isLive = isActive && currentTrack?.id === track.id;

    const displayDuration = isLive ? duration : (track.duration ?? 0);
    const displayCurrentTime = isLive ? currentTime : 0;
    const progressPct = displayDuration > 0 ? (displayCurrentTime / displayDuration) * 100 : 0;

    const activeSliderColors = sliderColorMap.podcast;
    const activeThumbColor = thumbColorMap.podcast;
    const activePlayButtonBg = playButtonBgMap.podcast;
    const activeAccentColor = accentColorMap.podcast;

    return (
        <div className={`w-full rounded-md flex flex-col gap-4`}>
            {/* Transport + progress */}
            <div className="flex-1 min-w-0 flex flex-col w-full items-center gap-2">
                <div className="w-full flex items-center gap-2">
                    <span className="text-[11px] tabular-nums text-zinc-400 text-right shrink-0">
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
                        className="flex-1 min-w-0 h-1.5 appearance-none bg-transparent cursor-pointer
                            [&::-webkit-slider-runnable-track]:h-1.5 
                            [&::-webkit-slider-runnable-track]:rounded-full
                            [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--track-start)_0%,var(--track-mid)_var(--progress),#ffffff_var(--progress))]
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                            [&::-webkit-slider-thumb]:-mt-0.25
                            [&::-webkit-slider-thumb]:-ml-0.25
                            [&::-webkit-slider-thumb]:bg-[var(--thumb-color)]
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:border
                            [&::-webkit-slider-thumb]:border-transparent
                            [&::-webkit-slider-thumb]:transition-[all_0.3s_ease]
                            [&::-webkit-slider-thumb]:hover:scale-200
                            [&::-webkit-slider-thumb]:hover:border-white"
                        style={{
                            "--progress": `${progressPct}%`,
                            "--track-start": activeSliderColors.start,
                            "--track-mid": activeSliderColors.mid,
                            "--thumb-color": activeThumbColor,
                        } as React.CSSProperties}
                        aria-label="Seek"
                    />
                    <span className="text-[11px] tabular-nums text-zinc-400 shrink-0">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            <div className="w-full flex-col">
                <div className="flex w-full justify-between items-center">
                    <button type="button" onClick={toggleShuffle} className={`p-1 rounded-full ${isShuffled ? activeAccentColor : "text-zinc-500"}`}>
                        <Shuffle size={24} />
                    </button>
                    <button type="button" onClick={previous} className="text-zinc-600">
                        <SkipBack size={28} className="fill-current" />
                    </button>
                    <button type="button" onClick={togglePlayPause} className={`p-4 ${activePlayButtonBg} text-white rounded-full shadow-sm hover:cursor-pointer`}>
                        {isPlaying ? <Pause size={32} className="fill-current" /> : <Play size={32} className="fill-current" />}
                    </button>
                    <button type="button" onClick={next} className="text-zinc-600">
                        <SkipForward size={28} className="fill-current" />
                    </button>
                    <button type="button" onClick={cycleRepeatMode} className={`p-1 rounded-full ${repeatMode !== "off" ? activeAccentColor : "text-zinc-500"}`}>
                        {repeatMode === "one" ? <Repeat1 size={28} /> :<Repeat size={28} /> }
                    </button>
                </div>
            </div>
        </div>
    );
}