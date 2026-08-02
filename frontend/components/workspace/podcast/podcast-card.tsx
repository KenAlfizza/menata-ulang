"use client";

import Link from "next/link";
import Image from "next/image";
import { MoreVertical, PenBox, Plus, Trash2, Eye, FileText, ArrowUpRightFromSquare, Edit } from "lucide-react";

import { formatDate } from "@/utils/format-date.ts";
import { WorkspacePodcastRecord } from "@/types/workspace.ts";
import { Button } from "@/components/ui/button.tsx";
import {
    Card,
    CardContent,
} from "@/components/ui/card.tsx";
import {
    DropdownMenu,
    DropdownMenuLabel,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useAuth } from "../../../context/auth-context.tsx";
import { useState } from "react";
// import { deletePodcast, setPodcastPublishStatus } from "../../../services/host.ts";
import { useWorkspaceRefresh } from "@/context/workspace/refresh-context.tsx";

interface PodcastCardProps {
    podcast?: WorkspacePodcastRecord;
    isNewPodcast?: boolean;
    isLoading?: boolean;
    onDelete?: (id: string) => void;
}

export function PodcastCard({ podcast, isNewPodcast = false, isLoading = false, onDelete }: PodcastCardProps) {
    const { accessToken } = useAuth();
    const { triggerRefresh } = useWorkspaceRefresh();
    const [currentPodcast, setCurrentPodcast] = useState<WorkspacePodcastRecord | undefined>(podcast);

    const id = currentPodcast?.id ?? podcast?.id ?? "0";
    const title = currentPodcast?.title ?? podcast?.title ?? "Untitled Podcast";
    const imageUrl = (currentPodcast?.imageUrl && currentPodcast.imageUrl.trim() !== "") ? `${currentPodcast.imageUrl}` : (podcast?.imageUrl && podcast.imageUrl.trim() !== "") ? `${podcast.imageUrl}` : "/logo-icon.svg";
    const alt = currentPodcast?.title ?? podcast?.title ? currentPodcast?.title ?? podcast?.title : "Podcast Image";
    const description = currentPodcast?.description ?? podcast?.description ?? "A short description describing the main point of the podcast";
    const date = currentPodcast?.updatedAt ? formatDate(new Date(currentPodcast.updatedAt)) : podcast?.updatedAt ? formatDate(new Date(podcast.updatedAt)) : formatDate(new Date());
    const isPublished = currentPodcast?.published ?? podcast?.published ?? false;

    const handlePublishToggle = async (publishState: boolean) => {
        if (!accessToken) return;
        try {
            //  const updatedPodcast = await setPodcastPublishStatus(accessToken, id, publishState);
            //  setCurrentPodcast(updatedPodcast as unknown as WorkspacePodcastRecord);
            triggerRefresh();

        } catch (error: unknown) {
            let alertMessage = "An unexpected error occurred";

            try {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorString = errorMessage.replace(/^Error:\s*/, '');
                const parsedError = JSON.parse(errorString);
                
                if (parsedError?.message) {
                    alertMessage = parsedError.message;
                }
            } catch {
                const errObj = error as { response?: { data?: { message?: string } } };
                alertMessage = errObj?.response?.data?.message || (error instanceof Error ? error.message : "Something went wrong");
            }

            alert(`Podcast ${publishState ? "publishing" : "unpublishing"} failed: ${alertMessage}. Please try again.`);
        }
    };

    const handleDeletePodcast = async (podcastId: string) => {
        if (!accessToken) return;
        try {
            //  await deletePodcast(accessToken, podcastId);
            
            if (onDelete) {
                onDelete(podcastId);
            }
            triggerRefresh();

        } catch (error: unknown) {
            let alertMessage = "An unexpected error occurred";

            try {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorString = errorMessage.replace(/^Error:\s*/, '');
                const parsedError = JSON.parse(errorString);
                
                if (parsedError?.message) {
                    alertMessage = parsedError.message;
                }
            } catch {
                const errObj = error as { response?: { data?: { message?: string } } };
                alertMessage = errObj?.response?.data?.message || (error instanceof Error ? error.message : "Something went wrong");
            }

            alert(`Podcast deletion failed: ${alertMessage}. Please try again.`);
        }
    };

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
            <Card className="group relative w-full max-w-[160px] h-full min-h-[160px] bg-white/50 border-dashed border-zinc-200 hover:bg-zinc-200 transition-colors duration-200 flex items-center justify-center p-6 overflow-hidden">
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
        <Card className="group relative w-full h-full min-h-[160px] bg-white/50 border border-zinc-100 shadow-sm hover:bg-zinc-200/80 transition-colors duration-200 overflow-hidden p-0">
            <Link
                href={`/workspace/host/view/${id}`}
                className="absolute inset-0 z-0 rounded-md cursor-pointer"
                aria-label={`View ${title}`}
            />

            <CardContent className="p-4 flex flex-row items-start h-full gap-4 relative z-10 pointer-events-none">
                <div className="relative w-32 h-32 shrink-0 overflow-hidden rounded-md bg-zinc-50 flex items-center justify-center">
                    <Image
                        src={imageUrl}
                        alt={alt || ""}
                        width={128}
                        height={128}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                    />
                </div>

                <div className="flex-1 flex flex-col h-32 justify-between">
                    <div className="w-full flex flex-col gap-1 items-start">
                        <div className="w-full flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl text-left font-medium tracking-tight text-zinc-800 break-words group-hover:text-zinc-950 transition-colors line-clamp-1">
                                    {title}
                                </h3>
                            </div>

                            <div className="pointer-events-auto">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-8 w-8 p-0 rounded-full hover:bg-zinc-300/60 transition-colors focus-visible:ring-0"
                                            aria-label="More options"
                                        >
                                            <MoreVertical className="w-4 h-4 text-zinc-500" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuLabel>Podcast</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/workspace/host/view/${id}`} className="flex items-center gap-2 cursor-pointer">
                                                <FileText className="w-4 h-4" />
                                                <span>About</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        {!isPublished ? (
                                            <DropdownMenuItem 
                                                asChild
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePublishToggle(true);
                                                }}
                                            >
                                                <div className="flex items-center gap-2 cursor-pointer">
                                                    <ArrowUpRightFromSquare className="w-4 h-4" />
                                                    <span>Publish</span>
                                                </div>
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem 
                                                asChild
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePublishToggle(false);
                                                }}
                                            >
                                                <div className="flex items-center gap-2 cursor-pointer">
                                                    <ArrowUpRightFromSquare className="w-4 h-4" />
                                                    <span>Unpublish</span>
                                                </div>
                                            </DropdownMenuItem>        
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel>Page</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/`} className="flex items-center gap-2 cursor-pointer">
                                                <Eye className="w-4 h-4" />
                                                <span>Preview</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/`} className="flex items-center gap-2 cursor-pointer">
                                                <Edit className="w-4 h-4" />
                                                <span>Edit</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePodcast(id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <p className="text-sm text-left tracking-tight text-zinc-600 break-words max-w-prose line-clamp-2">
                            {description}
                        </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between w-full border-t border-zinc-200/50">
                        <div className="flex items-center gap-1.5 text-xs tracking-tight text-zinc-400">
                            <PenBox className="w-3.5 h-3.5" />
                            <span>{date}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-sm font-medium tracking-tight">
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
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}