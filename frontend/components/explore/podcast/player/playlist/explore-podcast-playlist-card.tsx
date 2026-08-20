"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRightFromSquare, Clock, Heart, Podcast } from "lucide-react";

import { formatDate } from "@/utils/format-date.ts";
import { formatTime } from "@/utils/format-time.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { ExplorePodcastSummary } from "@/types/explore/podcast.ts";
import { ExplorePodcastPlayButton } from "../../explore-podcast-play.tsx";


interface PodcastCardProps {
    podcast?: ExplorePodcastSummary;
    isLoading?: boolean;
}

export function ExplorePodcastPlaylistCard({ podcast, isLoading = false }: PodcastCardProps) {
    
    // Pass callbacks straight into the hook
    const currentPodcast = podcast;

    const slug = currentPodcast?.slug ?? "";
    const title = currentPodcast?.title ?? "Untitled Podcast";
    const imageUrl = (currentPodcast?.imageUrl && currentPodcast.imageUrl.trim() !== "") ? `${currentPodcast.imageUrl}` : (podcast?.imageUrl && podcast.imageUrl.trim() !== "") ? `${podcast.imageUrl}` : "/logo-icon.svg";
    const hostName = currentPodcast?.hostName ?? "Menata Ulang";
    const alt = currentPodcast?.title ?? "Podcast Image";
    const description = currentPodcast?.description ?? "A short description describing the main point of the podcast";
    const date = currentPodcast?.publishedAt ? formatDate(new Date(currentPodcast.publishedAt)) : formatDate(new Date());
    const audioUrl = currentPodcast?.audioUrl ?? "";
    const duration = currentPodcast?.duration ? formatTime(currentPodcast?.duration) : formatTime(0);
    const heartsCount = currentPodcast?.heartsCount ?? 0;

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
        <Card className="group relative w-full h-16 bg-white/50 ring-0 rounded-md [&:hover:not(:has([data-play-button]:hover))]:bg-white/75 transition-colors duration-200 overflow-hidden p-0 flex items-center">
            <Link
                href={`/explore/podcast/${slug}`}
                className="absolute inset-0 z-0 rounded-md cursor-pointer"
                aria-label={`View ${title}`}
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
                        <p className="text-left tracking-tight font-medium text-zinc-800 break-words transition-colors line-clamp-1">
                            {title}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-left tracking-tight text-zinc-400 break-words line-clamp-1">
                            <Podcast size={12} className="shrink-0"/>
                            <span className="truncate">{hostName}</span>
                        </p>
                    </div>

                    <div className="flex flex-row gap-2 items-center justify-center shrink-0">
                        <ExplorePodcastPlayButton
                            track={{
                                id: String(slug),
                                title,
                                artist: hostName,
                                src: audioUrl,
                                imageUrl,
                            }}
                        />
                    </div>
                </div>                
            </CardContent>
        </Card>
    );
}