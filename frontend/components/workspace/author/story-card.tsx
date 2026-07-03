"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PenBox, Plus } from "lucide-react";

import { formatDate } from "@/components/workspace/format-date"

export function StoryCard({ 
    title = "Story title",
    image = "/logo-icon.svg",
    alt = "Story Image",
    date = formatDate(new Date),
    isNewStory = false, 
    isPublished = false 
    
}:{ 
    title? : string,
    image? : string,
    alt?: string;
    date?: string,
    isNewStory?: boolean, 
    isPublished?: boolean, 
}) {
    if (isNewStory) {
        return (
            <Button
                asChild
                className="flex w-full h-full bg-white/50 p-6 hover:bg-zinc-200 shadow-sm">
                    <Link href="/workspace/author/new" className="flex">
                        <Plus className="text-zinc-300 !size-16" />
                    </Link>
            </Button>
        )

    } else {
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
                        <PenBox/> {date}
                    </div>

                    {/* Status */}
                    <div className="flex items-center text-md tracking-tight ml-auto gap-1 mt-auto">
                        { isPublished ? 
                            <>
                            <span className="text-green-500">Published</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                            </>
                            :
                            <>
                            <span className="text-yellow-500">Draft</span>
                            <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                            </>
                        }
                    </div>
                </div>
            </Button>
        )
    }
}