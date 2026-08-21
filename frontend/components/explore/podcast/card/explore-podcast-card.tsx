"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRightFromSquare, Heart, Podcast } from "lucide-react";

import { formatDate } from "@/utils/format-date.ts";
import { formatTime } from "@/utils/format-time.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { ExplorePodcastSummary } from "@/types/explore/podcast.ts";
import { ExplorePodcastPlayButton } from "../explore-podcast-play.tsx";
import { usePlayer } from "@/context/podcast/player-context.tsx";


interface PodcastCardProps {
    podcast?: ExplorePodcastSummary;
    feedPodcast?: ExplorePodcastSummary[];
    isLoading?: boolean;
    feature?: boolean;
}

export function ExplorePodcastCard({ podcast, feedPodcast, isLoading = false, feature = false }: PodcastCardProps) {
    const { buildPlayerTrack } = usePlayer();
    const queue = feedPodcast?.map(buildPlayerTrack) ?? [];

    // Pass callbacks straight into the hook
    const currentPodcast = podcast;

    const slug = currentPodcast?.slug ?? "";
    const title = currentPodcast?.title ?? "Untitled Podcast";
    const imageUrl = (currentPodcast?.imageUrl && currentPodcast.imageUrl.trim() !== "") ? `${currentPodcast.imageUrl}` : (podcast?.imageUrl && podcast.imageUrl.trim() !== "") ? `${podcast.imageUrl}` : "/logo-icon.svg";
    const hostName = currentPodcast?.hostName ?? "Menata Ulang";
    const alt = currentPodcast?.title ?? "Podcast Image";
    const description = currentPodcast?.description ?? "A short description describing the main point of the podcast";
    const date = currentPodcast?.publishedAt ? formatDate(new Date(currentPodcast.publishedAt)) : formatDate(new Date());
    const duration = currentPodcast?.duration ? formatTime(currentPodcast?.duration) : formatTime(0);
    const heartsCount = currentPodcast?.heartsCount ?? 0;

    if (isLoading) {
        return (
            <Card className={`h-full w-full h-[360px] bg-white/50 animate-pulse ring-0 oppacity/50`}>
                <CardContent className="flex flex-col items-center gap-4 h-full w-full">
                    <div className="w-full h-40 bg-zinc-200 rounded-md shrink-0" />
                    <div className="flex-1 flex flex-col w-full h-32 justify-between">
                        <div className="w-full flex flex-col gap-2">
                            <div className="w-2/3 h-6 bg-zinc-200 rounded" />
                            <div className="w-1/3 h-6 bg-zinc-200 rounded" />
                        </div>
                        <div className="pt-2 flex items-center justify-between w-full border-zinc-200/50">
                            <div className="w-8 h-4 bg-zinc-200 rounded" />
                            <div className="w-10 h-10 bg-zinc-200 rounded-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`group relative w-full h-[360px] bg-white/50 ring-0 [&:hover:not(:has([data-play-button]:hover))]:bg-white/75 transition-colors duration-200 overflow-hidden p-0`}>
            <Link
                href={`/explore/podcast/${slug}`}
                className="absolute inset-0 z-0 rounded-md cursor-pointer"
                aria-label={`View ${title}`}
            />

            <CardContent className="bg-yellow-100/50 p-4 w-full flex flex-col h-full gap-2 relative z-10 pointer-events-none">
                <div className="m-auto relative w-full h-40 shrink-0 overflow-hidden rounded-md bg-zinc-50 flex items-center justify-center">
                    <Image
                        src={imageUrl}
                        alt={alt || ""}
                        fill
                        className="object-cover transition-transform duration-300 [.group:hover:not(:has([data-play-button]:hover))_&]:scale-105"
                        unoptimized
                    />
                </div>

                <div className="flex-1 flex flex-col h-32 justify-between">
                    <div className="w-full flex flex-col gap-1 items-start">
                        <div className="w-full flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg text-left tracking-tight font-medium text-zinc-800 break-words [.group:hover:not(:has([data-play-button]:hover))_&]:text-zinc-950 transition-colors line-clamp-2">
                                    {title}
                                </h3>
                            </div>
                        </div>
                        <div>
                            <p className="flex items-center gap-1 text-xs text-left tracking-tight text-zinc-600 break-words max-w-prose">
                                <Podcast size={12}/>
                                {hostName}
                            </p>

                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                                <ArrowUpRightFromSquare size={12} />
                                <span>{date}</span>
                            </div>
                        </div>

                        <p className="text-xs text-left tracking-tight text-zinc-600 break-words max-w-prose line-clamp-2 min-h-[2lh]">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="text-zinc-400 flex gap-1">
                            <div className="flex flex-row items-center gap-1">
                                <Heart size={16}/>
                                <p className="text-xs">{heartsCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-zinc-500">{duration}</p>
                        {podcast && 
                            <ExplorePodcastPlayButton
                                track={buildPlayerTrack(podcast)}
                                queue={queue}
                                startIndex={queue.findIndex((item) => item.id === podcast.slug)}
                                page="podcast"
                            />
                        }
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}