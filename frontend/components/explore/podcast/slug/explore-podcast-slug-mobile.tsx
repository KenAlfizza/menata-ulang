"use client";

import Image from "next/image";
import { ArrowUpRightFromSquare, EllipsisVertical, Heart, Podcast } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card.tsx";
import { ExplorePodcastRecord } from "@/types/explore/podcast.ts";
import { PodcastPlayerInline } from "@/components/explore/podcast/player/explore-podcast-player-inline.tsx";
import { ScrollTrigger } from "@/components/common/scroll-trigger.tsx";
import { ExplorePodcastPlayButton } from "../explore-podcast-play.tsx";
import { formatTimeSentence } from "@/utils/format-time.ts";
import { useExplorePodcastSlug } from "@/hooks/explore/podcast/use-explore-podcast-slug.ts";
import { useEffect } from "react";

export function ExplorePodcastSlugMobileView({ podcast }: { podcast: ExplorePodcastRecord }) {
    const {
        slug,
        title,
        imageUrl,
        hostName,
        alt,
        description,
        date,
        audioUrl,
        durationSeconds,
        transcript,
        
        isLive,

        handlePlayMobile,
        handleNextMobile,
        handlePreviousMobile,
        setPlayerVisibility,
    } = useExplorePodcastSlug(podcast);

    // Hide the player when the page is live on first load
    useEffect(() => {
        if (isLive) setPlayerVisibility(false);
    }, [slug])

    return (
        <div className="flex flex-col gap-4">
            {/* Top Section: Image + Meta + Player */}
            <ScrollTrigger 
                onViewportChange={(inView) => {
                    if (isLive) {
                        setPlayerVisibility(!inView);
                    } else {
                        setPlayerVisibility(true);
                    }
                }}
            >
                <div className="flex flex-col md:flex-row items-center gap-4 w-full h-full">
                    {/* Left: Image */}
                    <Card className="relative w-full aspect-square bg-white/50 ring-0 p-0">
                        <CardContent className="w-full h-full p-0 relative justify-center">
                            <Image
                                src={imageUrl}
                                alt={alt || ""}
                                fill
                                className="object-cover transition-transform duration-300 rounded-l-md"
                                unoptimized
                            />
                        </CardContent>
                    </Card>

                    {/* Right: Details & Player */}
                    <Card className="group relative w-full md:h-[320px] bg-white/70 ring-0 p-0">
                        <div className="w-full h-full bg-yellow-100/50">
                            <CardContent className="p-4 w-full flex flex-col h-full relative z-10 gap-4">
                                <div className="w-full flex-1 flex flex-col gap-4 min-h-0">
                                    <div className="w-full flex flex-col gap-2">
                                        <div className="flex flex-row justify-between">
                                            <h1 className="text-2xl text-left tracking-tight font-medium text-zinc-800 break-words [.group:hover:not(:has([data-play-button]:hover))_&]:text-zinc-950 transition-colors line-clamp-2">
                                                {title}
                                            </h1>

                                            <div className="flex flex-row gap-2 items-center">
                                                {/** Heart */}
                                                <div className="text-zinc-500">
                                                    <Heart size={32} />
                                                </div>
                                                {/** Dropdown */}
                                                <div className="text-zinc-500">
                                                    <EllipsisVertical size={30}/>
                                                </div>
                                            </div>
                                            
                                        </div>

                                        <div>
                                            <p className="flex items-center gap-1 text-sm text-zinc-600 break-words max-w-prose">
                                                <Podcast size={12} />
                                                {hostName}
                                            </p>
                                            <div className="flex items-center gap-1 text-sm text-zinc-400">
                                                <ArrowUpRightFromSquare size={12} />
                                                <span>{date}</span>
                                            </div>
                                        </div>

                                        <p className="text-md text-left tracking-tight text-zinc-600 break-words max-w-prose min-h-[2lh]">
                                            {description}
                                        </p>
                                    </div>

                                    { isLive ? (
                                    <div className="w-full flex-1 flex items-center p-2">
                                        <div className="w-full">
                                            <PodcastPlayerInline
                                                onNext={handleNextMobile}
                                                onPrevious={handlePreviousMobile}
                                            />
                                        </div>
                                    </div>
                                    ) 
                                    : 
                                    (
                                    <div className="flex flex-row justify-between items-center">
                                        <span className="text-zinc-600">{formatTimeSentence(durationSeconds)}</span>
                                        <ExplorePodcastPlayButton 
                                            track={{
                                                id: slug,
                                                slug,
                                                title,
                                                artist: hostName,
                                                src: audioUrl,
                                                imageUrl,
                                                duration: durationSeconds,
                                            }}
                                            page="podcast"
                                            size={30}
                                            padding="p-3"
                                            onPlay={handlePlayMobile}
                                        />   
                                    </div>
                                    )}
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                </div>
            </ScrollTrigger>

            {/* Bottom Section: Transcript */}
            <Card className="group relative w-full h-full bg-white/70 ring-0 p-0">
                <div className="w-full h-full bg-yellow-100/50">
                    <CardContent className="p-4 w-full flex flex-col h-full justify-between relative z-10">
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="w-full flex flex-col gap-1 items-start">
                                <h3 className="text-2xl text-left tracking-tight font-medium text-zinc-800">
                                    Transcript
                                </h3>
                                <p className="text-md text-left tracking-tight text-zinc-600 whitespace-pre-line">
                                    {transcript}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </div>
    );
}