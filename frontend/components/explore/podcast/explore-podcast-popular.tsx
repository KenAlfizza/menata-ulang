"use client"
import { useIsMobile } from "@/hooks/use-mobile.ts";
import { ExplorePodcastCard } from "./card/explore-podcast-card.tsx";
import { ExplorePodcastSummary } from "@/types/explore/podcast.ts";
import { ExplorePodcastMobileCard } from "./card/explore-podcast-mobile-card.tsx";

interface ExplorePodcastPopularProps {
    popularPodcast?: ExplorePodcastSummary;
    isLoadingFeatured: boolean;
}

export function ExplorePodcastPopular({ popularPodcast, isLoadingFeatured }: ExplorePodcastPopularProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <div className="w-full flex flex-col gap-2">
            <span className="font-medium text-xl">Most Listened</span>
            <ExplorePodcastMobileCard podcast={popularPodcast} isLoading={isLoadingFeatured}/>
        </div>
        )
    }

    return (
        <div className="w-full flex flex-col gap-2">
            <span className="font-medium text-xl">Most Listened</span>
            <ExplorePodcastCard podcast={popularPodcast} isLoading={isLoadingFeatured} feature/>
        </div>
    )
}