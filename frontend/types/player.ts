export interface PlayerTrack {
    id: string;
    slug: string;
    title: string;
    artist: string;
    src: string;
    imageUrl?: string;
    duration?: number;
}

export type RepeatMode = "off" | "all" | "one";