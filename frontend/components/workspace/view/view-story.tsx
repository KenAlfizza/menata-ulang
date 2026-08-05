"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "../../ui/card.tsx";
import { Label } from "../../ui/label.tsx";
import { Input } from "../../ui/input.tsx";
import { Button } from "../../ui/button.tsx";
import { Textarea } from "../../ui/textarea.tsx";
import { 
  ArrowDownLeftFromSquare, 
  ArrowLeft, 
  ArrowUpRightFromSquare, 
  Edit, 
  Eye, 
  ImageIcon, 
  PenBox, 
  Save, 
  Trash2,
  X, 
  AlertCircle 
} from "lucide-react";
import { retrieveStory, updateStory, setStoryPublishStatus, deleteStory } from "@/services/author.ts";
import { StoryRecord } from "@/types/story.ts";
import { useAuth } from "@/context/auth-context.tsx";
import { ApiError } from "@/types/error.ts";
import { formatDate } from "@/utils/format-date.ts";
import { Render } from "@puckeditor/core";
import { StoryPageRecord } from "@/types/page.ts";
import { createPuckConfig } from "../../editor/story/puck.config.tsx";

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
    const [toastError, setToastError] = useState<string | null>(null);
    const [story, setStory] = useState<StoryRecord>();
    const [isLoading, setIsLoading] = useState(true);

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
            return err.response?.error?.fields?.image || err.response?.error || defaultMsg;
        }
        return err?.message || defaultMsg;
    };

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
                if (err instanceof ApiError) {
                    setError(err.response?.error?.message || "Failed to load story.");
                } else {
                    setError("Failed to load story.");
                }
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
            
            // Sync current state base to clear dirty tracking if desired
            setStory(updatedStory);
            setPendingFile(null);
            setIsImageDirty(false);
            reset(data);
        } catch (err: any) {
            const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
            showToastError(`Story update failed: ${alertMessage}. Please try again.`);
            console.error(err);
        }
    };

    const handlePublishToggle = async (publishState: boolean) => {
        if (!accessToken) return;
        try {
            const updatedStory = await setStoryPublishStatus(accessToken, storyId, publishState);
            setStory(updatedStory as StoryRecord);
        } catch (err: any) {
            const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
            showToastError(`Story ${publishState ? "publishing" : "unpublishing"} failed: ${alertMessage}. Please try again.`);
            console.error(err);
        }
    };

    const handleDeleteResearch = async () => {
        if (!accessToken) return;
        try {
            await deleteStory(accessToken, storyId);
            // Handle post-deletion logic (e.g., redirecting or updating parent state)
            router.push("/workspace/author");
        } catch (err: any) {
            const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
            showToastError(`Story deletion failed: ${alertMessage}. Please try again.`);
            console.error(err);
        }
    };

    if (isLoading) return <main className="m-8">Loading...</main>;

    // Form is considered dirty if any form field changed OR a new image was selected
    const hasChanges = isDirty || isImageDirty;
    const updatedAt = story?.updatedAt ? formatDate(new Date(story.updatedAt)) : "";
    const isPublished = story?.published ?? false;
    const publishedAt = story?.publishedAt ? formatDate(new Date(story.publishedAt)) : "";

    return (
        <main className="min-h-screen bg-zinc-100 relative pb-20">
            <div className="sticky top-0 z-50 bg-white px-2 h-12 border-b border-zinc-300 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Button onClick={() => router.back()} variant="ghost" className="h-8 w-8 p-0 bg-zinc-200/25 hover:bg-zinc-200/50">
                        <ArrowLeft size={16} />
                    </Button>
                    <Image src="/logo-text.svg" alt="Logo" width={96} height={20} className="brightness-0" priority />
                    <span className="text-black/50">|</span>
                    <span className="text-xs tracking-tight text-black/50">STORY</span>
                </div>
            </div>

            <div className="p-8 space-y-4">
                <Card className="shadow-sm">
                    <CardContent>
                       <section className="p-2">
                            <div className="flex flex-row">
                                <div className="flex flex-col">
                                    <Label className="text-lg">About Story</Label>
                                    <span className="text-zinc-500">Update detailed information of your story, including its title, description, slug, and image.</span>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5 text-xs tracking-tight text-zinc-400">
                                    <PenBox className="w-3.5 h-3.5" /> 
                                    <span>Updated: {updatedAt}</span>
                                </div>
                                
                                {/* Container for buttons with invisible/retained layout footprint or absolute conditional rendering */}
                                <div className="flex items-center">
                                    {hasChanges ? (
                                        <div className="flex items-center gap-1 text-white animate-in fade-in duration-200">
                                            <Button 
                                                className="bg-green-400/60 hover:bg-green-400/100"
                                                onClick={handleSubmit(onSubmit)}>
                                                <Save className="w-4 h-4" />
                                                <span>Save</span>
                                            </Button>
                                            <Button 
                                                className="bg-red-400/60 hover:bg-red-400/100"
                                                onClick={handleDiscard}>
                                                <X className="w-4 h-4" />
                                                <span>Discard</span>
                                            </Button>
                                        </div>
                                    ) : (
                                        /* Empty placeholder div with matching height to reserve space and prevent layout shifts */
                                        <div className="h-8" />
                                    )}
                                </div>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                                {error && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded border border-red-200">
                                        {error}
                                    </div>
                                )}
                                <div className="flex flex-row gap-8 items-center">
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
                                            className="cursor-pointer group flex flex-col justify-center items-center w-full min-h-48 border-2 border-dashed rounded-lg bg-slate-50 overflow-hidden relative"
                                        >
                                            <span className="sr-only">Upload story image</span>
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

                                    <div className="w-full space-y-4">
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
                                            <Textarea id="description" {...register("description")} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="whitespace-nowrap" htmlFor="slug">URL Slug:</Label>
                                            <Input
                                                id="slug"
                                                {...register("slug", { required: true})}
                                                className={errors.slug ? "text-red-500" : ""}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </section>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent>
                        <section className="p-2">
                            <div className="flex flex-row">
                                <div className="flex flex-col">
                                    <Label className="text-lg">Story Page</Label>
                                    <span className="text-zinc-500">Preview your story page to see how it looks to readers, or jump straight into the editor to make changes.</span>
                                </div>
                                
                                {storyPagePreview && (
                                <div className="ml-auto flex items-center gap-1">
                                    <Link
                                        href={`/workspace/author/edit/${storyPagePreview.id}`}
                                    >
                                        <Button className="cursor-pointer bg-green-400/60 hover:bg-green-400/100">
                                            <Edit size={16} /> Edit
                                        </Button>
                                    </Link>
                                    <Link href={`/`} target="_blank">
                                        <Button className="cursor-pointer bg-blue-400/60 hover:bg-blue-400/100">
                                            <Eye className="w-4 h-4" />
                                            <span>Preview</span>
                                        </Button>
                                    </Link>
                                </div>
                                )}
                            </div>

                            {storyPagePreview ? (
                            <div className="border rounded-lg max-h-128 overflow-hidden [mask-image:linear-gradient(to_bottom,black_calc(100%-4rem),transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_calc(100%-4rem),transparent_100%)] mt-2">
                                <Link href={`/workspace/author/edit/${storyPagePreview.id}`}>
                                    <div className="min-h-64 hover:bg-zinc-100/70 rounded-lg">
                                        <Render config={createPuckConfig(accessToken || "")} data={storyPagePreview.puckData} />
                                    </div>
                                </Link>
                            </div>
                            ) : (
                            <div>
                                <div className="flex items-center justify-center border rounded-lg min-h-64 overflow-hidden [mask-image:linear-gradient(to_bottom,black_calc(100%-4rem),transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_calc(100%-4rem),transparent_100%)] mt-2">
                                    <span className="text-zinc-400">Loading story page preview...</span>
                                </div>
                            </div>
                            )}
                            
                        </section>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent>                        
                        <section className="p-2 flex flex-row items-center gap-8 w-full border-zinc-200/50">
                            <div className="flex flex-col">
                                <Label className="text-lg">Visibility</Label>
                                <span className="text-zinc-500">Publish this story for everyone to see, or keep it hidden as a private draft.</span>
                                {publishedAt && (
                                   <div className="mt-1 flex items-center gap-1.5 text-xs tracking-tight text-zinc-400">
                                        <ArrowUpRightFromSquare className="w-3.5 h-3.5" /> 
                                        <span>Published: {publishedAt}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4 ml-auto">
                                <div className="flex items-center gap-1.5 font-medium tracking-tight">
                                    {isPublished ? (
                                        <>
                                            <span className="text-green-600">Published</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 animate-pulse" />
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-yellow-600">Draft</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                                        </>
                                    )}
                                </div>
                                <div>
                                    {!isPublished && (
                                    <Button 
                                        className="bg-yellow-400/60 hover:bg-yellow-400/100"
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            handlePublishToggle(true);
                                        }}
                                    >
                                        <ArrowUpRightFromSquare className="w-4 h-4" />
                                        <span>Publish</span>
                                    </Button>
                                    )}
                                    {isPublished && (
                                    <Button 
                                        className="bg-red-400/60 hover:bg-red-400/100"
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            handlePublishToggle(false);
                                        }}
                                    >
                                        <ArrowDownLeftFromSquare className="w-4 h-4" />
                                        <span>Unpublish</span>
                                    </Button>
                                    )}
                                </div>
                            </div>
                        </section>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent>   
                        <section className="p-2 flex flex-row items-center gap-8 w-full border-zinc-200/50">
                            <div className="flex flex-col">
                                <Label className="text-lg">Delete</Label>
                                <span className="text-zinc-500">Permanently delete this story from the website.</span>
                            </div>
                            <Button 
                                className="ml-auto bg-red-400/60 hover:bg-red-400/100"
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    handleDeleteResearch();
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                            </Button>
                        </section>
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
