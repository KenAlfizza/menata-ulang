"use client";

import Link from "next/link";
import Image from "next/image";
import { PenBox, Plus } from "lucide-react";

import { formatDate } from "@/utils/format-date.ts";
import { WorkspacePodcastRecord } from "@/types/workspace.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { usePodcastWorkspaceCard } from "@/hooks/workpace/podcast/use-podcast-workspace-card.ts";
import { PodcastCardDropdown } from "./podcast-card-dropdown.tsx";
import { useAuth } from "../../../context/auth-context.tsx";
import { PlayButton } from "./play-button.tsx";

interface PodcastCardProps {
    podcast?: WorkspacePodcastRecord;
    isNewPodcast?: boolean;
    isLoading?: boolean;
}

export function PodcastCard({ podcast, isNewPodcast = false, isLoading = false }: PodcastCardProps) {
    const { accessToken } = useAuth();
    const workspaceCard = usePodcastWorkspaceCard({ podcast });
    
    // Pass callbacks straight into the hook
    const currentPodcast = podcast;

    const id = currentPodcast?.id ?? podcast?.id ?? "0";
    const title = currentPodcast?.title ?? "Untitled Podcast";
    const imageUrl = (currentPodcast?.imageUrl && currentPodcast.imageUrl.trim() !== "") ? `${currentPodcast.imageUrl}` : (podcast?.imageUrl && podcast.imageUrl.trim() !== "") ? `${podcast.imageUrl}` : "/logo-icon.svg";
    const alt = currentPodcast?.title ?? "Podcast Image";
    const description = currentPodcast?.description ?? podcast?.description ?? "A short description describing the main point of the podcast";
    const date = currentPodcast?.updatedAt ? formatDate(new Date(currentPodcast.updatedAt)) : podcast?.updatedAt ? formatDate(new Date(podcast.updatedAt)) : formatDate(new Date());
    const isPublished = currentPodcast?.published ?? podcast?.published ?? false;
    const audioUrl = currentPodcast?.audioUrl ?? podcast?.audioUrl ?? "";

    if (isLoading) {
        return (
            <Card className="w-full h-full min-h-[160px] bg-white/50 border border-zinc-100 rounded-md shadow-sm animate-pulse">
                <CardContent className="flex flex-row items-start gap-4 h-full">
                    <div className="w-32 h-32 bg-zinc-200 rounded-md shrink-0" />
                    <div className="flex-1 flex flex-col h-32 justify-between">
                        <div className="w-full flex flex-col gap-2">
                            <div className="w-2/3 h-6 bg-zinc-200 rounded" />
                            <div className="w-full h-4 bg-zinc-200 rounded" />
                        </div>
                        <div className="pt-2 flex items-center justify-between w-full border-t border-zinc-200/50">
                            <div className="w-1/4 h-3 bg-zinc-200 rounded" />
                            <div className="w-14 h-3 bg-zinc-200 rounded" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isNewPodcast) {
        return (
            <Card className="group relative w-full h-full min-h-[160px] bg-white/50 border-dashed border-zinc-200 hover:bg-zinc-200 transition-colors duration-200 flex items-center justify-center p-6 overflow-hidden">
                <Link
                    href="/workspace/host/new"
                    className="absolute inset-0 z-0 cursor-pointer"
                    aria-label="Create new podcast"
                />
                <Plus className="relative z-10 text-zinc-300 w-12 h-12 transition-transform duration-200 group-hover:scale-110 group-hover:text-zinc-500 pointer-events-none" />
            </Card>
        );
    }

    return (
        <Card className="group relative w-full h-full min-h-[320px] bg-white/50 border border-zinc-100 shadow-sm [&:hover:not(:has([data-play-button]:hover))]:bg-zinc-200/80 transition-colors duration-200 overflow-hidden p-0">
            <Link
                href={`/workspace/host/view/${id}`}
                className="absolute inset-0 z-0 rounded-md cursor-pointer"
                aria-label={`View ${title}`}
            />

            <CardContent className="p-4 w-full flex flex-col h-full gap-2 relative z-10 pointer-events-none">
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

                        <p className="text-xs text-left tracking-tight text-zinc-600 break-words max-w-prose line-clamp-2 min-h-[2lh]">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex flex-row items-end justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <PenBox className="w-3.5 h-3.5" />
                        <span>{date}</span>
                    </div>
                    <PlayButton
                        track={{
                            id: String(id),
                            title,
                            artist: "",
                            src: audioUrl,
                            imageUrl,
                        }}
                    />
                </div>

                <div className="flex items-center border-t pt-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                        {isPublished ? (
                            <>
                                <span className="text-green-600 text-xs">Published</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 animate-pulse" />
                            </>
                        ) : (
                            <>
                                <span className="text-yellow-600 text-xs">Draft</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                            </>
                        )}
                    </div>

                    <div className="ml-auto relative z-20 pointer-events-auto">
                        {currentPodcast && accessToken && (
                            <PodcastCardDropdown
                                accessToken={accessToken}
                                podcast={currentPodcast}
                                onPublishToggle={workspaceCard.handlePublishToggle}
                                onDelete={workspaceCard.handleDeletePodcast}
                            />
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}