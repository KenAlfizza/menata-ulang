"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "../../ui/card.tsx";
import { Label } from "../../ui/label.tsx";
import { Input } from "../../ui/input.tsx";
import { Button } from "../../ui/button.tsx";
import { Textarea } from "../../ui/textarea.tsx"
import { ArrowLeft, Edit, ImageIcon, SquareArrowOutUpRight } from "lucide-react";
import { retrieveStory, updateStory } from "@/services/author.ts";
import { StoryRecord } from "../../../types/story.ts";
import { useAuth } from "@/context/auth-context.tsx";

import { Render } from "@puckeditor/core";
import { createPuckConfig } from "../../editor/story/puck.config.tsx";
import { StoryPageRecord } from "../../../types/page.ts";

import Link from "next/link";
import Image from "next/image";

interface StoryFormValues {
    title: string;
    slug: string;
    description: string;
}

export default function WorkspaceViewStory({ storyId }: { storyId: string }) {
    const router = useRouter();
    const { accessToken } = useAuth();

    // Initialize react-hook-form
    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting, isDirty, dirtyFields, errors },
    } = useForm<StoryFormValues>();

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [isImageDirty, setIsImageDirty] = useState(false);

    const [storyPagePreview, setStoryPagePreview] = useState<StoryPageRecord>();

    const [isRollingBack, setIsRollingBack] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [story, setStory] = useState<StoryRecord>();
    const [isLoading, setIsLoading] = useState(true);

    // Fetch story data on mount
    useEffect(() => {
        async function fetchStory() {
            if (!accessToken || !storyId) return;

            try {
                setIsLoading(true);
                const data = await retrieveStory(accessToken, storyId);
                setStory(data);

                // Populate form using reset()
                reset({
                    title: data.title,
                    slug: data.slug,
                    description: data.description || "",
                });
                setImagePreview(data.imageUrl);
                setPendingFile(null);
                setIsImageDirty(false);
                setStoryPagePreview(data.page);
            } catch (err: any) {
                setError("Failed to load story.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchStory();
    }, [accessToken, storyId, reset]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPendingFile(file);
            setImagePreview(URL.createObjectURL(file));
            setIsImageDirty(true);
        }
    };

    const handleDiscard = () => {
        if (!story) return;
        setIsRollingBack(true);

        // Reset form to the fetched 'story' object state
        reset({
            title: story.title,
            slug: story.slug,
            description: story.description || "",
        });
        setImagePreview(story.imageUrl);
        setPendingFile(null);
        setIsImageDirty(false);
        setError(null);

        // Short timeout for UI feedback
        setTimeout(() => setIsRollingBack(false), 300);
    };

    const onSubmit = async (data: StoryFormValues) => {
        if (!accessToken) return;

        try {
            // Build updatePayload dynamically containing ONLY updated (dirty) fields
            const updatePayload: {
                title?: string;
                description?: string;
                slug?: string;
                image?: File;
            } = {};

            if (dirtyFields.title) updatePayload.title = data.title;
            if (dirtyFields.description) updatePayload.description = data.description;
            if (dirtyFields.slug) updatePayload.slug = data.slug;
            if (isImageDirty && pendingFile) updatePayload.image = pendingFile;

            const updatedStory = await updateStory(accessToken, storyId, updatePayload);
            console.log("Story updated successfully:", updatedStory);
            
            // Sync current state base to clear dirty tracking if desired
            setStory(updatedStory);
            setPendingFile(null);
            setIsImageDirty(false);
            reset(data);
        } catch (error: any) {
            console.error("Update failed:", error);
            
            let alertMessage = "An unexpected error occurred";

            try {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorString = errorMessage.replace(/^Error:\s*/, '');
                const parsedError = JSON.parse(errorString);
                
                if (parsedError?.fields?.image) {
                    alertMessage = parsedError.fields.image;
                } else if (parsedError?.message) {
                    alertMessage = parsedError.message;
                }
            } catch (parseError) {
                alertMessage = error?.response?.data?.message || (error instanceof Error ? error.message : "Something went wrong");
            }

            alert(`Update failed: ${alertMessage}. Please try again.`);
        }
    };

    if (isLoading) return <main className="m-8">Loading...</main>;

    // Form is considered dirty if any form field changed OR a new image was selected
    const hasChanges = isDirty || isImageDirty;

    return (
        <main className="min-h-screen bg-zinc-100/50">
            <div className="bg-white px-2 h-12 flex justify-between items-center border-b border-zinc-200">
                <div className="flex items-center gap-2">
                    <Button onClick={() => router.back()} variant="ghost" className="h-8 w-8 p-0 bg-zinc-100 hover:bg-zinc-200"><ArrowLeft size={16} /></Button>
                    <Image src="/logo-text.svg" alt="Logo" width={96} height={20} className="brightness-0" />
                    <span className="text-zinc-300">|</span>
                    <span className="text-xs tracking-tight text-zinc-500">VIEW STORY</span>
                </div>
            </div>

            <div className="p-8 space-y-8">
                <Card className="shadow-sm">
                    <CardHeader>
                        <Label className="text-lg">About Story</Label>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded border border-red-200">
                                    {error}
                                </div>
                            )}
                            <div className="flex flex-row gap-4 items-center">
                                <div className="min-w-64 space-y-4">
                                    <input
                                        id="picture"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    <label
                                        htmlFor="picture"
                                        className="cursor-pointer group flex flex-col justify-center items-center w-full min-h-48 border-2 border-dashed rounded-lg bg-slate-50 overflow-hidden"
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="max-h-64 object-contain" />
                                        ) : (
                                            <div className="flex flex-col items-center text-zinc-400">
                                                <ImageIcon size={48} />
                                                <span>Click to upload image</span>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                <div className="w-full px-2 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="whitespace-nowrap" htmlFor="title">Title</Label>
                                        <Input 
                                            className="!text-2xl !leading-tight !h-auto !py-2 bg-transparent" 
                                            id="title" 
                                            {...register("title", { required: true })} 
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="whitespace-nowrap" htmlFor="description">Description</Label>
                                        <Textarea className="" id="description" {...register("description")} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="whitespace-nowrap" htmlFor="slug">URL Slug:</Label>
                                        <Input
                                            id="slug"
                                            {...register("slug", { required: true })}
                                            className={errors.slug ? "text-red-500" : ""}
                                        />
                                    </div>
                                </div>
                            </div>

                            {hasChanges && 
                                <div className="flex items-center justify-end gap-2 pt-4 border-t">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !hasChanges}
                                        className="bg-green-400/60 hover:bg-green-400/100"
                                    >
                                        {isSubmitting ? "Saving..." : "Save"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleDiscard}
                                        disabled={isRollingBack || !hasChanges}
                                        className="bg-red-400/60 hover:bg-red-400/100"
                                    >
                                        {isRollingBack ? "Rolling back..." : "Discard"}
                                    </Button>
                                </div>
                            }
                        </form>
                    </CardContent>
                </Card>

                {storyPagePreview ? (
                <Card className="shadow-sm">
                    <CardHeader className="flex items-center">
                        <Label className="text-lg">Story Page</Label>
                        <Link
                            className="ml-auto space-x-1"
                            href={`/workspace/author/edit/${storyPagePreview.id}`}>
                            <Button
                                className="bg-green-400/60 hover:bg-green-400/100"
                            >
                                <Edit size={16}/>Edit
                            </Button>
                            <Button
                                className="bg-yellow-400/60 hover:bg-yellow-400/100"
                            >
                                <SquareArrowOutUpRight size={16}/>Publish
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="max-h-128 overflow-hidden [mask-image:linear-gradient(to_bottom,black_calc(100%-4rem),transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_calc(100%-4rem),transparent_100%)]">
                        <Link
                            href={`/workspace/author/edit/${storyPagePreview.id}`}>
                            <div className="min-h-64 hover:bg-zinc-100/70 rounded-lg p-1">          
                                <Render config={createPuckConfig(accessToken || "")} data={storyPagePreview.puckData} />
                            </div>
                        </Link>
                    </CardContent>
                </Card> 
                ) : (
                 <Card>
                    <div className="p-4 text-center text-zinc-500">
                        Loading page preview...
                    </div>
                </Card>  
                )}
            </div>
        </main>
    )
}