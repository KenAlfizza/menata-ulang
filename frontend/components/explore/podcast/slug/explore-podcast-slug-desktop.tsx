import Image from "next/image";
import { ArrowUpRightFromSquare, Heart, Podcast } from "lucide-react";

import { formatDate } from "@/utils/format-date.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { ExplorePodcastRecord } from "@/types/explore/podcast.ts";
import { PodcastPlayerInline } from "@/components/explore/podcast/player/explore-podcast-player-inline.tsx";
import { usePlayer } from "@/context/podcast/player-context.tsx";
import { ScrollTrigger } from "@/components/common/scroll-trigger.tsx";

export function ExplorePodcastSlugDesktopView({ podcast }: { podcast?: ExplorePodcastRecord }) {
    const { currentTrack, setHidePlayer } = usePlayer();
    const currentPodcast = podcast;

    // Data extraction (same as main component)
    const slug = currentPodcast?.slug ?? "";
    const title = currentPodcast?.title ?? "Untitled Podcast";
    const imageUrl = 
        (currentPodcast?.imageUrl && currentPodcast.imageUrl.trim() !== "") 
        ? currentPodcast.imageUrl 
        : "/logo-icon.svg";
    const hostName = currentPodcast?.hostName ?? "Menata Ulang";
    const alt = currentPodcast?.title ?? "Podcast Image";
    const description = currentPodcast?.description ?? "A description describing the main point of the podcast";
    const date = currentPodcast?.publishedAt 
        ? formatDate(new Date(currentPodcast.publishedAt)) 
        : formatDate(new Date());
    const audioUrl = currentPodcast?.audioUrl ?? "";
    const durationSeconds = currentPodcast?.duration ?? 0;
    const heartsCount = currentPodcast?.heartsCount ?? 100;
    const transcript = currentPodcast?.transcript ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eget odio varius, rutrum mauris sed, auctor enim. Sed consequat, quam ut volutpat imperdiet, nunc sem pulvinar nulla, in mollis nisl odio vitae metus. Cras a eleifend sapien. Quisque blandit ante odio. Vivamus fringilla elit ac consequat vehicula. Vivamus laoreet rhoncus turpis in commodo. Pellentesque fermentum nisl in sagittis euismod. Integer vel vehicula dolor. Nam a urna vel sem tempus ultricies. Vestibulum ut tortor interdum, pharetra libero eget, commodo ipsum. Pellentesque posuere sem at arcu hendrerit, eget porta elit posuere. Nullam sagittis pulvinar nunc, a fermentum lectus egestas in.";

    return (
        <div className="flex flex-col gap-8">
            {/* Top Section: Image + Meta + Player */}
            <ScrollTrigger 
                onViewportChange={(inView) => {
                    if (!currentTrack || currentTrack.id !== slug) {
                        setHidePlayer(false);
                    } else {
                        setHidePlayer(inView);
                    }
                }}
            >
                <div className="flex flex-col md:flex-row items-center gap-8 w-full h-full">
                    {/* Left: Image */}
                    <Card className="relative min-w-[320px] max-w-[320px] h-[320px] bg-white/50 ring-0 p-0">
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
                            <CardContent className="p-6 w-full flex flex-col h-full relative z-10 gap-4">
                                <div className="w-full flex-1 flex flex-col gap-2 min-h-0">
                                    <div>
                                        <h1 className="text-2xl text-left tracking-tight font-medium text-zinc-800 break-words [.group:hover:not(:has([data-play-button]:hover))_&]:text-zinc-950 transition-colors line-clamp-2">
                                            {title}
                                        </h1>
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

                                    <p className="text-md text-left tracking-tight text-zinc-600 break-words max-w-prose line-clamp-2 min-h-[2lh]">
                                        {description}
                                    </p>
                                    
                                    <div className="w-full flex-1 flex items-center">
                                        <div className="w-full">
                                            <PodcastPlayerInline
                                                track={{
                                                    id: slug,
                                                    title,
                                                    artist: hostName,
                                                    src: audioUrl,
                                                    imageUrl,
                                                    duration: durationSeconds,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end text-zinc-400">
                                    <div className="flex flex-row items-center gap-1.5">
                                        <Heart size={24} />
                                        <p className="text-lg">{heartsCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                </div>
            </ScrollTrigger>

            {/* Bottom Section: Transcript */}
            <Card className="group relative w-full h-full bg-white/70 ring-0 p-0">
                <div className="w-full h-full bg-yellow-100/50">
                    <CardContent className="p-6 w-full flex flex-col h-full justify-between relative z-10">
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