"use client"
import { ExplorePodcastCard } from "./explore-podcast-card.tsx";
import { useExplorePodcast } from "@/hooks/explore/use-explore-podcast.ts";

export function ExplorePodcastPopular() {
    const explorePodcast = useExplorePodcast();
    const isLoading = explorePodcast.isLoadingFeatured;
    const podcast = explorePodcast.popularPodcast;
    
    return (
        <div className="flex flex-col gap-2">
            <span className="font-medium text-lg">Most Listened</span>
            <ExplorePodcastCard podcast={podcast} isLoading={isLoading}/>
        </div>
    )
}