"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "../../ui/card.tsx";
import { Label } from "../../ui/label.tsx";
import { Input } from "../../ui/input.tsx";
import { Button } from "../../ui/button.tsx";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { createStory } from "@/services/author.ts";
import { useAuth } from "@/context/auth-context.tsx"; // Ensure this points to your auth provider

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
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
        if (!accessToken) {
            setError("You must be logged in to create a story.");
            return;
        }

        setError(null);
        setFieldErrors({});
        setIsSubmitting(true);

        try {
            await createStory(accessToken, {
                title,
                slug,
                description,
                image: image || undefined,
            });
            router.push("/dashboard"); // Adjust path as needed
        } catch (err: any) {
            const errorData = JSON.parse(err.message);
            
            // If the error has a 'fields' object (from our Zod validator), show them
            if (errorData.fields) {
                setFieldErrors(errorData.fields);
                setError("Please correct the errors below.");
            } else {
                // Otherwise, show the general error message
                setError(errorData.message || "An unexpected error occurred.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <main className="m-8">
            <div className="flex gap-2">
                <Button 
                    type="button" 
                    onClick={() => router.back()} 
                    className="bg-zinc-100/50 hover:bg-zinc-100/100 p-2"
                >
                    <ArrowLeft className="text-black" />
                </Button>
                <h1 className="text-2xl mb-4">Create Story</h1>
            </div>

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded border border-red-200">
                                {error}
                            </div>
                        )}

                        {/** Title Input */}
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

                        {/** Description Input */}
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

                        {/** Slug Input */}
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

                        {/** Image Input & Preview */}
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
                        </div>

                        {/** Form Actions */}
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
        </main>
    );
}