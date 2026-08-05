// app/workspace/host/[podcastId]/_components/podcast-skeleton.tsx
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function PodcastSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-100 relative pb-20 animate-pulse">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-50 bg-white px-2 h-12 border-b border-zinc-300 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Button disabled variant="ghost" className="h-8 w-8 p-0 bg-zinc-200/25">
                        <ArrowLeft size={16} className="text-zinc-400" />
                    </Button>
                    <Image src="/logo-text.svg" alt="Logo" width={96} height={20} className="brightness-0 opacity-40" priority />
                    <span className="text-black/50">|</span>
                    <span className="text-xs tracking-tight text-black/50">PODCAST</span>
                </div>
            </div>

            {/* Content Sections Skeleton */}
            <div className="p-8 space-y-4">
                
                {/* About Section Skeleton */}
                <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-6 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <div className="h-5 w-32 bg-zinc-200 rounded" />
                            <div className="h-3 w-48 bg-zinc-100 rounded" />
                        </div>
                        <div className="h-9 w-20 bg-zinc-200 rounded-md" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="h-64 bg-zinc-100 rounded-lg border border-dashed border-zinc-300" />
                        <div className="md:col-span-2 space-y-4">
                            <div className="space-y-2">
                                <div className="h-4 w-20 bg-zinc-200 rounded" />
                                <div className="h-10 bg-zinc-100 rounded-md" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-zinc-200 rounded" />
                                <div className="h-20 bg-zinc-100 rounded-md" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-zinc-200 rounded" />
                                <div className="h-8 bg-zinc-100 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audio Section Skeleton */}
                <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <div className="h-5 w-28 bg-zinc-200 rounded" />
                            <div className="h-3 w-40 bg-zinc-100 rounded" />
                        </div>
                        <div className="h-9 w-20 bg-zinc-200 rounded-md" />
                    </div>
                    <div className="h-14 bg-zinc-100 rounded-lg border border-zinc-200" />
                </div>

                {/* Transcript Section Skeleton */}
                <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <div className="h-5 w-36 bg-zinc-200 rounded" />
                            <div className="h-3 w-52 bg-zinc-100 rounded" />
                        </div>
                        <div className="h-9 w-20 bg-zinc-200 rounded-md" />
                    </div>
                    <div className="h-32 bg-zinc-100 rounded-lg border border-zinc-200" />
                </div>

                {/* Visibility Section Skeleton */}
                <div className="bg-white border border-zinc-200 rounded-lg p-6 flex items-center justify-between shadow-sm">
                    <div className="space-y-2">
                        <div className="h-5 w-24 bg-zinc-200 rounded" />
                        <div className="h-3 w-44 bg-zinc-100 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-16 bg-zinc-200 rounded-full" />
                        <div className="h-8 w-24 bg-yellow-100 rounded-md" />
                    </div>
                </div>

                {/* Delete Section Skeleton */}
                <div className="bg-white border border-zinc-200 rounded-lg p-6 flex items-center justify-between shadow-sm">
                    <div className="space-y-2">
                        <div className="h-5 w-32 bg-zinc-200 rounded" />
                        <div className="h-3 w-56 bg-zinc-100 rounded" />
                    </div>
                    <div className="h-8 w-24 bg-red-100 rounded-md" />
                </div>
            </div>
        </div>
    );
}
