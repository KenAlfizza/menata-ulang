"use client"
import { ExplorePodcastCard } from "./explore-podcast-card.tsx";
import { ExplorePodcastSummary } from "@/types/explore/podcast.ts";

interface ExplorePodcastRecentProps {
    recentPodcasts: ExplorePodcastSummary[];
    isLoadingFeatured: boolean;
}

export function ExplorePodcastRecent({ recentPodcasts, isLoadingFeatured }: ExplorePodcastRecentProps) {
    return (
        <div className="flex flex-col gap-2">
            <span className="font-medium text-lg">Recently Added</span>
            <div className="grid grid-cols-3 gap-8">
                {isLoadingFeatured ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <ExplorePodcastCard
                            key={`skeleton-${index}`}
                            isLoading={isLoadingFeatured}
                        />
                    ))
                ) : (
                    recentPodcasts.map((podcast) => (
                        <ExplorePodcastCard
                            key={podcast.slug}
                            podcast={podcast}
                            isLoading={isLoadingFeatured}
                        />
                    ))
                )}
            </div>
        </div>
    );
}