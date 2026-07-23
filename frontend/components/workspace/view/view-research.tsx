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
import { ArrowLeft, ArrowUpRightFromSquare, Edit, Eye, ImageIcon, PenBox, Save, X } from "lucide-react";
import { retrieveResearch, updateResearch } from "@/services/researcher.ts";
import { ResearchRecord } from "../../../types/research.ts";
import { useAuth } from "@/context/auth-context.tsx";

import { Render } from "@puckeditor/core";
//import { createPuckConfig } from "../../editor/researcher/puck.config.tsx";
import { ResearchPageRecord } from "../../../types/page.ts";
import { formatDate } from "../format-date.tsx";

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
    const [research, setResearch] = useState<ResearchRecord>();
    const [isLoading, setIsLoading] = useState(true);

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
            } catch (err: unknown) {
                setError("Failed to load research.");
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
        } catch (error: unknown) {
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
            } catch {
                const errObj = error as { response?: { data?: { message?: string } } };
                alertMessage = errObj?.response?.data?.message || (error instanceof Error ? error.message : "Something went wrong");
            }

            alert(`Research update failed: ${alertMessage}. Please try again.`);
        }
    };

    if (isLoading) return <main className="m-8">Loading...</main>;

    // Form is considered dirty if any form field changed OR a new image was selected
    const hasChanges = isDirty || isImageDirty;
    const updatedAt = research?.updatedAt ? formatDate(new Date(research.updatedAt)) : formatDate(new Date());
    const isPublished = research?.published ?? false;

    return (
        <main className="min-h-screen bg-zinc-100/50">
            <div className="bg-white px-2 h-12 flex justify-between items-center border-b border-zinc-200">
                <div className="flex items-center gap-2">
                    <Button onClick={() => router.back()} variant="ghost" className="h-8 w-8 p-0 bg-zinc-100 hover:bg-zinc-200">
                        <ArrowLeft size={16} />
                    </Button>
                    <Image src="/logo-text.svg" alt="Logo" width={96} height={20} className="brightness-0" priority />
                    <span className="text-zinc-300">|</span>
                    <span className="text-xs tracking-tight text-zinc-500">RESEARCH</span>
                </div>
            </div>

            <div className="p-8 space-y-8">
                <Card className="shadow-sm">
                    <CardContent className="space-y-8">
                        <section className="p-2">
                            <div className="w-full h-8 flex items-center justify-between">
                                <Label className="text-lg">About Research</Label>
                                
                                {/* Container for buttons with invisible/retained layout footprint or absolute conditional rendering */}
                                <div className="flex items-center gap-2">
                                    {hasChanges ? (
                                        <div className="flex items-center gap-2 text-white animate-in fade-in duration-200">
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

                        <section className="border-t pt-4 px-2 space-y-4">
                            {researchPagePreview ? (
                                <>
                                    <div className="flex items-center">
                                        <Label className="text-lg">Research Page</Label>
                                        <Link
                                            className="ml-auto space-x-1"
                                            href={`/workspace/researcher/edit/${researchPagePreview.id}`}
                                        >
                                            <Button className="bg-green-400/60 hover:bg-green-400/100">
                                                <Edit size={16} /> Edit
                                            </Button>
                                        </Link>
                                        <Link href={`/`} className="flex items-center gap-2 cursor-pointer ml-2">
                                            <Button className="bg-blue-400/60 hover:bg-blue-400/100">
                                                <Eye className="w-4 h-4" />
                                                <span>Preview</span>
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="border rounded-lg max-h-128 overflow-hidden [mask-image:linear-gradient(to_bottom,black_calc(100%-4rem),transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_calc(100%-4rem),transparent_100%)] mt-2">
                                        <Link href={`/workspace/researcher/edit/${researchPagePreview.id}`}>
                                            <div className="min-h-64 hover:bg-zinc-100/70 rounded-lg p-1" />
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <div className="p-4 text-center text-zinc-500">
                                        Loading research page preview...
                                    </div>
                                </div>
                            )}
                        </section>
                            
                        <section className="pt-4 px-2 flex items-center justify-between w-full border-t border-zinc-200/50">
                            <div className="flex items-center gap-1.5 text-xs tracking-tight text-zinc-400">
                                <PenBox className="w-3.5 h-3.5" /> 
                                <span>Updated: {updatedAt}</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-sm font-medium tracking-tight">
                                    {isPublished ? (
                                        <>
                                            <span className="text-green-600 text-xs">Published</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 animate-pulse" />
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-yellow-600 text-xs">Draft</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                                        </>
                                    )}
                                </div>
                                <Button 
                                    className="bg-yellow-400/60 hover:bg-yellow-400/100"
                                    >
                                    <ArrowUpRightFromSquare className="w-4 h-4" />
                                    <span>Publish</span>
                                </Button>
                            </div>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}