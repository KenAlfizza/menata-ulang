"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PenBox, Plus } from "lucide-react";

import { formatDate } from "@/components/workspace/format-date";

import { ResearchRecord } from "@/api/researcher.ts";;

interface ResearchCardProps {
    research?: ResearchRecord;
    isNewResearch?: boolean;
    isLoading?: boolean;
}

export function ResearchCard({ research, isNewResearch = false, isLoading = false }: ResearchCardProps) {
    if (!isLoading) {
        return (
            <Button 
                asChild
                className="w-full h-full bg-white/50 p-4 hover:bg-zinc-200 whitespace-normal shadow-sm"
            >
                <div className="w-full flex flex-col h-auto gap-3">
                    {/* Title */}
                    <div className="w-full text-xl text-center tracking-tight text-zinc-600 whitespace-normal break-words">
                        <div className="m-auto w-1/2 h-8 bg-zinc-100 rounded-sm shrink-0" />
                    </div>

                    {/* Description */}
                    <div className="w-full text-sm text-center tracking-tight text-zinc-600 whitespace-normal break-words">
                        <div className="m-auto w-3/4 h-6 bg-zinc-100 rounded-sm shrink-0" />
                    </div>

                    {/* Date */}
                    <div className="w-full text-sm text-center tracking-tight text-zinc-400">
                        <div className="m-auto w-1/4 h-6 bg-zinc-100 rounded-sm shrink-0" />
                    </div>

                    {/* Status */}
                    <div className="flex items-center text-md tracking-tight ml-auto gap-1 mt-auto">
                        <div className="w-16 h-4 bg-zinc-100 rounded-sm shrink-0" />
                    </div>
                </div>
            </Button>
        )
    }
    if (isNewResearch) {
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
        const id = research?.id ?? "0";
        const title = research?.title ?? "Untitled Research";
        const description = research?.description ?? "A short description describing the main point of the research"
        const date = research?.updatedAt ? formatDate(new Date(research.updatedAt)) : formatDate(new Date());
        const isPublished = research?.published ?? false;

        return (
            <Button 
                asChild
                className="w-full h-full bg-white/50 p-4 hover:bg-zinc-200 whitespace-normal shadow-sm"
            >
                <div className="w-full flex flex-col h-auto">
                    {/* Title */}
                    <div className="text-xl text-center tracking-tight text-zinc-600 whitespace-normal break-words">
                        {title}
                    </div>

                    {/* Description */}
                    <div className="text-sm text-center tracking-tight text-zinc-600 whitespace-normal break-words">
                        {description}
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