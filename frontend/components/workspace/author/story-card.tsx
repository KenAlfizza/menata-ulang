"use client";

import Link from "next/link";
import Image from "next/image";
import { PenBox, Plus } from "lucide-react";
import { formatDate } from "@/components/workspace/format-date";
import { WorkspaceStoryRecord } from "@/types/workspace.ts";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { useAuth } from "../../../context/auth-context.tsx";
import { useState } from "react";
import { deleteStory, setStoryPublishStatus } from "@/services/author.ts";
import { useWorkspaceRefresh } from "@/context/workspace/refresh-context.tsx";
import { StoryCardDropdown } from "./story-card-dropdown.tsx";

interface StoryCardProps {
    story?: WorkspaceStoryRecord;
    isNewStory?: boolean;
    isLoading?: boolean;
    onDelete?: (id: string) => void;
}

export function StoryCard({ story, isNewStory = false, isLoading = false, onDelete }: StoryCardProps) {
    const { accessToken } = useAuth();
    const { triggerRefresh } = useWorkspaceRefresh();
    const [currentStory, setCurrentStory] = useState<WorkspaceStoryRecord | undefined>(story);

    const id = currentStory?.id ?? story?.id ?? "0";
    const title = currentStory?.title ?? story?.title ?? "Untitled Story";
    const imageUrl = (currentStory?.imageUrl && currentStory.imageUrl.trim() !== "")
        ? currentStory.imageUrl
        : (story?.imageUrl && story.imageUrl.trim() !== "")
        ? story.imageUrl
        : "/logo-icon.svg";
    const alt = currentStory?.title ?? story?.title ? currentStory?.title ?? story?.title : "Story Image";
    const description = currentStory?.description ?? story?.description ?? "A short description of your story...";
    const date = currentStory?.updatedAt
        ? formatDate(new Date(currentStory.updatedAt))
        : story?.updatedAt
        ? formatDate(new Date(story.updatedAt))
        : formatDate(new Date());
    const isPublished = currentStory?.published ?? story?.published ?? false;

    const handlePublishToggle = async (publishState: boolean) => {
        if (!accessToken) return;
        try {
            const updatedStory = await setStoryPublishStatus(accessToken, id, publishState);
            setCurrentStory(updatedStory as unknown as WorkspaceStoryRecord);
            triggerRefresh();
        } catch (error: unknown) {
            let alertMessage = "An unexpected error occurred";
            try {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorString = errorMessage.replace(/^Error:\s*/, '');
                const parsedError = JSON.parse(errorString);
                if (parsedError?.message) alertMessage = parsedError.message;
            } catch {
                const errObj = error as { response?: { data?: { message?: string } } };
                alertMessage = errObj?.response?.data?.message || (error instanceof Error ? error.message : "Something went wrong");
            }
            alert(`Story ${publishState ? "publishing" : "unpublishing"} failed: ${alertMessage}. Please try again.`);
        }
    };

    const handleDeleteStory = async (storyId: string) => {
        if (!accessToken) return;
        try {
            await deleteStory(accessToken, storyId);
            if (onDelete) onDelete(storyId);
            triggerRefresh();
        } catch (error: unknown) {
            let alertMessage = "An unexpected error occurred";
            try {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorString = errorMessage.replace(/^Error:\s*/, '');
                const parsedError = JSON.parse(errorString);
                if (parsedError?.message) alertMessage = parsedError.message;
            } catch {
                const errObj = error as { response?: { data?: { message?: string } } };
                alertMessage = errObj?.response?.data?.message || (error instanceof Error ? error.message : "Something went wrong");
            }
            alert(`Story deletion failed: ${alertMessage}. Please try again.`);
        }
    };

    if (isLoading) {
        return (
            <Card className="w-full h-full min-h-[160px] bg-white/50 border border-zinc-100 shadow-sm animate-pulse">
                <CardContent className="flex flex-col h-full p-4 gap-4">
                    <div className="w-full h-32 bg-zinc-200 rounded-md" />
                    <div className="w-2/3 min-h-[2lh] bg-zinc-200 rounded" />
                    <div className="w-full min-h-[2lh] bg-zinc-200 rounded" />
                    <div className="flex justify-between mt-auto pt-2">
                        <div className="w-1/4 h-3 bg-zinc-200 rounded" />
                        <div className="w-1/4 h-3 bg-zinc-200 rounded" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isNewStory) {
        return (
            <Card className="group relative w-full bg-white/50 border-dashed border-zinc-200 hover:bg-zinc-200 transition-colors duration-200 flex items-center justify-center p-6 overflow-hidden">
                <Link
                    href="/workspace/story/new"
                    className="absolute inset-0 z-0 cursor-pointer"
                    aria-label="Create new research"
                />
                <Plus className="relative z-10 text-zinc-300 w-12 h-12 transition-transform duration-200 group-hover:scale-110 group-hover:text-zinc-500 pointer-events-none" />
            </Card>
        );
    }

    return (
        <Card className="group relative w-full bg-white/50 border border-zinc-100 shadow-sm hover:bg-zinc-100/80 transition-colors duration-200 overflow-hidden flex flex-col">
            <Link
                href={`/workspace/author/view/${id}`}
                className="absolute inset-0 z-10 cursor-pointer"
                aria-label={`View ${title}`}
            />
            <CardContent className="w-full flex flex-col h-full gap-3">
                {/* Image Container */}
                <div className="flex justify-center items-center w-full w-32 h-32 rounded-md overflow-hidden bg-zinc-100">
                    <Image
                        src={imageUrl}
                        alt={alt || "Story Image"}
                        width={128}
                        height={128}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                    />
                </div>
            
                {/* Title & Dropdown Row */}
                <div className="w-full flex items-start justify-between gap-2">
                    <h3 className="text-lg font-medium tracking-tight text-zinc-800 break-words group-hover:text-zinc-950 transition-colors line-clamp-2">
                        {title}
                    </h3>
                    <div className="relative z-20 shrink-0">
                        <StoryCardDropdown
                            story={currentStory ?? story ?? { id: "", title: "", published: false, description: "", imageUrl: "", updatedAt: "" }}
                            onPublishToggle={handlePublishToggle}
                            onDelete={handleDeleteStory}
                            accessToken={accessToken ?? ""}
                            triggerRefresh={triggerRefresh}
                        />
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-zinc-600 line-clamp-2 min-h-[2lh]">
                    {description}
                </p>

                {/* Footer Meta */}
                <div className="flex items-center justify-between w-full border-t border-zinc-200/50 pt-3 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <PenBox className="w-3.5 h-3.5" />
                        <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                        {isPublished ? (
                            <>
                                <span className="text-green-600 text-xs">Published</span>
                                <span className="w-1 h-1 rounded-full bg-green-500 shrink-0 animate-ping" />
                            </>
                        ) : (
                            <>
                                <span className="text-yellow-600 text-xs">Draft</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}