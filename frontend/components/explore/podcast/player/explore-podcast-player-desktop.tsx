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
    ListMusic,
} from "lucide-react";
import { 
    backgroundColorMap, 
    PodcastPlayerViewProps, 
    playButtonBgMap, 
    sliderColorMap, 
    thumbColorMap,
    accentColorMap, 
} from "./explore-podcast-player-config.tsx";

export function ExplorePodcastPlayerDesktop({
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    isViewPlaylist,
    togglePlayPause,
    next,
    previous,
    seek,
    setIsSeeking,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleViewPlaylist,
    cycleRepeatMode,
    closePlayer,
    page,
}: PodcastPlayerViewProps) {
    const activeColors = sliderColorMap[page] || sliderColorMap.podcast;
    const activeThumbColor = thumbColorMap[page] || thumbColorMap.podcast;
    const activePlayButtonBg = playButtonBgMap[page] || playButtonBgMap.podcast;
    const activeAccentColor = accentColorMap[page] || accentColorMap.podcast;
    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
    const volumePct = (isMuted ? 0 : volume) * 100;
    const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
    const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;

    return (
        <div className={`flex items-center gap-4 p-2 w-full ${backgroundColorMap[page]}`}>
            {/* Track Info Section */}
            <div className="flex items-center justify-between w-1/4 shrink-0 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                        <Image
                            src={currentTrack.imageUrl?.trim() ? currentTrack.imageUrl : "/logo-icon.svg"}
                            alt={currentTrack.title}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-800 line-clamp-2">{currentTrack.title}</p>
                        <p className="truncate text-xs text-zinc-500">{currentTrack.artist}</p>
                    </div>
                </div>
            </div>

            {/* Transport + progress */}
            <div className="flex-1 min-w-0 flex flex-col w-2/4 items-center gap-2">
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
                            [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                            [&::-webkit-slider-thumb]:-mt-0.25
                            [&::-webkit-slider-thumb]:-ml-0.25
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
                    <span className="text-[11px] tabular-nums text-zinc-400 w-9">
                        {formatTime(duration)}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={toggleShuffle} className={`p-1 rounded-full ${isShuffled ? activeAccentColor : "text-zinc-400"}`}>
                        <Shuffle className="w-4 h-4" />
                    </button>
                    <button onClick={previous} className="text-zinc-600">
                        <SkipBack className="w-4 h-4 fill-current" />
                    </button>
                    <button onClick={togglePlayPause} className={`${activePlayButtonBg} text-white p-2 rounded-full shadow-sm`}>
                        {isPlaying ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current ml-0.5" />}
                    </button>
                    <button onClick={next} className="text-zinc-600">
                        <SkipForward className="w-4 h-4 fill-current" />
                    </button>
                    <button onClick={cycleRepeatMode} className={`p-1 rounded-full ${repeatMode !== "off" ? activeAccentColor : "text-zinc-400"}`}>
                        <RepeatIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Volume & Desktop Close */}
            <div className="flex items-center gap-4 shrink-0 justify-end w-1/4">
                <button onClick={toggleViewPlaylist} className={`p-1 rounded-full ${isViewPlaylist ? activeAccentColor : "text-zinc-400"}`}>
                    <ListMusic className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-zinc-500">
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
                            [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                            [&::-webkit-slider-thumb]:-mt-0.25
                            [&::-webkit-slider-thumb]:bg-[var(--thumb-color)]
                            [&::-webkit-slider-thumb]:rounded-full"
                        style={{
                            "--volume-progress": `${volumePct}%`,
                            "--track-start": activeColors.start,
                            "--track-mid": activeColors.mid,
                            "--thumb-color": activeThumbColor,
                        } as React.CSSProperties}
                        aria-label="Volume"
                    />
                </div>                

                <button onClick={closePlayer} className="text-zinc-400 hover:text-zinc-600 shrink-0">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}