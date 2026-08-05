"use client"

import { StoryCard } from "./story-card.tsx";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context.tsx";
import { WorkspaceStoryRecord } from "@/types/workspace.ts";
import { fetchRecentStories } from "@/services/workspace/author.ts";
import { ApiError } from "@/types/error.ts";
import { useWorkspaceRefresh } from "@/context/workspace/refresh-context.tsx";

export default function RecentStories() {
    const { accessToken } = useAuth();
    const { refreshKey } = useWorkspaceRefresh();

    const [recentStories, setRecentStories] = useState<WorkspaceStoryRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const extractErrorMessage = (err: unknown, defaultMsg: string) => {
        if (err instanceof ApiError) {
            const errorPayload = err.response?.error;
            if (typeof errorPayload === "string") return errorPayload;
            if (errorPayload?.message) return errorPayload.message;
        }
        if (err instanceof Error) return err.message;
        return defaultMsg;
    };

    useEffect(() => {
        async function loadRecentStories() {
            if (!accessToken) return;
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const items = await fetchRecentStories(accessToken);
                setRecentStories(items);
            } catch (err) {
                console.error(err);
                const message = extractErrorMessage(err, "Failed to load recent stories");
                setErrorMessage(message);
            } finally {
                setIsLoading(false);
            }
        }

        if (accessToken) {
            loadRecentStories();
        }
    }, [accessToken, refreshKey]); // refetch on token change OR on any refreshKey change

    if (isLoading) return <div className="py-4 text-gray-500">Loading stories...</div>;
    if (errorMessage) return <div className="py-4 text-red-500">{errorMessage}</div>;

    return (
        <div className="w-full">
            <h2 className="text-2xl tracking-tight text-zinc-600">Recent Stories</h2>

            {errorMessage && (
                <div className="w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm my-4">
                    {errorMessage}
                </div>
            )}

            <div className="flex flex-row gap-8 py-4">
                <div
                    className="w-full transition-opacity duration-300 ease-in-out"
                    style={{ opacity: isLoading ? 0.4 : 1 }}
                >
                    <div className="grid grid-cols-4 gap-8">
                        <StoryCard isNewStory />
                        {/* If loading, show skeletons. Otherwise, show stories. */}
                        {isLoading
                            ? Array.from({ length: 2 }).map((_, i) => <StoryCard key={`skeleton-${i}`} isLoading />)
                            : recentStories.map((story) => (
                                <StoryCard
                                    key={story.id}
                                    story={story}
                                />
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
