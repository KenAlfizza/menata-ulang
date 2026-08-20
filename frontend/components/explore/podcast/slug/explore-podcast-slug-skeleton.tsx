"use client";

import { Card, CardContent } from "@/components/ui/card.tsx";
// --- Mobile Skeleton Component ---
export function ExplorePodcastSlugSkeletonMobile() {
    return (
        <div className="flex flex-col gap-4">
            {/* Top Section: Image + Meta + Player */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full h-full">
                <Card className="relative w-full aspect-square bg-white/50 ring-0 p-0">
                    <CardContent className="w-full h-full p-0 relative">
                        <div className="w-full h-full rounded-l-md" />
                    </CardContent>
                </Card>
                <Card className="relative w-full md:h-[320px] bg-white/50 ring-0 p-0">
                    <CardContent className="p-4 w-full flex flex-col h-full relative z-10 gap-4">
                        <div className="w-full flex-1 flex flex-col gap-2 min-h-0">
                            <div className="w-full h-12 bg-zinc-100/50 rounded-md" /> {/* Title */}
                            <div className="flex flex-col gap-2 mt-1">
                                <div className="w-2/3 h-4 bg-zinc-100/50 rounded" /> {/* Host */}
                                <div className="w-1/4 h-3 bg-zinc-100/50 rounded" /> {/* Date */}
                            </div>
                            <div className="w-full h-24 bg-zinc-100/50 rounded-md" /> {/* Description */}
                            <div className="w-full h-20 bg-zinc-100/50 rounded-md" /> {/* Player */}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Transcript */}
            <Card className="relative w-full h-full bg-white/50 ring-0 p-0">
                <CardContent className="p-4 w-full flex flex-col h-full relative z-10">
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="w-full flex flex-col gap-1 items-start">
                            <div className="w-1/2 h-8 bg-zinc-100/50 rounded" /> {/* Transcript Title */}
                            <div className="w-full h-16 bg-zinc-100/50 rounded" /> {/* Transcript Content */}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --- Desktop Skeleton Component ---
export function ExplorePodcastSlugSkeletonDesktop() {
    return (
        <div className="flex flex-col gap-8">
            {/* Top Section: Image + Meta + Player */}
            <div className="flex flex-col md:flex-row items-center gap-8 w-full h-full">
                <Card className="relative min-w-[320px] max-w-[320px] h-[320px] bg-white/50 ring-0 p-0">
                    <CardContent className="w-full h-full p-0 relative">
                        <div className="w-full h-full rounded-l-md" />
                    </CardContent>
                </Card>
                <Card className="relative w-full md:h-[320px] bg-white/50 ring-0 p-0">
                    <CardContent className="p-6 w-full flex flex-col h-full relative z-10 gap-4">
                        <div className="w-full flex-1 flex flex-col gap-2 min-h-0">
                            <div className="w-2/3 h-7 bg-zinc-100/50 rounded" /> {/* Title */}
                            <div className="flex flex-col gap-1.5 mt-1">
                                <div className="w-1/3 h-4 bg-zinc-100/50 rounded" />
                                <div className="w-1/4 h-3 bg-zinc-100/50 rounded" />
                            </div>
                            <div className="flex flex-col gap-1.5 mt-1">
                                <div className="w-full h-4 bg-zinc-100/50 rounded" />
                                <div className="w-4/5 h-4 bg-zinc-100/50 rounded" />
                            </div>
                            <div className="w-full flex-1 flex items-center">
                                <div className="w-full h-10 bg-zinc-100/50 rounded-md" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="flex flex-row items-center gap-1">
                                <div className="w-6 h-6 bg-zinc-100/50 rounded-full" />
                                <div className="w-6 h-4 bg-zinc-100/50 rounded" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Transcript */}
            <Card className="relative w-full h-full bg-white/50 ring-0 p-0">
                <CardContent className="p-6 w-full flex flex-col h-full relative z-10">
                    <div className="flex-1 flex flex-col gap-3">
                        <div className="w-1/4 h-7 bg-zinc-100/50 rounded" />
                        <div className="flex flex-col gap-2">
                            <div className="w-full h-4 bg-zinc-100/50 rounded" />
                            <div className="w-full h-4 bg-zinc-100/50 rounded" />
                            <div className="w-full h-4 bg-zinc-100/50 rounded" />
                            <div className="w-3/4 h-4 bg-zinc-100/50 rounded" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
