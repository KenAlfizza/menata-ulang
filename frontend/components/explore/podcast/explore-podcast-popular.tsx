"use client"
import { ExplorePodcastCard } from "./explore-podcast-card.tsx";
import { ExplorePodcastSummary } from "@/types/explore/podcast.ts";

interface ExplorePodcastPopularProps {
    popularPodcast?: ExplorePodcastSummary;
    isLoadingFeatured: boolean;
}

export function ExplorePodcastPopular({ popularPodcast, isLoadingFeatured }: ExplorePodcastPopularProps) {
    return (
        <div className="flex flex-col gap-2 w-2/3">
            <span className="font-medium text-lg">Most Listened</span>
            <ExplorePodcastCard podcast={popularPodcast} isLoading={isLoadingFeatured} feature/>
        </div>
    )
}