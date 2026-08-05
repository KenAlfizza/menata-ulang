"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from "react";

export interface PlayerTrack {
    id: string;
    title: string;
    artist: string;
    src: string;
    imageUrl?: string;
    duration?: number;
}

type RepeatMode = "off" | "all" | "one";

interface PlayerContextValue {
    tracks: PlayerTrack[];
    currentTrack: PlayerTrack | null;
    currentIndex: number;
    isActive: boolean;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    isShuffled: boolean;
    repeatMode: RepeatMode;
    audioRef: RefObject<HTMLAudioElement | null>;
    playTrack: (track: PlayerTrack) => void;
    playQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
    togglePlayPause: () => void;
    next: () => void;
    previous: () => void;
    seek: (time: number) => void;
    setIsSeeking: (seeking: boolean) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    toggleShuffle: () => void;
    cycleRepeatMode: () => void;
    closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const isSeekingRef = useRef(false);

    const [tracks, setTracks] = useState<PlayerTrack[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.8);
    const [previousVolume, setPreviousVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

    const currentTrack = tracks[currentIndex] ?? null;

    // Reload the audio element whenever the *actual* track changes (by src,
    // not by index) so swapping the queue out from under it can't go stale.
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;
        if (audio.src === currentTrack.src) return;

        audio.src = currentTrack.src;
        audio.load();
        setCurrentTime(0);
        setDuration(currentTrack.duration ?? 0);
        audio.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
    }, [currentTrack?.src]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    const playQueue = useCallback((newTracks: PlayerTrack[], startIndex = 0) => {
        setTracks(newTracks);
        setCurrentIndex(
            Math.min(Math.max(startIndex, 0), Math.max(newTracks.length - 1, 0))
        );
        setIsActive(true);
    }, []);

    const playTrack = useCallback((track: PlayerTrack) => {
        setTracks((prev) => {
            const existingIndex = prev.findIndex((t) => t.id === track.id);
            if (existingIndex !== -1) {
                setCurrentIndex(existingIndex);
                const audio = audioRef.current;
                if (audio) {
                    audio.play().catch(() => setIsPlaying(false));
                    setIsPlaying(true);
                }
                return prev;
            }
            setCurrentIndex(0);
            return [track];
        });
        setIsActive(true);
    }, []);

    const togglePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
        }
    }, [isPlaying]);

    const next = useCallback(() => {
        if (tracks.length === 0) return;
        if (isShuffled) {
            let nextIndex = Math.floor(Math.random() * tracks.length);
            if (tracks.length > 1) {
                while (nextIndex === currentIndex) {
                    nextIndex = Math.floor(Math.random() * tracks.length);
                }
            }
            setCurrentIndex(nextIndex);
        } else {
            setCurrentIndex((prev) => (prev + 1) % tracks.length);
        }
    }, [tracks.length, isShuffled, currentIndex]);

    const previous = useCallback(() => {
        if (tracks.length === 0) return;
        const audio = audioRef.current;
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            setCurrentTime(0);
            return;
        }
        setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    }, [tracks.length]);

    const handleEnded = useCallback(() => {
        if (repeatMode === "one") {
            const audio = audioRef.current;
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => setIsPlaying(false));
            }
            return;
        }
        const isLastTrack = currentIndex === tracks.length - 1;
        if (isLastTrack && repeatMode === "off" && !isShuffled) {
            setIsPlaying(false);
            return;
        }
        next();
    }, [repeatMode, currentIndex, tracks.length, isShuffled, next]);

    const seek = useCallback((time: number) => {
        setCurrentTime(time);
        if (audioRef.current) audioRef.current.currentTime = time;
    }, []);

    const setVolume = useCallback((value: number) => {
        setVolumeState(value);
        setIsMuted(value === 0);
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted((prevMuted) => {
            if (prevMuted) {
                setVolumeState(previousVolume);
                return false;
            }
            setPreviousVolume(volume);
            return true;
        });
    }, [previousVolume, volume]);

    const toggleShuffle = useCallback(() => setIsShuffled((s) => !s), []);

    const cycleRepeatMode = useCallback(() => {
        setRepeatMode((prev) =>
            prev === "off" ? "all" : prev === "all" ? "one" : "off"
        );
    }, []);

    const closePlayer = useCallback(() => {
        const audio = audioRef.current;
        if (audio) audio.pause();
        setIsPlaying(false);
        setIsActive(false);
        setTracks([]);
        setCurrentIndex(0);
    }, []);

    return (
        <PlayerContext.Provider
            value={{
                tracks,
                currentTrack,
                currentIndex,
                isActive,
                isPlaying,
                currentTime,
                duration,
                volume,
                isMuted,
                isShuffled,
                repeatMode,
                audioRef,
                playTrack,
                playQueue,
                togglePlayPause,
                next,
                previous,
                seek,
                setIsSeeking: (seeking: boolean) => {
                    isSeekingRef.current = seeking;
                },
                setVolume,
                toggleMute,
                toggleShuffle,
                cycleRepeatMode,
                closePlayer,
            }}
        >
            {children}
            <audio
                ref={audioRef}
                onTimeUpdate={(e) => {
                    if (!isSeekingRef.current) setCurrentTime(e.currentTarget.currentTime);
                }}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const ctx = useContext(PlayerContext);
    if (!ctx) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return ctx;
}