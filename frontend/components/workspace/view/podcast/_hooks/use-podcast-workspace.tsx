// app/workspace/host/[podcastId]/_hooks/usePodcastWorkspace.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { retrievePodcast, updatePodcast } from "@/services/host";
import { PodcastRecord, UpdatePodcastData } from "@/types/podcast.ts";
import { useAuth } from "@/context/auth-context.tsx";
import { ApiError } from "@/types/error.ts";
import { formatDate } from "@/utils/format-date.ts";

export interface AboutFormValues {
    title: string;
    slug: string;
    description: string;
}

export interface TranscriptFormValues {
    transcript: string;
}

export function usePodcastWorkspace(podcastId: string) {
    const router = useRouter();
    const { accessToken } = useAuth();

    // Image state
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
    const [isImageDirty, setIsImageDirty] = useState(false);

    // Audio state
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const [pendingAudioFile, setPendingAudioFile] = useState<File | null>(null);
    const [isAudioDirty, setIsAudioDirty] = useState(false);

    // Error & Loading state
    const [error, setError] = useState<string | null>(null);
    const [toastError, setToastError] = useState<string | null>(null);
    const [podcast, setPodcast] = useState<PodcastRecord>();
    const [isLoading, setIsLoading] = useState(true);

    // Forms
    const aboutForm = useForm<AboutFormValues>();
    const audioForm = useForm();
    const transcriptForm = useForm<TranscriptFormValues>();

    const showToastError = useCallback((message: string) => {
        setToastError(message);
        setTimeout(() => {
            setToastError((current) => (current === message ? null : current));
        }, 6000);
    }, []);

    const extractErrorMessage = (err: any, defaultMsg: string) => {
        if (err instanceof ApiError) {
            const errorMessage = 
                err.response?.error?.fields?.audio ||
                err.response?.error?.fields?.image ||
                err.response?.error?.message ||
                defaultMsg;

            return errorMessage;
        }
        return err?.message || defaultMsg;
    };

    // Fetch on mount
    useEffect(() => {
        async function fetchPodcastData() {
            if (!accessToken || !podcastId) return;

            try {
                setIsLoading(true);
                const data = await retrievePodcast(accessToken, podcastId);
                setPodcast(data);

                aboutForm.reset({
                    title: data.title,
                    slug: data.slug,
                    description: data.description || "",
                });
                transcriptForm.reset({
                    transcript: data.transcript || "",
                });

                setAudioPreview(data.audioUrl);
                setPendingAudioFile(null);
                setIsAudioDirty(false);
                
                setImagePreview(data.imageUrl);
                setPendingImageFile(null);
                setIsImageDirty(false);
            } catch (err: any) {
                if (err instanceof ApiError) {
                    setError(err.response?.error?.message || "Failed to load podcast.");
                } else {
                    setError("Failed to load podcast.");
                }
            } finally {
                setIsLoading(false);
            }
        }

        fetchPodcastData();
    }, [accessToken, podcastId, aboutForm, transcriptForm]);

    // Handlers
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPendingImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setIsImageDirty(true);
        }
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPendingAudioFile(file);
            setAudioPreview(URL.createObjectURL(file));
            setIsAudioDirty(true);
        }
    };

    const handleDiscardAbout = () => {
        if (!podcast) return;
        aboutForm.reset({
            title: podcast.title,
            slug: podcast.slug,
            description: podcast.description || "",
        });
        setImagePreview(podcast.imageUrl);
        setPendingImageFile(null);
        setIsImageDirty(false);
        setError(null);
    };

    const handleDiscardAudio = () => {
        if (!podcast) return;
        setAudioPreview(podcast.audioUrl || null);
        setPendingAudioFile(null);
        setIsAudioDirty(false);
    };

    const handleDiscardTranscript = () => {
        if (!podcast) return;
        transcriptForm.reset({
            transcript: podcast.transcript || "",
        });
    };

    const handlePublishToggle = async (publishState: boolean) => {
        if (!accessToken) return;
        try {
            const updatePayload: UpdatePodcastData = {
                published: publishState
            };
            const podcast = await updatePodcast(accessToken, podcastId, updatePayload);
            setPodcast(podcast);

        } catch (err: any) {
            const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
            showToastError(`Podcast ${publishState ? "publishing" : "unpublishing"} failed: ${alertMessage}.`);
        }
    };

    const handleDeletePodcast = async () => {
        if (!accessToken) return;
        try {
            router.push("/workspace/host"); 
        } catch (err: any) {
            const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
            showToastError(`Podcast deletion failed: ${alertMessage}.`);
        }
    };

    const onSubmitAbout = async (data: AboutFormValues) => {
        if (!accessToken) return;
        try {
            const updatePayload: UpdatePodcastData = {};
            if (aboutForm.formState.dirtyFields.title) updatePayload.title = data.title;
            if (aboutForm.formState.dirtyFields.description) updatePayload.description = data.description;
            if (aboutForm.formState.dirtyFields.slug) updatePayload.slug = data.slug;
            if (isImageDirty && pendingImageFile) updatePayload.image = pendingImageFile;

            const podcast = await updatePodcast(accessToken, podcastId, updatePayload);
            setPodcast(podcast);

            setPendingImageFile(null);
            setIsImageDirty(false);
            aboutForm.reset(data);
        } catch (err: any) {
            const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
            showToastError(`Podcast update failed: ${alertMessage}.`);
        }
    };

    const onSubmitTranscript = async (data: TranscriptFormValues) => {
        if (!accessToken) return;
        try {
            const updatePayload: UpdatePodcastData = {};
            if (transcriptForm.formState.dirtyFields.transcript) updatePayload.transcript = data.transcript;

            const podcast = await updatePodcast(accessToken, podcastId, updatePayload);
            setPodcast(podcast);

            transcriptForm.reset(data);
        } catch (err: any) {
            const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
            showToastError(`Transcript update failed: ${alertMessage}.`);
        }
    };

    const onSubmitAudio = async () => {
        if (!accessToken || !pendingAudioFile) return;
        try {

            const updatePayload: UpdatePodcastData = {
                audio: pendingAudioFile,
            };

            const podcast = await updatePodcast(accessToken, podcastId, updatePayload);
            setPodcast(podcast);

            setPendingAudioFile(null);
            setIsAudioDirty(false);
        } catch (err: any) {
            const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
            showToastError(`Audio update failed: ${alertMessage}.`);
        }
    };

    return {
        router,
        podcast,
        isLoading,
        error,
        toastError,
        setToastError,
        aboutForm,
        audioForm,
        transcriptForm,
        imagePreview,
        audioPreview,
        isImageDirty,
        isAudioDirty,
        handleImageChange,
        handleAudioChange,
        handleDiscardAbout,
        handleDiscardAudio,
        handleDiscardTranscript,
        handlePublishToggle,
        handleDeletePodcast,
        onSubmitAbout,
        onSubmitTranscript,
        onSubmitAudio,
        updatedAt: podcast?.updatedAt ? formatDate(new Date(podcast.updatedAt)) : "",
        publishedAt: podcast?.publishedAt ? formatDate(new Date(podcast.publishedAt)) : "",
        isPublished: podcast?.published ?? false,
    };
}