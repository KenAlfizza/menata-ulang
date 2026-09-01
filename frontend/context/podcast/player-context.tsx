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

import { ExplorePodcastRecord, ExplorePodcastSummary } from "../../types/explore/podcast.ts";

// --- Types & Interfaces ---
import { PlayerTrack, RepeatMode } from "@/types/player.ts";

/**
 * Defines all available state and actions exposed to components via usePlayer().
 * This interface ensures type safety for any component consuming the audio player.
 */
interface PlayerContextValue {
    // State
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
    isVisible: boolean;
    isViewPlaylist: boolean;

    // Actions (State Modifiers)
    buildPlayerTrack: (track: ExplorePodcastRecord | ExplorePodcastSummary) => PlayerTrack;
    
    playTrack: (track: PlayerTrack, options?: { autoplay?: boolean }) => void;
    playTrackKeepPlaylist: (track: PlayerTrack) => void;

    loadTrack: (track: PlayerTrack) => void;
    togglePlayPause: () => void;
    next: () => PlayerTrack | null;
    previous: () => PlayerTrack | null;
    seek: (time: number) => void;
    setIsSeeking: (seeking: boolean) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    toggleShuffle: () => void;
    cycleRepeatMode: () => void;
    closePlayer: () => void;
    setVisibility: (value: boolean) => void;
    
    toggleViewPlaylist: () => void;
    playPlaylist: (startIndex?: number) => void;
    setPlaylist: (playlist: PlayerTrack[]) => void;
    
    addToPlaylist: (newTrack: PlayerTrack) => void;
    addToPlaylistNext: (newTrack: PlayerTrack) => void;

    replacePlaylist: (tracks: PlayerTrack[], startIndex?: number) => void;
    clearPlaylist: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

// --- Provider Component ---

export function PlayerProvider({ children }: { children: ReactNode }) {
    // --- Refs ---
    const audioRef = useRef<HTMLAudioElement>(null);
    const isSeekingRef = useRef(false); // Tracks user interaction to prevent time jumps during drag
    const pendingAutoPlayRef = useRef(true); // Controls if a track change should automatically start playback

    // --- State ---
    const [tracks, setTracks] = useState<PlayerTrack[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isActive, setIsActive] = useState(false); // Is the player currently the active view?
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.8);
    const [previousVolume, setPreviousVolume] = useState(0.8); // Stores last volume before mute
    const [isMuted, setIsMuted] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
    const [isVisible, setIsVisible] = useState(true);
    const [isViewPlaylist, setIsViewPlaylist] = useState(false);

    // Derived state: Get the current track object safely
    const currentTrack = tracks[currentIndex] ?? null;

    // --- Effects ---

    /**
     * Effect: Handles reloading the audio element when the source changes.
     * Triggers: When currentTrack.src changes.
     * Logic:
     * 1. Check if the audio element exists and the track exists.
     * 2. If the src hasn't changed, do nothing (optimization).
     * 3. Update src, load, reset time/duration.
     * 4. Check the 'pendingAutoPlayRef' flag to decide whether to play immediately.
     * 5. Reset the flag for the next load so subsequent changes default to autoplay.
     */
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;
        if (audio.src === currentTrack.src) return;

        audio.src = currentTrack.src;
        audio.load();
        setCurrentTime(0);
        setDuration(currentTrack.duration ?? 0);

        const shouldAutoPlay = pendingAutoPlayRef.current;
        pendingAutoPlayRef.current = true;

        if (shouldAutoPlay) {
            audio.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    }, [currentTrack?.src]);

    /**
     * Effect: Synchronizes the HTMLAudioElement volume and mute state with React state.
     * Triggers: When volume or isMuted state changes.
     */
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    // --- Core Actions ---

    /**
     * Plays a specific track.
     * Options:
     * - autoplay: If true (default), the track will start playing immediately.
     *             If false, it will load but pause, waiting for user interaction.
     * Behavior:
     * - If the track already exists in the playlist, it moves to that index.
     * - If not, it resets the playlist to contain only this track.
     */
    const playTrack = useCallback((track: PlayerTrack, options?: { autoplay?: boolean }) => {
        const autoplay = options?.autoplay ?? true;
        pendingAutoPlayRef.current = autoplay;

        setTracks((prev) => {
            const existingIndex = prev.findIndex((t) => t.id === track.id);
            if (existingIndex !== -1) {
                setCurrentIndex(existingIndex);
                // Track already loaded; start playback if autoplay is requested
                if (autoplay) {
                    const audio = audioRef.current;
                    if (audio) {
                        audio.play().catch(() => setIsPlaying(false));
                        setIsPlaying(true);
                    }
                }
                return prev;
            }
            // New track: Create a new playlist with just this track
            setCurrentIndex(0);
            return [track];
        });
        setIsActive(true);
    }, []);

    /**
     * Loads a track into the player without starting playback.
     * Useful when transitioning between views (e.g., loading an album cover)
     * before the user explicitly clicks play.
     */
    const loadTrack = useCallback((track: PlayerTrack) => {
        playTrack(track, { autoplay: false });
    }, [playTrack]);

    /**
     * Toggles play/pause state.
     * Handles both HTML5 API play() and pause() methods.
     */
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

    /**
     * Converts a raw PodcastRecord object into a PlayerTrack object.
     * Handles nullish coalescing for optional fields.
     */
    function buildPlayerTrack(podcast: ExplorePodcastRecord | ExplorePodcastSummary): PlayerTrack {
        const id = crypto.randomUUID();
        const slug = podcast.slug ?? "";
        const title = podcast.title ?? "Untitled Podcast";
        const artist = podcast.hostName ?? "Unknown Host";
        const audioUrl = podcast.audioUrl ?? "";
        const imageUrl = podcast.imageUrl || "/logo-icon.svg";
        const duration = podcast.duration ?? 0;

        return {
            id,
            slug,
            title,
            artist,
            src: audioUrl,
            imageUrl,
            duration,
        };
    }

    // --- Playlist Management ---

    /**
     * Replaces the entire playlist of tracks.
     * Does not automatically play the new playlist unless explicitly told to via playPlaylist.
     */
    const setPlaylist = useCallback((playlist: PlayerTrack[]) => {
        setTracks(playlist);
        return playlist;
    }, []);

    /**
     * Starts playing the playlist from a specific index.
     * Defaults to index 0 if not provided.
     * Resets the autoplay flag to true for subsequent track changes.
     */
    const playPlaylist = useCallback((startIndex = 0) => {
        pendingAutoPlayRef.current = true;
        setCurrentIndex(
            Math.min(Math.max(startIndex, 0), Math.max(tracks.length - 1, 0))
        );
        setIsActive(true);
    }, [tracks.length]);

    /**
     * Replaces the playlist and starts playing from the specified index.
     */
    const replacePlaylist = useCallback((newTracks: PlayerTrack[], startIndex = 0) => {
        setPlaylist(newTracks);
        pendingAutoPlayRef.current = true;
        setCurrentIndex(
            Math.min(Math.max(startIndex, 0), Math.max(newTracks.length - 1, 0))
        );
        setIsActive(true);
    }, [setPlaylist]);

    /**
     * Clears the existing playlist, leaving only the currently active track as the sole entry.
     * Resets the current index to 0 explicitly.
     */
    const clearPlaylist = useCallback(() => {
        if (!currentTrack) return;
        
        // Atomically set tracks to just the current track and force index to 0
        setTracks([currentTrack]);
        setCurrentIndex(0);
    }, [currentTrack]);
    
    /**
     * Plays a track with an optional full playlist queue and starting index.
     */
    const playTrackInPlaylist = useCallback((track: PlayerTrack, queue?: PlayerTrack[], startIndex?: number) => {
        pendingAutoPlayRef.current = true;

        if (queue && queue.length > 0) {
            const index = startIndex ?? queue.findIndex((t) => t.id === track.id);
            replacePlaylist(queue, index >= 0 ? index : 0);
            return;
        }

        // No queue provided: don't blindly replace the playlist.
        // If the track is already part of the current playlist, just switch to it.
        setTracks((prev) => {
            const existingIndex = prev.findIndex((t) => t.id === track.id);
            if (existingIndex !== -1) {
                setCurrentIndex(existingIndex);
                return prev; // keep the rest of the playlist intact
            }
            // Genuinely new track with no context — fall back to single-item playlist
            setCurrentIndex(0);
            return [track];
        });
        setIsActive(true);

        const audio = audioRef.current;
        if (audio && audio.src === track.src) {
            audio.currentTime = 0;
            audio.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
        }
    }, [replacePlaylist]);

    /**
     * Play newly selected track but keep the existing playlist
     * Behaviour:
     * - It will replace playlist with the selected track first followed by the existing playlist
     */
    const playTrackKeepPlaylist = useCallback((track: PlayerTrack) => {
        pendingAutoPlayRef.current = true;
        const newPlaylist = tracks.length > 0 ? [track, ...tracks] : [track];
        replacePlaylist(newPlaylist, 0);
        setIsActive(true);
    }, [replacePlaylist, tracks]);
    
    /**
     * Moves to the next track in the playlist.
     * Behavior:
     * - If shuffled: Picks a random index different from the current one.
     * - If not shuffled: Increments index cyclically.
     */
    const next = useCallback(() => {
        if (tracks.length === 0) return null;
        pendingAutoPlayRef.current = true;

        let nextIndex: number;
        if (isShuffled) {
            nextIndex = Math.floor(Math.random() * tracks.length);
            // Ensure the next track isn't the same as the current one
            if (tracks.length > 1) {
                while (nextIndex === currentIndex) {
                    nextIndex = Math.floor(Math.random() * tracks.length);
                }
            }
        } else {
            nextIndex = (currentIndex + 1) % tracks.length;
        }

        setCurrentIndex(nextIndex);

        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = 0;
            setCurrentTime(0);
        }

        return tracks[nextIndex];
    }, [tracks, isShuffled, currentIndex]);

    /**
     * Moves to the previous track in the playlist.
     * Behavior:
     * - If more than 3 seconds have passed in the current track, restarts it (0:00).
     * - Otherwise, moves to the previous index cyclically.
     */
    const previous = useCallback(() => {
        if (tracks.length === 0) return null;
        const audio = audioRef.current;
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            setCurrentTime(0);
            return null;
        }

        pendingAutoPlayRef.current = true;
        const newIndex = (currentIndex - 1 + tracks.length) % tracks.length;
        setCurrentIndex(newIndex);

        if (audio) {
            audio.currentTime = 0;
            setCurrentTime(0);
        }

        return tracks[newIndex];
    }, [tracks, currentIndex]);

    /**
     * Handles the 'ended' event of the audio track.
     * Logic based on repeatMode:
     * - "one": Restart the current track.
     * - "all" / "off": Move to the next track (unless it's the last and mode is "off").
     */
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

    // --- User Controls ---

    /**
     * Seeks to a specific timestamp.
     * Updates both React state and the underlying audio element.
     */
    const seek = useCallback((time: number) => {
        setCurrentTime(time);
        if (audioRef.current) audioRef.current.currentTime = time;
    }, []);

    /**
     * Sets the volume level (0.0 to 1.0).
     * Automatically updates the muted state if volume becomes 0.
     */
    const setVolume = useCallback((value: number) => {
        setVolumeState(value);
        setIsMuted(value === 0);
    }, []);

    /**
     * Toggles the mute state.
     * - If currently muted: Restores to the last known non-muted volume.
     * - If currently playing: Saves current volume as the "previous" volume.
     */
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

    /**
     * Cycles through repeat modes: off -> all -> one -> off.
     */
    const cycleRepeatMode = useCallback(() => {
        setRepeatMode((prev) => {
            const next = prev === "off" ? "all" : prev === "all" ? "one" : "off";
            return next;
        });
    }, []);

    /**
     * Closes the player completely.
     * Stops audio, clears source, and resets all state variables to defaults.
     */
    const closePlayer = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.removeAttribute("src");
            audio.load();
        }
        setIsPlaying(false);
        setIsActive(false);
        setTracks([]);
        setCurrentIndex(0);
        setCurrentTime(0);
        setDuration(0);
    }, []);

    const setVisibility = useCallback((value: boolean) => {
        setIsVisible(value);
    }, []);

    const toggleViewPlaylist = useCallback(() => setIsViewPlaylist((p) => !p), []);

    // --- Render ---

    return (
        <PlayerContext.Provider
            value={{
                // State
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
                isVisible,
                isViewPlaylist,

                // Actions
                buildPlayerTrack,
                
                playTrack,
                playTrackKeepPlaylist,
                
                loadTrack,
                setPlaylist,
                playPlaylist,
                addToPlaylist: (newTrack: PlayerTrack) => {
                    setPlaylist([...tracks, newTrack]);
                },
                addToPlaylistNext: (newTrack: PlayerTrack) => {
                    setTracks((prev) => {
                        const insertAt = currentIndex + 1;
                        const next = [...prev];
                        next.splice(insertAt, 0, newTrack);
                        return next;
                    });
                },
                replacePlaylist,
                clearPlaylist,

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
                setVisibility,
                toggleViewPlaylist,
            }}
        >
            {children}
            <audio
                ref={audioRef}
                // Only update React state during natural playback, not while user is seeking
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