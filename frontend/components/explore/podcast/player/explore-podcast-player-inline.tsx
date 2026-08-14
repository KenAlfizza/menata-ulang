"use client";

import {
    Volume2,
    Volume1,
    VolumeX,
} from "lucide-react";
import { usePlayer, type PlayerTrack } from "@/context/podcast/player-context.tsx";
import { formatTime } from "@/utils/format-time.ts";
import { ExplorePodcastPlayButton } from "../explore-podcast-play.tsx";

interface PodcastPlayerProps {
    track: PlayerTrack;
    showHost?: boolean;
}

export function PodcastPlayerInline({ track, showHost = true }: PodcastPlayerProps) {
    const {
        currentTrack,
        isActive,
        currentTime,
        duration,
        volume,
        isMuted,
        seek,
        setIsSeeking,
        setVolume,
        toggleMute,
    } = usePlayer();

    // This page's track is only "live" — has an <audio> element behind it,
    // a real currentTime/duration, etc — once the play button has actually
    // loaded it into the global player. Before that, we show a static
    // shell with just the play button, so nothing loads or plays until
    // the person presses it.
    const isLive = isActive && currentTrack?.id === track.id;

    const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
    const displayDuration = isLive ? duration : (track.duration ?? 0);
    const displayCurrentTime = isLive ? currentTime : 0;
    const progressPct = displayDuration > 0 ? (displayCurrentTime / displayDuration) * 100 : 0;

    return (
        <div className="w-full rounded-md bg-white/50 px-4 py-3 flex flex-col gap-2">
            {showHost && track.artist && (
                <div className="text-xs text-zinc-500 truncate">
                    {track.title} · {track.artist}
                </div>
            )}
            {/* Top Row: Play/Pause, Scrubber, Time, and Volume */}
            <div className="flex items-center gap-4 w-full">
                {/* Play Controls */}
                <div className="flex items-center gap-2 shrink-0">
                    <ExplorePodcastPlayButton track={track} />
                </div>
                {/* Progress Bar & Times */}
                <div className="w-full flex-1 flex items-center gap-2">
                    <span className="text-[11px] tabular-nums text-zinc-400 w-8 text-right shrink-0">
                        {formatTime(displayCurrentTime)}
                    </span>
                    <input
                        type="range"
                        min={0}
                        max={displayDuration || 0}
                        step={0.1}
                        value={displayCurrentTime}
                        disabled={!isLive}
                        onMouseDown={() => isLive && setIsSeeking(true)}
                        onMouseUp={() => isLive && setIsSeeking(false)}
                        onChange={(e) => isLive && seek(Number(e.target.value))}
                        /* 
                        ========================================
                        PROGRESS BAR STYLING (Webkit-specific pseudo-elements)
                        ========================================
                        */
                        className="flex-1 h-1.5 appearance-none bg-transparent cursor-pointer disabled:cursor-default
                            [&::-webkit-slider-runnable-track]:h-1.5 
                            [&::-webkit-slider-runnable-track]:rounded-full
                            [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,_theme(colors.yellow.400)_0%,_theme(colors.yellow.300)_var(--progress),_theme(colors.zinc.200)_var(--progress))]
                            
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:-mt-0.25
                            [&::-webkit-slider-thumb]:-ml-0.25
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
                        {formatTime(displayDuration)}
                    </span>
                </div>
                {/* Volume Controls */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={toggleMute}
                        disabled={!isLive}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                        className="text-zinc-500 hover:text-zinc-700 transition-colors disabled:opacity-40 disabled:hover:text-zinc-500"
                    >
                        <VolumeIcon className="w-4 h-4" />
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        disabled={!isLive}
                        onChange={(e) => isLive && setVolume(Number(e.target.value))}
                        className="w-20 h-1.5 appearance-none bg-transparent cursor-pointer disabled:cursor-default
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