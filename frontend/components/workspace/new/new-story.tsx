"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../../ui/card.tsx";
import { Label } from "../../ui/label.tsx";
import { Input } from "../../ui/input.tsx";
import { Button } from "../../ui/button.tsx";
import { ArrowLeft, ImageIcon, AlertCircle, X } from "lucide-react";
import { createStory } from "@/services/author.ts";
import { useAuth } from "@/context/auth-context.tsx";
import Image from "next/image";

export default function NewStory() {
    const router = useRouter();
    const { accessToken } = useAuth();

    // Form State
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDiscard = () => {
        setTitle("");
        setSlug("");
        setDescription("");
        setImage(null);
        setImagePreview(null);
        setToastError(null);
        setFieldErrors({});
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!accessToken) {
            showToastError("You must be logged in to create a story.");
            return;
        }

        setToastError(null);
        setFieldErrors({});
        setIsSubmitting(true);

        try {
            const data = await createStory(accessToken, {
                title,
                slug,
                description,
                image: image || undefined,
            });
            router.push(`/workspace/author/view/${data.id}`);
        } catch (err: any) {
            const errorData = JSON.parse(err.message);
            
            // Check for field-specific errors
            if (errorData.fields) {
                setFieldErrors(errorData.fields);
            }
            
            // Show general error message
            const message = errorData.message || "An unexpected error occurred";
            showToastError(`Story creation failed: ${message}. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-zinc-100/50">
            <div className="bg-white px-2 h-12 flex justify-between items-center border-b border-zinc-200">
                <div className="flex items-center gap-2">
                    <Button onClick={() => router.back()} variant="ghost" className="h-8 w-8 p-0 bg-zinc-100 hover:bg-zinc-200"><ArrowLeft size={16} /></Button>
                    <Image src="/logo-text.svg" alt="Logo" width={96} height={20} className="brightness-0" />
                    <span className="text-zinc-300">|</span>
                    <span className="text-xs tracking-tight text-zinc-500">CREATE STORY</span>
                </div>
            </div>

            <div className="p-8 space-y-8">
                <Card className="shadow-sm">
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title Input */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Story Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="My Untitled Story"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Description Input */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    type="text"
                                    placeholder="A short description of your story..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
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
