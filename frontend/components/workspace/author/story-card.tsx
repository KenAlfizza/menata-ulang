"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PenBox, Plus } from "lucide-react";

import { formatDate } from "@/components/workspace/format-date";
import type { RecentStoryRecord } from "@/api/author";

interface StoryCardProps {
    story?: RecentStoryRecord;
    isNewStory?: boolean;
    isLoading?: boolean;
}

export function StoryCard({ story, isNewStory = false, isLoading = false }: StoryCardProps) {
    if (isLoading) {
        return (
            <Button 
                asChild
                className="w-full h-full bg-white/50 p-4 hover:bg-zinc-200 whitespace-normal shadow-sm"
            >
                <div className="w-full flex flex-col h-auto gap-3">
                    {/* Image */}
                    <div className="w-40 h-32 bg-zinc-100 rounded-md shrink-0"/>

                    {/* Title */}
                    <div className="text-xl text-center tracking-tight text-zinc-600 whitespace-normal break-words">
                        <div className="w-40 h-8 bg-zinc-100 rounded-sm shrink-0" />
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-sm text-center tracking-tight text-zinc-400">
                        <div className="w-20 h-6 bg-zinc-100 rounded-sm shrink-0" />
                    </div>

                    {/* Status */}
                    <div className="flex items-center text-md tracking-tight ml-auto gap-1 mt-auto">
                        <div className="w-16 h-4 bg-zinc-100 rounded-sm shrink-0" />
                    </div>
                </div>
            </Button>
        )
    }
    if (isNewStory) {
        return (
            <Button
                asChild
                className="flex w-full h-full bg-white/50 p-6 hover:bg-zinc-200 shadow-sm">
                    <Link href="/workspace/author/new" className="flex">
                        <Plus className="text-zinc-300 !size-16" />
                    </Link>
            </Button>
        );
    } else {
        // Exact fallback logic evaluation constants matching your original signature
        const id = story?.id ?? "0";
        const title = story?.title ?? "Story title";
        const image = (story?.imageUrl && story.imageUrl.trim() !== "") ? story.imageUrl : "/logo-icon.svg";
        const alt = story?.title ? story.title : "Story Image";
        const date = story?.updatedAt ? formatDate(new Date(story.updatedAt)) : formatDate(new Date());
        const isPublished = story?.published ?? false;

        return (
            <Button 
                asChild
                className="w-full h-full bg-white/50 p-4 hover:bg-zinc-200 whitespace-normal shadow-sm"
            >
                <div className="w-full flex flex-col h-auto">
                    {/* Image */}
                    <Image
                        src={image}
                        alt={alt}
                        width={128}
                        height={128}
                        className="shrink-0"
                    />

                    {/* Title */}
                    <div className="text-xl text-center tracking-tight text-zinc-600 whitespace-normal break-words">
                        {title}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-sm text-center tracking-tight text-zinc-400">
                        <PenBox /> {date}
                    </div>

                    {/* Status */}
                    <div className="flex items-center text-md tracking-tight ml-auto gap-1 mt-auto">
                        {isPublished ? (
                            <>
                                <span className="text-green-500">Published</span>
                                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                            </>
                        ) : (
                            <>
                                <span className="text-yellow-500">Draft</span>
                                <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                            </>
                        )}
                    </div>
                </div>
            </Button>
        );
    }
}