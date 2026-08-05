"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/context/auth-context.tsx";
import { updatePodcast, deletePodcast } from "@/services/host.ts";
import { UpdatePodcastData } from "@/types/podcast.ts";
import { ApiError } from "@/types/error.ts";
import { WorkspacePodcastRecord } from "../../../types/workspace.ts";
import { useWorkspaceRefresh } from "../../../context/workspace/refresh-context.tsx";

interface UsePodcastWorkspaceCardProps {
    podcast?: WorkspacePodcastRecord;
}

export function usePodcastWorkspaceCard({ podcast }: UsePodcastWorkspaceCardProps = {}) {
    const { accessToken } = useAuth();
    const { triggerRefresh } = useWorkspaceRefresh();

    const [isLoading, setIsLoading] = useState<boolean>(!!podcast);
    const [error, setError] = useState<ApiError | null>(null);
    const [toastError, setToastError] = useState<string | null>(null);

    const showToastError = useCallback((message: string) => {
        setToastError(message);
        setTimeout(() => {
            setToastError((current) => (current === message ? null : current));
        }, 6000);
    }, []);

    const extractErrorMessage = (err: unknown, defaultMsg: string) => {
        if (err instanceof ApiError) {
            return (
                err.response?.error?.fields?.audio ||
                err.response?.error?.fields?.image ||
                err.response?.error?.message ||
                defaultMsg
            );
        }

        if (typeof err === "object" && err !== null && "message" in err) {
            const message = (err as { message?: unknown }).message;
            if (typeof message === "string") return message;
        }

        return defaultMsg;
    };

    const handlePublishToggle = useCallback(
        async (publishState: boolean) => {
            if (!accessToken || !podcast?.id) return;
            
            try {
                const updatePayload: UpdatePodcastData = { published: publishState };
                await updatePodcast(accessToken, podcast.id, updatePayload);
                
                triggerRefresh();
            } catch (err: unknown) {
                const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
                showToastError(`Podcast ${publishState ? "publishing" : "unpublishing"} failed: ${alertMessage}.`);
            }
        },
        [accessToken, podcast?.id, triggerRefresh, showToastError]
    );

    const handleDeletePodcast = useCallback(
        async () => {
            if (!accessToken || !podcast?.id) return;
            try {
                await deletePodcast(accessToken, podcast.id);                
                triggerRefresh();
            } catch (err: unknown) {
                const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
                showToastError(`Podcast deletion failed: ${alertMessage}.`);
            }
        },
        [accessToken, podcast?.id, triggerRefresh, showToastError]
    );

    return {
        podcast,
        isLoading,
        error,
        toastError,
        setToastError,
        handlePublishToggle,
        handleDeletePodcast,
    };
}