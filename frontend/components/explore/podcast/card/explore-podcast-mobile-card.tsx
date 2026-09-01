"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRightFromSquare, Clock, Heart, Podcast } from "lucide-react";

import { formatDate } from "@/utils/format-date.ts";
import { formatTime } from "@/utils/format-time.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { ExplorePodcastSummary } from "@/types/explore/podcast.ts";
import { ExplorePodcastPlayButton } from "../explore-podcast-play.tsx";
import { usePlayer } from "@/context/podcast/player-context.tsx";


interface PodcastCardProps {
    podcast?: ExplorePodcastSummary;
    feedPodcasts?: ExplorePodcastSummary[];
    isLoading?: boolean;
}

export function ExplorePodcastMobileCard({ podcast, feedPodcasts, isLoading = false }: PodcastCardProps) {
    const { buildPlayerTrack } = usePlayer();
    const queue = feedPodcasts?.map(buildPlayerTrack) ?? [];

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

    if (isLoading) {
        return (
            <Card className="h-full w-full h-28 bg-white/50 animate-pulse ring-0 oppacity/50">
                <CardContent className="flex flex-row p-4 items-center gap-2 h-full w-full">
                    <div className="w-20 h-20 bg-yellow-200/50 rounded-md shrink-0" />
                    <div className="flex flex-col w-full h-20 justify-between">
                        <div className="w-full flex flex-col gap-2">
                            <div className="w-3/5 h-6 bg-yellow-200/50 rounded" />
                            <div className="w-3/4 h-4 bg-yellow-200/50 rounded" />
                            <div className="w-4/5 h-6 bg-yellow-200/50 rounded" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`group relative w-full ring-0 bg-white/50 transition-colors duration-200 overflow-hidden p-0`}>
            <Link
                href={`/explore/podcast/${slug}`}
                className="absolute inset-0 z-0 rounded-md cursor-pointer"
                aria-label={`View ${title}`}
            />

            <CardContent className="p-4 w-full flex flex-col gap-2 relative z-10 pointer-events-none justify-between">
                <div className="flex flex-row h-full gap-2">
                    <div className="m-auto relative w-16 h-16 shrink-0 overflow-hidden rounded-md bg-zinc-50 flex items-center justify-center">
                        <Image
                            src={imageUrl}
                            alt={alt || ""}
                            fill
                            className="object-cover transition-transform duration-300 [.group:hover:not(:has([data-play-button]:hover))_&]:scale-105"
                            unoptimized
                        />
                    </div>
                    <div className="w-full flex flex-col justify-center">
                        <div className="flex flex-row justify-between">
                            <h3 className="text-lg text-left tracking-tight font-medium text-zinc-800 break-words transition-colors line-clamp-1">
                                {title}
                            </h3>
                        </div>

                        <p className="flex items-center gap-1 text-xs text-left tracking-tight text-zinc-400 break-words max-w-prose">
                            <Podcast size={12}/>
                            {hostName}
                        </p>


                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                            <ArrowUpRightFromSquare size={12} />
                            <span>{date}</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                            <Clock size={12}/>
                            <span>{duration}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row justify-between gap-4">
                    <p className="text-xs text-left tracking-tight text-zinc-600 break-words max-w-prose line-clamp-2 max-h-[2lh] min-h-[2lh]">
                        {description}
                    </p>
                    <div className="flex flex-row justify-between gap-2">
                        <div className="flex flex-row items-center gap-1">
                            <Heart size={30} className="text-zinc-300"/>
                        </div>
                        <ExplorePodcastPlayButton
                            track={{
                                id: String(slug),
                                slug,
                                title,
                                artist: hostName,
                                src: audioUrl,
                                imageUrl,
                            }}
                            queue={queue}
                            startIndex={queue.findIndex((item) => item.id === slug)}
                            page="podcast"
                        />
                    </div>
                </div>
                
            </CardContent>
        </Card>
    );
}