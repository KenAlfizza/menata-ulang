"use client";

import Link from "next/link";
import Image from "next/image";
import { Podcast } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card.tsx";
import { PlayerTrack } from "@/context/podcast/player-context.tsx";
import { ExplorePodcastPlayButton } from "../../explore-podcast-play.tsx";
import { PageType } from "@/types/explore/explore.ts";

interface PlaylistCardProps {
    track: PlayerTrack;
    isCurrent?: boolean;
    onClick?: () => void;
    isLoading?: boolean;
    page: PageType;
}

const isCurrentColorMap = {
    story: "border-red-500",
    podcast: "border-yellow-500",
    research: "border-blue-500",
};

const textColorMap = {
    story: "text-red-500",
    podcast: "text-yellow-500",
    research: "text-blue-500",
}

export function ExplorePodcastPlaylistCard({ track, isCurrent = false, onClick, isLoading = false, page }: PlaylistCardProps) {
    const activeIsCurrentColor = page ? isCurrentColorMap[page] : isCurrentColorMap.podcast;
    const activeTextColorMap = page ? textColorMap[page] : textColorMap.podcast;

    const slug = track?.id ?? "";
    const title = track?.title ?? "Untitled Podcast";
    const imageUrl = track?.imageUrl && track.imageUrl.trim() !== "" ? track.imageUrl : "/logo-icon.svg";
    const hostName = track?.artist ?? "Menata Ulang";
    const alt = track?.title ?? "Podcast Image";

    if (isLoading) {
        return (
            <Card className="h-16 w-full bg-white/50 animate-pulse ring-0 opacity/50">
                <CardContent className="flex flex-row p-2 items-center gap-2 h-full w-full">
                    <div className="w-10 h-10 bg-yellow-200/50 rounded-md shrink-0" />
                    <div className="flex flex-col w-full h-full justify-center gap-1.5">
                        <div className="w-3/5 h-4 bg-yellow-200/50 rounded" />
                        <div className="w-2/5 h-3 bg-yellow-200/50 rounded" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card 
            onClick={onClick}
            className={`group relative w-full h-16 ring-0 rounded-md overflow-hidden p-0 flex items-center cursor-pointer transition-colors duration-200 ${
                isCurrent 
                    ? `bg-white/90 border-l-4 ${activeIsCurrentColor} shadow-sm` 
                    : "bg-white/50 [&:hover:not(:has([data-play-button]:hover))]:bg-white/75"
            }`}
        >
            <Link
                href={`/explore/podcast/${slug}`}
                className="absolute inset-0 z-0 rounded-md cursor-pointer"
                aria-label={`View ${title}`}
                onClick={(e) => e.stopPropagation()}
            />

            <CardContent className="p-2 w-full h-full relative z-10 pointer-events-none flex items-center">
                <div className="flex flex-row gap-2 items-center w-full">
                    <div className="m-auto relative w-10 h-10 shrink-0 overflow-hidden rounded-md bg-zinc-50 flex items-center justify-center">
                        <Image
                            src={imageUrl}
                            alt={alt || ""}
                            fill
                            className="object-cover transition-transform duration-300 [.group:hover:not(:has([data-play-button]:hover))_&]:scale-105"
                            unoptimized
                        />
                    </div>
                    
                    <div className="w-full flex flex-col justify-center min-w-0">
                        <p className={`text-left tracking-tight font-medium break-words transition-colors line-clamp-1 ${isCurrent ? `${activeTextColorMap} font-semibold` : "text-zinc-800"}`}>
                            {title}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-left tracking-tight text-zinc-400 break-words line-clamp-1">
                            <Podcast size={12} className="shrink-0"/>
                            <span className="truncate">{hostName}</span>
                        </p>
                    </div>

                    <div className="flex flex-row gap-2 items-center justify-center shrink-0 pointer-events-auto">
                        <ExplorePodcastPlayButton track={track} page={page} />
                    </div>
                </div>                
            </CardContent>
        </Card>
    );
}