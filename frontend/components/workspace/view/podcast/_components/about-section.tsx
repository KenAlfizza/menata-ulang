// app/workspace/host/[podcastId]/_components/AboutSection.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PenBox, Save, X, ImageIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AboutFormValues } from "@/hooks/workpace/podcast/use-podcast-workspace-view.ts";

interface AboutSectionProps {
    aboutForm: UseFormReturn<AboutFormValues>;
    imagePreview: string | null;
    hasChanges: boolean;
    updatedAt: string;
    error: string | null;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDiscard: () => void;
    onSubmit: (data: AboutFormValues) => void;
}

export function AboutSection({
    aboutForm,
    imagePreview,
    hasChanges,
    updatedAt,
    error,
    handleImageChange,
    handleDiscard,
    onSubmit,
}: AboutSectionProps) {
    const { register, handleSubmit, formState: { errors } } = aboutForm;

    return (
        <Card className="shadow-sm p-0 p-6">
            <CardContent className="space-y-4 p-0">
                <section className="flex flex-col gap-2">
                    <div className="w-full h-auto flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                            <Label className="text-lg">About Podcast</Label>
                            <span className="text-zinc-500">Update detailed information of your podcast, including its title, description, slug, and cover image.</span>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5 text-xs tracking-tight text-zinc-400">
                            <PenBox className="w-3.5 h-3.5" />
                            <span>Updated: {updatedAt}</span>
                        </div>
                        <div className="flex items-center">
                            {hasChanges ? (
                                <div className="flex items-center gap-1 text-white animate-in fade-in duration-200">
                                    <Button className="bg-green-400/60 hover:bg-green-400/100" onClick={handleSubmit(onSubmit)}>
                                        <Save className="w-4 h-4" /> <span>Save</span>
                                    </Button>
                                    <Button className="bg-red-400/60 hover:bg-red-400/100" onClick={handleDiscard}>
                                        <X className="w-4 h-4" /> <span>Discard</span>
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-8" />
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded border border-red-200">{error}</div>
                        )}

                        <div className="flex flex-row gap-8 items-start">

                            <div className="flex w-64 h-64">
                                <input
                                    id="picture"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <label
                                    htmlFor="picture"
                                    className="flex-1 cursor-pointer group relative overflow-hidden rounded-lg border-2 border-dashed border-zinc-300 bg-slate-50 hover:bg-zinc-100/50 transition-colors"
                                >
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-zinc-400 space-y-2 px-4 py-4 w-full h-full">
                                            <ImageIcon size={64} />
                                            <span className="text-xs font-medium">Click to upload image</span>
                                        </div>
                                    )}
                                </label>
                            </div>


                            {/* Form Inputs (Full width of remaining space) */}
                            <div className="flex-1">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            className="!text-2xl !leading-tight !h-auto !py-2 bg-transparent"
                                            id="title"
                                            {...register("title", { required: true })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" {...register("description")} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">URL Slug:</Label>
                                        <Input
                                            id="slug"
                                            {...register("slug", { required: true })}
                                            className={errors.slug ? "text-red-500" : ""}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>
            </CardContent>
        </Card >
    );
}