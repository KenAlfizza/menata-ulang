"use client";

import Link from "next/link";
import Image from "next/image";
import { PenBox, Plus } from "lucide-react";

import { formatDate } from "@/components/workspace/format-date";
import { WorkspaceResearchRecord } from "@/types/workspace.ts";

interface ResearchCardProps {
    research?: WorkspaceResearchRecord;
    isNewResearch?: boolean;
    isLoading?: boolean;
}

export function ResearchCard({ research, isNewResearch = false, isLoading = false }: ResearchCardProps) {
    // LOADING SKELETON (Using semantic divs + pulse animations instead of Button wrapper)
    if (isLoading) {
        return (
            <div className="w-full h-full bg-white/50 p-4 border border-zinc-100 rounded-md shadow-sm animate-pulse flex flex-col gap-3 justify-between">
                <div className="w-full flex flex-col gap-3 items-center">
                    {/* Title Skeleton */}
                    <div className="w-1/2 h-7 bg-zinc-200 rounded" />
                    
                    {/* Description Skeleton */}
                    <div className="w-3/4 h-5 bg-zinc-200 rounded mt-1" />
                </div>

                {/* Bottom row wrapping Date & Status Skeletons */}
                <div className="mt-auto pt-2 flex items-center justify-between w-full border-t border-zinc-200/50">
                    {/* Date Skeleton */}
                    <div className="w-1/4 h-4 bg-zinc-200 rounded" />
                    {/* Status Skeleton */}
                    <div className="w-16 h-4 bg-zinc-200 rounded" />
                </div>
            </div>
        );
    }

    // CREATE NEW RESEARCH STATE (Semantic block Link anchor optimized for centering)
    if (isNewResearch) {
        return (
            <Link 
                href="/workspace/researcher/new" 
                className="group flex w-full h-full min-h-[180px] bg-white/50 p-6 hover:bg-zinc-200 border border-zinc-100 border-dashed rounded-md shadow-sm items-center justify-center transition-colors duration-200"
            >
                <Plus className="text-zinc-300 w-16 h-16 transition-transform duration-200 group-hover:scale-110 group-hover:text-zinc-500" />
            </Link>
        );
    }

    // BASE CONTENT STATE
    const id = research?.id ?? "0";
    const title = research?.title ?? "Untitled Research";
    const description = research?.description ?? "A short description describing the main point of the research";
    const date = research?.updatedAt ? formatDate(new Date(research.updatedAt)) : formatDate(new Date());
    const isPublished = research?.published ?? false;

    return (
        <Link 
            href={`/workspace/researcher/view/${id}`}
            className="group block w-full h-full bg-white/50 p-4 hover:bg-zinc-200 rounded-md shadow-sm border border-zinc-100 transition-colors duration-200"
        >
            <div className="w-full flex flex-col h-full gap-3">
                {/* Title */}
                <h3 className="text-xl text-center font-medium tracking-tight text-zinc-800 break-words group-hover:text-zinc-950 transition-colors">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-sm text-center tracking-tight text-zinc-600 break-words">
                    {description}
                </p>

                {/* Bottom row wrapping Date & Status */}
                <div className="mt-auto pt-2 flex items-center justify-between w-full border-t border-zinc-200/50">
                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs tracking-tight text-zinc-400">
                        <PenBox className="w-4 h-4" /> 
                        <span>{date}</span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-1.5 text-sm font-medium tracking-tight">
                        {isPublished ? (
                            <>
                                <span className="text-green-600">Published</span>
                                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 animate-pulse" />
                            </>
                        ) : (
                            <>
                                <span className="text-yellow-600">Draft</span>
                                <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
