"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../../ui/card.tsx";
import { Label } from "../../ui/label.tsx";
import { Input } from "../../ui/input.tsx";
import { Button } from "../../ui/button.tsx";
import { ArrowLeft, ImageIcon, AlertCircle, X, Music } from "lucide-react";
import { createPodcast } from "@/services/host.ts";
import { useAuth } from "@/context/auth-context.tsx";
import { ApiError } from "@/types/error.ts";

import Image from "next/image";

export default function NewPodcast() {
    const router = useRouter();
    const { accessToken } = useAuth();

    // Form State
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [transcript, setTranscript] = useState("");
    const [image, setImage] = useState<File | undefined>(undefined);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [audio, setAudio] = useState<File | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Toast & Field Error States
    const [toastError, setToastError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Helper to display bottom error popup
    const showToastError = (message: string) => {
        setToastError(message);
        setTimeout(() => {
            setToastError((current) => (current === message ? null : current));
        }, 6000);
    };

    // Helper to extract message from ApiError or fallback using the correct response structure
    const extractErrorMessage = (err: any, defaultMsg: string) => {
        if (err instanceof ApiError) {
            if (typeof err.response?.error === "string") {
                return err.response.error;
            }
            if (err.response?.error?.message) {
                return err.response.error.message;
            }
        }
        return err?.message || defaultMsg;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudio(file);
        }
    };

    const handleDiscard = () => {
        setTitle("");
        setSlug("");
        setDescription("");
        setTranscript("");
        setImage(undefined);
        setImagePreview(null);
        setAudio(undefined);
        setToastError(null);
        setFieldErrors({});
        router.push(`/workspace/host`);
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!accessToken) {
            showToastError("You must be logged in to create a podcast.");
            return;
        }

        setToastError(null);
        setFieldErrors({});
        setIsSubmitting(true);

        try {
            const podcastData = {
                title,
                slug,
                description,
                transcript,
                image,
                audio,
            };

            const data = await createPodcast(accessToken, podcastData);
            router.push(`/workspace/host/view/${data.id}`);
        } catch (err: any) {
            const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
            showToastError(`Podcast creation failed: ${alertMessage}. Please try again.`);
            console.error(err);
            
            if (err instanceof ApiError && err.response?.error?.fields) {
                setFieldErrors(err.response.error.fields);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-zinc-100/50 relative pb-20">
            <div className="bg-white px-2 h-12 flex justify-between items-center border-b border-zinc-200">
                <div className="flex items-center gap-2">
                    <Button onClick={() => router.back()} variant="ghost" className="h-8 w-8 p-0 bg-zinc-100 hover:bg-zinc-200"><ArrowLeft size={16} /></Button>
                    <Image src="/logo-text.svg" alt="Logo" width={96} height={20} className="brightness-0" />
                    <span className="text-zinc-300">|</span>
                    <span className="text-xs tracking-tight text-zinc-500">CREATE PODCAST</span>
                </div>
            </div>

            <div className="p-8 space-y-8">
                <Card className="shadow-sm">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title Input */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Podcast Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="My Untitled Podcast"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Slug Input */}
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    className={fieldErrors.slug ? "border-red-500" : ""}
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    required
                                />
                                {fieldErrors.slug && (
                                    <p className="text-xs text-red-600">{fieldErrors.slug}</p>
                                )}
                            </div>

                            {/* Description Input */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    type="text"
                                    placeholder="A short description of your podcast..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Transcript Input */}
                            <div className="space-y-2">
                                <Label htmlFor="transcript">Transcript</Label>
                                <Input
                                    id="transcript"
                                    type="text"
                                    placeholder="Podcast transcript..."
                                    value={transcript}
                                    onChange={(e) => setTranscript(e.target.value)}
                                />
                            </div>

                            {/* Audio File Input */}
                            <div className="space-y-2">
                                <Label htmlFor="audio">Audio File</Label>
                                <Input 
                                    id="audio" 
                                    type="file" 
                                    accept="audio/*"
                                    onChange={handleAudioChange} 
                                />
                                {audio && (
                                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                        <Music size={14} /> Selected audio: {audio.name}
                                    </p>
                                )}
                                {fieldErrors.audio && (
                                    <p className="text-xs text-red-600">{fieldErrors.audio}</p>
                                )}
                            </div>

                            {/* Image Input & Preview */}
                            <div className="space-y-4">
                                <Label>Cover Image</Label>
                                <Input 
                                    id="picture" 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageChange} 
                                />
                                <label 
                                    htmlFor="picture" 
                                    className="cursor-pointer group flex flex-col justify-center items-center w-full min-h-48 border-2 border-dashed rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden p-4"
                                >
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-64 object-contain"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-zinc-400 group-hover:text-zinc-500">
                                            <ImageIcon size={48} className="mb-2" />
                                            <span className="text-sm font-medium">Click to upload image</span>
                                        </div>
                                    )}
                                </label>
                                {fieldErrors.image && (
                                    <p className="text-xs text-red-600">{fieldErrors.image}</p>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-2 pt-4 border-t">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="bg-green-400/60 hover:bg-green-400/100"
                                >
                                    {isSubmitting ? "Creating..." : "Create"}
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={handleDiscard}
                                    className="bg-red-400/60 hover:bg-red-400/100"
                                >
                                    Discard
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Floating Error Toast Popup */}
            {toastError && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg border border-red-500 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-lg w-[90%]">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm flex-1">{toastError}</span>
                    <Button 
                        onClick={() => setToastError(null)}
                        className="w-8 h-8 p-1 bg-red-600 hover:bg-red-700 rounded transition-colors text-white/80 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </main>
    );
}