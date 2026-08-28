import Image from "next/image";
import { EllipsisVertical, Heart, Podcast } from "lucide-react";

import { formatDate } from "@/utils/format-date.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { ExplorePodcastRecord } from "@/types/explore/podcast.ts";
import { PlayerTrack, usePlayer } from "@/context/podcast/player-context.tsx";
import { useEffect, useMemo } from "react";
import { ExplorePodcastPlayButton } from "../explore-podcast-play.tsx";
import { formatTimeSentence } from "@/utils/format-time.ts";
import { ExplorePodcastSlugDropdownDesktop } from "./dropdown/explore-podcast-slug-dropdown-desktop.tsx";

export function ExplorePodcastSlugDesktopView({ podcast }: { podcast?: ExplorePodcastRecord }) {
    // Data extraction
    const slug = podcast?.slug ?? "";
    const title = podcast?.title ?? "Untitled Podcast";
    const imageUrl = 
        (podcast?.imageUrl && podcast.imageUrl.trim() !== "") 
        ? podcast.imageUrl 
        : "/logo-icon.svg";
    const hostName = podcast?.hostName ?? "Menata Ulang";
    const alt = podcast?.title ?? "Podcast Image";
    const description = podcast?.description ?? "A description describing the main point of the podcast";
    const date = podcast?.publishedAt 
        ? formatDate(new Date(podcast.publishedAt)) 
        : formatDate(new Date());
    const audioUrl = podcast?.audioUrl ?? "";
    const durationSeconds = podcast?.duration ?? 0;
    const transcript = podcast?.transcript ?? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eget odio varius, rutrum mauris sed, auctor enim. Sed consequat, quam ut volutpat imperdiet, nunc sem pulvinar nulla, in mollis nisl odio vitae metus. Cras a eleifend sapien. Quisque blandit ante odio. Vivamus fringilla elit ac consequat vehicula. Vivamus laoreet rhoncus turpis in commodo. Pellentesque fermentum nisl in sagittis euismod. Integer vel vehicula dolor. Nam a urna vel sem tempus ultricies. Vestibulum ut tortor interdum, pharetra libero eget, commodo ipsum. Pellentesque posuere sem at arcu hendrerit, eget porta elit posuere. Nullam sagittis pulvinar nunc, a fermentum lectus egestas in.";

    // Player context
    const { setHidePlayer, addToPlaylist, addToPlaylistNext, buildPlayerTrack, playTrackKeepPlaylist } = usePlayer();
    const playerTrack = useMemo(
        () => (podcast ? buildPlayerTrack(podcast) : null),
        [podcast?.slug] // eslint-disable-line react-hooks/exhaustive-deps
    );
    
    // Ensure that the player is shown on default
    useEffect(() => {
        setHidePlayer(false);
    })

    const handlePlayTrack = () => {
        if (!playerTrack) return;
        playTrackKeepPlaylist(playerTrack);
    }

    const handleAddToPlaylist = () => {
        if (!playerTrack) return;
        addToPlaylist(playerTrack);
    }


    const handlePlayNext = () => {
        if (!playerTrack) return;
        addToPlaylistNext(playerTrack);
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Top Section: Image + Meta + Player */}
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
                            <div className="w-full h-full flex flex-col justify-between">
                                <div className="flex flex-col gap-2 min-h-0">
                                    <div className="flex justify-between">
                                        <h1 className="text-3xl text-left tracking-tight font-medium text-zinc-800 break-words [.group:hover:not(:has([data-play-button]:hover))_&]:text-zinc-950 transition-colors line-clamp-2">
                                            {title}
                                        </h1>

                                        <div className="flex flex-row gap-1 items-center">
                                            {/** Heart */}
                                            <div className="text-zinc-500">
                                                <Heart size={28} />
                                            </div>
                                            {/** Dropdown */}
                                            <ExplorePodcastSlugDropdownDesktop
                                                onAddToPlaylist={handleAddToPlaylist}
                                                onPlayNext={handlePlayNext}
                                                onShare={() => {/* share logic */}}
                                            >
                                                <button
                                                    type="button"
                                                    className="text-zinc-500 hover:text-zinc-800 transition-colors outline-none"
                                                >
                                                    <EllipsisVertical size={24} />
                                                </button>
                                            </ExplorePodcastSlugDropdownDesktop>
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <p className="flex items-center gap-2 text-lg text-zinc-600 break-words max-w-prose">
                                            <Podcast size={16} />
                                            {hostName}
                                        </p>
                                        <div className="text-lg text-zinc-400">
                                            <span>{date}</span>
                                        </div>
                                    </div>

                                    <p className="text-lg text-left tracking-tight text-zinc-600 break-words max-w-prose line-clamp-2 min-h-[2lh]">
                                        {description}
                                    </p>
                                </div>

                                <div className="flex flex-row items-center justify-end gap-4">
                                    <div className="text-lg text-zinc-400">
                                        <span>{formatTimeSentence(durationSeconds)}</span>
                                    </div>
                                    {playerTrack && <ExplorePodcastPlayButton 
                                        track={playerTrack}
                                        page="podcast"
                                        size={30}
                                        padding="p-3"
                                        onPlay={handlePlayTrack}
                                    />
                                    }
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </div>

            {/* Bottom Section: Transcript */}
            <Card className="group relative w-full h-full bg-white/70 ring-0 p-0">
                <div className="w-full h-full bg-yellow-100/50">
                    <CardContent className="p-6 w-full flex flex-col h-full justify-between relative z-10">
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="w-full flex flex-col gap-4 items-start">
                                <h3 className="text-3xl text-left tracking-tight font-medium text-zinc-800">
                                    Transcript
                                </h3>
                                <p className="text-lg text-left tracking-tight text-zinc-600 whitespace-pre-line">
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