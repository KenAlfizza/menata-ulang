"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ArrowUpRightFromSquare, Heart, Podcast } from "lucide-react";

import { formatDate } from "@/utils/format-date.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { ExplorePodcastRecord } from "@/types/explore/podcast.ts";
import { PodcastPlayer } from "./explore-podcast-player.tsx"
import { usePlayer } from "@/context/podcast/player-context.tsx";

interface PodcastCardProps {
    podcast?: ExplorePodcastRecord;
    isLoading?: boolean;
}

export function ExplorePodcastView({ podcast, isLoading = false }: PodcastCardProps) {
    const { currentTrack, playTrack } = usePlayer();
    const currentPodcast = podcast;

    const slug = currentPodcast?.slug ?? "";
    const title = currentPodcast?.title ?? "Untitled Podcast";
    const imageUrl = (currentPodcast?.imageUrl && currentPodcast.imageUrl.trim() !== "") ? `${currentPodcast.imageUrl}` : (podcast?.imageUrl && podcast.imageUrl.trim() !== "") ? `${podcast.imageUrl}` : "/logo-icon.svg";
    const hostName = currentPodcast?.hostName ?? "Menata Ulang";
    const alt = currentPodcast?.title ?? "Podcast Image";
    const description = currentPodcast?.description ?? "A description describing the main point of the podcast";
    const date = currentPodcast?.publishedAt ? formatDate(new Date(currentPodcast.publishedAt)) : formatDate(new Date());
    const audioUrl = currentPodcast?.audioUrl ?? "";
    const durationSeconds = currentPodcast?.duration ?? 0;
    const heartsCount = currentPodcast?.heartsCount ?? 100;
    const transcript = currentPodcast?.transcript ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eget odio varius, rutrum mauris sed, auctor enim. Sed consequat, quam ut volutpat imperdiet, nunc sem pulvinar nulla, in mollis nisl odio vitae metus. Cras a eleifend sapien. Quisque blandit ante odio. Vivamus fringilla elit ac consequat vehicula. Vivamus laoreet rhoncus turpis in commodo. Pellentesque fermentum nisl in sagittis euismod. Integer vel vehicula dolor. Nam a urna vel sem tempus ultricies. Vestibulum ut tortor interdum, pharetra libero eget, commodo ipsum. Pellentesque posuere sem at arcu hendrerit, eget porta elit posuere. Nullam sagittis pulvinar nunc, a fermentum lectus egestas in.";

    // Automatically register and load the podcast into the global player state on mount
    useEffect(() => {
        if (slug && audioUrl) {
            if (!currentTrack || currentTrack.id !== slug) {
                playTrack({
                    id: slug,
                    title,
                    artist: hostName,
                    src: audioUrl,
                    imageUrl,
                    duration: durationSeconds,
                });
            }
        }
    }, [slug, audioUrl, title, hostName, imageUrl, durationSeconds, currentTrack, playTrack]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-8">
                <div className="flex flex-row items-stretch gap-8 h-[320px]">
                    <Card className="relative min-w-xs h-full bg-white/50 ring-0 rounded-md animate-pulse p-0">
                        <CardContent className="w-full h-full p-0 relative">
                            <div className="w-full h-full rounded-l-md" />
                        </CardContent>
                    </Card>
                    <Card className="relative w-full h-full bg-white/50 ring-0 rounded-md animate-pulse p-0">
                        <CardContent className="p-6 w-full flex flex-col h-full relative z-10">
                            <div className="w-full flex-1 flex flex-col gap-2 min-h-0">
                                <div className="w-2/3 h-7 bg-zinc-100/50 rounded" />

                                <div className="flex flex-col gap-1.5 mt-1">
                                    <div className="w-1/3 h-4 bg-zinc-100/50 rounded" />
                                    <div className="w-1/4 h-3 bg-zinc-100/50 rounded" />
                                </div>

                                <div className="flex flex-col gap-1.5 mt-1">
                                    <div className="w-full h-4 bg-zinc-100/50 rounded" />
                                    <div className="w-4/5 h-4 bg-zinc-100/50 rounded" />
                                </div>

                                <div className="w-full flex-1 flex items-center">
                                    <div className="w-full h-10 bg-zinc-100/50 rounded-md" />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <div className="flex flex-row items-center gap-1">
                                    <div className="w-6 h-6 bg-zinc-100/50 rounded-full" />
                                    <div className="w-6 h-4 bg-zinc-100/50 rounded" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card className="relative w-full h-full bg-white/50 ring-0 rounded-md animate-pulse p-0">
                    <CardContent className="p-6 w-full flex flex-col h-full relative z-10">
                        <div className="flex-1 flex flex-col gap-3">
                            <div className="w-1/4 h-7 bg-zinc-100/50 rounded" />
                            <div className="flex flex-col gap-2">
                                <div className="w-full h-4 bg-zinc-100/50 rounded" />
                                <div className="w-full h-4 bg-zinc-100/50 rounded" />
                                <div className="w-full h-4 bg-zinc-100/50 rounded" />
                                <div className="w-3/4 h-4 bg-zinc-100/50 rounded" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className=" flex flex-col gap-8">
            <div className="flex flex-row items-stretch gap-8 h-[320px]">
                <Card className="relative min-w-xs h-full bg-white/50 ring-0 p-0">
                    <CardContent className="w-full h-full p-0 relative justify-center">
                        <Image
                            src={imageUrl}
                            alt={alt || ""}
                            fill
                            className="object-cover transition-transform duration-300 rounded-l-md"
                            unoptimized
                        />
                    </CardContent>
                </Card>
                <Card className="group relative w-full h-full bg-white/50 ring-0 p-0">
                    <CardContent className="p-6 w-full flex flex-col h-full relative z-10">
                        <div className="w-full flex-1 flex flex-col gap-2 min-h-0">
                            <div>
                                <h1 className="text-2xl text-left tracking-tight font-medium text-zinc-800 break-words [.group:hover:not(:has([data-play-button]:hover))_&]:text-zinc-950 transition-colors line-clamp-2">
                                    {title}
                                </h1>
                            </div>

                            <div>
                                <p className="flex items-center gap-1 text-sm text-left tracking-tight text-zinc-600 break-words max-w-prose">
                                    <Podcast size={12}/>
                                    {hostName}
                                </p>

                                <div className="flex items-center gap-1 text-sm text-zinc-400">
                                    <ArrowUpRightFromSquare size={12} />
                                    <span>{date}</span>
                                </div>
                            </div>

                            <p className="text-md text-left tracking-tight text-zinc-600 break-words max-w-prose line-clamp-2 min-h-[2lh]">
                                {description}
                            </p>
                            <div className="w-full flex-1 flex items-center">
                                <div className="w-full"><PodcastPlayer/></div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end text-zinc-400">
                            <div className="flex flex-row items-center gap-1">
                                <Heart size={24}/>
                                <p className="text-md">{heartsCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card className="group relative w-full h-full bg-white/50 ring-0 p-0">
                <CardContent className="p-6 w-full flex flex-col h-full justify-between relative z-10">
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="w-full flex flex-col gap-1 items-start">
                            <h3 className="text-2xl text-left tracking-tight font-medium text-zinc-800">
                                Transcript
                            </h3>
                            <p className="text-md text-left tracking-tight text-zinc-600 whitespace-pre-line">
                                {transcript}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}