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
import { ArrowDownLeftFromSquare, ArrowLeft, ArrowUpRightFromSquare, Edit, Eye, ImageIcon, PenBox, Save, Trash2, X, AlertCircle } from "lucide-react";
import { retrieveResearch, updateResearch, setResearchPublishStatus, deleteResearch } from "@/services/researcher.ts";
import { ResearchRecord } from "@/types/research.ts";
import { useAuth } from "@/context/auth-context.tsx";
import { ApiError } from "@/types/error.ts"; // Adjust path if needed

import { Render } from "@puckeditor/core";
import { ResearchPageRecord } from "@/types/page.ts";
import { formatDate } from "@/utils/format-date.ts";
import { createPuckConfig } from "../../editor/research/puck.config.tsx";

interface ResearchFormValues {
    title: string;
    slug: string;
    description: string;
}

export default function WorkspaceViewResearch({ researchId }: { researchId: string }) {
    const router = useRouter();
    const { accessToken } = useAuth();

    // Initialize react-hook-form
    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting, isDirty, dirtyFields, errors },
    } = useForm<ResearchFormValues>();

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [isImageDirty, setIsImageDirty] = useState(false);

    const [researchPagePreview, setResearchPagePreview] = useState<ResearchPageRecord>();
    const [isRollingBack, setIsRollingBack] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toastError, setToastError] = useState<string | null>(null);
    const [research, setResearch] = useState<ResearchRecord>();
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
            // Check if there are field errors for image, otherwise fall back to main error message
            return err.response?.error?.fields?.image || err.response?.error || defaultMsg;
        }
        return err?.message || defaultMsg;
    };

    // Fetch research data on mount
    useEffect(() => {
        async function fetchResearch() {
            if (!accessToken || !researchId) return;

            try {
                setIsLoading(true);
                const data = await retrieveResearch(accessToken, researchId);
                setResearch(data);

                // Populate form using reset()
                reset({
                    title: data.title,
                    slug: data.slug,
                    description: data.description || "",
                });
                setImagePreview(data.imageUrl);
                setPendingFile(null);
                setIsImageDirty(false);
                setResearchPagePreview(data.page);
            } catch (err: any) {
                if (err instanceof ApiError) {
                    setError(err.response?.error?.message || "Failed to load research.");
                } else {
                    setError("Failed to load research.");
                }
            } finally {
                setIsLoading(false);
            }
        }

        fetchResearch();
    }, [accessToken, researchId, reset]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPendingFile(file);
            setImagePreview(URL.createObjectURL(file));
            setIsImageDirty(true);
        }
    };

    const handleDiscard = () => {
        if (!research) return;
        setIsRollingBack(true);

        // Reset form to the fetched 'research' object state
        reset({
            title: research.title,
            slug: research.slug,
            description: research.description || "",
        });
        setImagePreview(research.imageUrl);
        setPendingFile(null);
        setIsImageDirty(false);
        setError(null);

        // Short timeout for UI feedback
        setTimeout(() => setIsRollingBack(false), 300);
    };

    const onSubmit = async (data: ResearchFormValues) => {
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

            const updatedResearch = await updateResearch(accessToken, researchId, updatePayload);
            
            // Sync current state base to clear dirty tracking if desired
            setResearch(updatedResearch);
            setPendingFile(null);
            setIsImageDirty(false);
            reset(data);
        } catch (err: any) {
            const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
            showToastError(`Research update failed: ${alertMessage}. Please try again.`);
            console.error(err);
        }
    };

   const handlePublishToggle = async (publishState: boolean) => {
        if (!accessToken) return;
        try {
            const updatedResearch = await setResearchPublishStatus(accessToken, researchId, publishState);
            setResearch(updatedResearch as ResearchRecord);

        } catch (err: any) {
            const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
            showToastError(`Research ${publishState ? "publishing" : "unpublishing"} failed: ${alertMessage}. Please try again.`);
            console.error(err);
        }
    };

    const handleDeleteResearch = async () => {
        if (!accessToken) return;
        try {
            await deleteResearch(accessToken, researchId);
            
            // Handle post-deletion logic (e.g., redirecting or updating parent state)
            router.push("/workspace/researcher"); 

        } catch (err: any) {
            const alertMessage = extractErrorMessage(err, "An unexpected error occurred");
            showToastError(`Research deletion failed: ${alertMessage}. Please try again.`);
            console.error(err);
        }
    };

    
    if (isLoading) return <main className="m-8">Loading...</main>;

    // Form is considered dirty if any form field changed OR a new image was selected
    const hasChanges = isDirty || isImageDirty;
    const updatedAt = research?.updatedAt ? formatDate(new Date(research.updatedAt)) : "";
    const isPublished = research?.published ?? false;
    const publishedAt = research?.publishedAt ? formatDate(new Date(research.publishedAt)) : "";

    return (
        <main className="min-h-screen bg-zinc-100 relative pb-20">
            <div className="sticky top-0 z-50 bg-white px-2 h-12 border-b border-zinc-300 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Button onClick={() => router.back()} variant="ghost" className="h-8 w-8 p-0 bg-zinc-200/25 hover:bg-zinc-200/50">
                        <ArrowLeft size={16} />
                    </Button>
                    <Image src="/logo-text.svg" alt="Logo" width={96} height={20} className="brightness-0" priority />
                    <span className="text-black/50">|</span>
                    <span className="text-xs tracking-tight text-black/50">RESEARCH</span>
                </div>
            </div>

            <div className="p-8 space-y-8">
                <Card className="shadow-sm">
                    <CardContent className="space-y-4 p-4">
                        <section className="flex flex-col gap-2 px-2">
                            <div className="w-full h-8 flex items-center justify-between gap-2">
                                <div className="flex flex-col">
                                    <Label className="text-lg">About Research</Label>
                                    <span className="text-zinc-500">Update detailed information of your research, including its title, description, slug, and image.</span>
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
                                            <span className="sr-only">Upload research image</span>
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
                                                {...register("slug", { required: true })}
                                                className={errors.slug ? "text-red-500" : ""}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </section>

                        <section className="border-t pt-4 px-2">
                            <div className="flex flex-row">
                                <div className="flex flex-col">
                                    <Label className="text-lg">Research Page</Label>
                                    <span className="text-zinc-500">Preview your research page to see how it looks to readers, or jump straight into the editor to make changes.</span>
                                </div>
                                
                                {researchPagePreview && (
                                <div className="ml-auto flex items-center gap-1">
                                    <Link
                                        href={`/workspace/researcher/edit/${researchPagePreview.id}`}
                                    >
                                        <Button className="cursor-pointer bg-green-400/60 hover:bg-green-400/100">
                                            <Edit size={16} /> Edit
                                        </Button>
                                    </Link>
                                    <Link href={`/`}>
                                        <Button className="cursor-pointer bg-blue-400/60 hover:bg-blue-400/100">
                                            <Eye className="w-4 h-4" />
                                            <span>Preview</span>
                                        </Button>
                                    </Link>
                                </div>
                                )}
                            </div>

                            {researchPagePreview ? (
                            <div className="border rounded-lg max-h-128 overflow-hidden [mask-image:linear-gradient(to_bottom,black_calc(100%-4rem),transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_calc(100%-4rem),transparent_100%)] mt-2">
                                <Link href={`/workspace/researcher/edit/${researchPagePreview.id}`}>
                                    <div className="min-h-64 hover:bg-zinc-100/70 rounded-lg">
                                        <Render config={createPuckConfig(accessToken || "")} data={researchPagePreview.puckData} />
                                    </div>
                                </Link>
                            </div>
                            ) : (
                            <div>
                                <div className="flex items-center justify-center border rounded-lg min-h-64 overflow-hidden [mask-image:linear-gradient(to_bottom,black_calc(100%-4rem),transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_calc(100%-4rem),transparent_100%)] mt-2">
                                    <span className="text-zinc-400">Loading research page preview...</span>
                                </div>
                            </div>
                            )}
                            
                        </section>
                            
                        <section className="pt-4 px-2 flex flex-row items-center gap-8 w-full border-t border-zinc-200/50">
                            <div className="flex flex-col">
                                <Label className="text-lg">Visibility</Label>
                                <span className="text-zinc-500">Publish this research for everyone to see, or keep it hidden as a private draft.</span>
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
                                            }
                                        }
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
                                            }
                                        }
                                        >
                                        <ArrowDownLeftFromSquare className="w-4 h-4" />
                                        <span>Unpublish</span>
                                    </Button>
                                    )}
                                </div>
                            </div>
                        </section>
                        
                        <section className="pt-4 px-2 flex flex-row items-center gap-8 w-full border-t border-zinc-200/50">
                            <div className="flex flex-col">
                                <Label className="text-lg">Delete</Label>
                                <span className="text-zinc-500">Permanently delete this research from the website.</span>
                            </div>
                            <Button 
                                className="ml-auto bg-red-400/60 hover:bg-red-400/100"
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    handleDeleteResearch();
                                    }
                                }
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