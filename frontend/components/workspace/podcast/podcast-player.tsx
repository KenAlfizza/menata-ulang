"use client";

import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";

export interface Track {
    id: string;
    title: string;
    artist: string;
    src: string;
    imageUrl?: string;
    duration?: number; // seconds, optional fallback before metadata loads
}

interface PodcastPlayerProps {
    tracks: Track[];
    initialTrackIndex?: number;
    autoPlay?: boolean;
    onTrackChange?: (track: Track, index: number) => void;
}

type RepeatMode = "off" | "all" | "one";

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PodcastPlayer({
    tracks,
    initialTrackIndex = 0,
    autoPlay = false,
    onTrackChange,
}: PodcastPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [trackIndex, setTrackIndex] = useState(
        Math.min(Math.max(initialTrackIndex, 0), Math.max(tracks.length - 1, 0))
    );
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [previousVolume, setPreviousVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
    const [isSeeking, setIsSeeking] = useState(false);

    const track = tracks[trackIndex];

    // Load new track whenever the index changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !track) return;

        audio.src = track.src;
        audio.load();
        setCurrentTime(0);
        setDuration(track.duration ?? 0);

        if (isPlaying || autoPlay) {
            audio.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
        }

        onTrackChange?.(track, trackIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trackIndex]);

    // Keep volume/mute in sync with the audio element
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
        }
    };

    const goToNext = () => {
        if (tracks.length === 0) return;
        if (isShuffled) {
            let next = Math.floor(Math.random() * tracks.length);
            if (tracks.length > 1) {
                while (next === trackIndex) {
                    next = Math.floor(Math.random() * tracks.length);
                }
            }
            setTrackIndex(next);
        } else {
            setTrackIndex((prev) => (prev + 1) % tracks.length);
        }
    };

    const goToPrevious = () => {
        if (tracks.length === 0) return;
        const audio = audioRef.current;
        // Restart current track instead of going back if we're a few seconds in
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            setCurrentTime(0);
            return;
        }
        setTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    };

    const handleTrackEnd = () => {
        if (repeatMode === "one") {
            const audio = audioRef.current;
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => setIsPlaying(false));
            }
            return;
        }

        const isLastTrack = trackIndex === tracks.length - 1;
        if (isLastTrack && repeatMode === "off" && !isShuffled) {
            setIsPlaying(false);
            return;
        }
        goToNext();
    };

    const cycleRepeatMode = () => {
        setRepeatMode((prev) =>
            prev === "off" ? "all" : prev === "all" ? "one" : "off"
        );
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        setCurrentTime(time);
        if (audioRef.current) audioRef.current.currentTime = time;
    };

    const toggleMute = () => {
        if (isMuted) {
            setIsMuted(false);
            setVolume(previousVolume);
        } else {
            setPreviousVolume(volume);
            setIsMuted(true);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setVolume(value);
        setIsMuted(value === 0);
    };

    const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
    const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;
    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!track) {
        return (
            <div className="w-full rounded-md border border-zinc-100 bg-white/50 p-6 text-center text-sm text-zinc-400">
                No tracks available
            </div>
        );
    }

    return (
        <div className="w-full max-w-md rounded-md border border-zinc-100 bg-white/50 shadow-sm p-4">
            <audio
                ref={audioRef}
                onTimeUpdate={(e) => {
                    if (!isSeeking) setCurrentTime(e.currentTarget.currentTime);
                }}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={handleTrackEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Track info */}
            <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                    <Image
                        src={track.imageUrl && track.imageUrl.trim() !== "" ? track.imageUrl : "/logo-icon.svg"}
                        alt={track.title}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800">{track.title}</p>
                    <p className="truncate text-xs text-zinc-500">{track.artist}</p>
                </div>
            </div>

            {/* Progress */}
            <div className="mt-3 flex items-center gap-2">
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
                    onChange={handleSeek}
                    className="flex-1 h-1.5 appearance-none rounded-full bg-zinc-200 accent-green-500 cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, #22c55e ${progressPct}%, #e4e4e7 ${progressPct}%)`,
                    }}
                    aria-label="Seek"
                />
                <span className="text-[11px] tabular-nums text-zinc-400 w-9">
                    {formatTime(duration)}
                </span>
            </div>

            {/* Controls */}
            <div className="mt-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setIsShuffled((s) => !s)}
                    aria-pressed={isShuffled}
                    aria-label="Toggle shuffle"
                    className={`p-1.5 rounded-full transition-colors ${
                        isShuffled ? "text-green-600" : "text-zinc-400 hover:text-zinc-600"
                    }`}
                >
                    <Shuffle className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={goToPrevious}
                        aria-label="Previous track"
                        className="text-zinc-600 hover:text-zinc-900 transition-colors"
                    >
                        <SkipBack className="w-5 h-5 fill-current" />
                    </button>

                    <button
                        type="button"
                        onClick={handlePlayPause}
                        aria-label={isPlaying ? "Pause" : "Play"}
                        className="bg-green-300 hover:bg-green-400 text-white p-2.5 rounded-full shadow-sm transition-colors"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                        ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={goToNext}
                        aria-label="Next track"
                        className="text-zinc-600 hover:text-zinc-900 transition-colors"
                    >
                        <SkipForward className="w-5 h-5 fill-current" />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={cycleRepeatMode}
                    aria-label="Toggle repeat mode"
                    className={`p-1.5 rounded-full transition-colors ${
                        repeatMode !== "off" ? "text-green-600" : "text-zinc-400 hover:text-zinc-600"
                    }`}
                >
                    <RepeatIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Volume */}
            <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3">
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
                    onChange={handleVolumeChange}
                    className="w-24 h-1.5 appearance-none rounded-full bg-zinc-200 accent-green-500 cursor-pointer"
                    aria-label="Volume"
                />
            </div>
        </div>
    );
}