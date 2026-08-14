import { PageType } from "@/types/explore/explore.ts";

export interface Track {
    id: string;
    title: string;
    artist: string;
    src: string;
    imageUrl?: string;
}

// Props for the main entry point component
export interface ExplorePodcastPlayerProps {
    page: PageType;
}

// Props shared by both Mobile and Desktop views
export interface PodcastPlayerViewProps extends ExplorePodcastPlayerProps {
    currentTrack: Track;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    isShuffled: boolean;
    repeatMode: "off" | "all" | "one" | string;
    togglePlayPause: () => void;
    next: () => void;
    previous: () => void;
    seek: (time: number) => void;
    setIsSeeking: (isSeeking: boolean) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    toggleShuffle: () => void;
    cycleRepeatMode: () => void;
    closePlayer: () => void;
}

export const sliderColorMap = {
    story: { start: "#f87171", mid: "#fca5a5" },
    podcast: { start: "#fbbf24", mid: "#fde047" },
    research: { start: "#60a5fa", mid: "#93c5fd" },
};

export const thumbColorMap = {
    story: "#f87171",
    podcast: "#fbbf24",
    research: "#60a5fa",
};

export const playButtonBgMap = {
    story: "bg-red-300 hover:bg-red-400",
    podcast: "bg-yellow-300 hover:bg-yellow-400",
    research: "bg-blue-300 hover:bg-blue-400",
};

export const backgroundColorMap = {
    story: "bg-red-300/60",
    podcast: "bg-yellow-300/60",
    research: "bg-blue-300/60",
};