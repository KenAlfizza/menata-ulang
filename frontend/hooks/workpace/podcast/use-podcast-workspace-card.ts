"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context.tsx";
import { retrievePodcast, updatePodcast, deletePodcast } from "@/services/host.ts";
import { PodcastRecord, UpdatePodcastData } from "@/types/podcast.ts";
import { ApiError } from "@/types/error.ts";

export function usePodcastWorkspaceCard(podcastId: string) {
    const { accessToken } = useAuth();

    const [podcast, setPodcast] = useState<PodcastRecord | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(!!podcastId);
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
            if (typeof message === "string") {
                return message;
            }
        }

        return defaultMsg;
    };

    useEffect(() => {
        async function fetchPodcastData() {
            if (!accessToken || !podcastId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const data = await retrievePodcast(accessToken, podcastId);
                setPodcast(data);
            } catch (err: unknown) {
                if (err instanceof ApiError) {
                    setError(err);
                }
            } finally {
                setIsLoading(false);
            }
        }

        fetchPodcastData();
    }, [accessToken, podcastId]);

    const handlePublishToggle = useCallback(
        async (publishState: boolean) => {
            if (!accessToken || !podcastId) return;

            try {
                const updatePayload: UpdatePodcastData = { published: publishState };
                const updatedPodcast = await updatePodcast(accessToken, podcastId, updatePayload);
                setPodcast(updatedPodcast);
            } catch (err: unknown) {
                const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
                showToastError(`Podcast ${publishState ? "publishing" : "unpublishing"} failed: ${alertMessage}.`);
            }
        },
        [accessToken, podcastId, extractErrorMessage, showToastError]
    );

    const handleDeletePodcast = useCallback(
        async () => {
            if (!accessToken || !podcastId) return;

            try {
                await deletePodcast(accessToken, podcastId);
            } catch (err: unknown) {
                const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
                showToastError(`Podcast deletion failed: ${alertMessage}.`);
            }
        },
        [accessToken, podcastId, extractErrorMessage, showToastError]
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
