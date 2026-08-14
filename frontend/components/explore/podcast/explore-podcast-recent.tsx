"use client"
import { useIsMobile } from "@/hooks/use-mobile.ts";
import { ExplorePodcastCard } from "./card/explore-podcast-card.tsx";
import { ExplorePodcastSummary } from "@/types/explore/podcast.ts";
import { ExplorePodcastMobileCard } from "./card/explore-podcast-mobile-card.tsx";

interface ExplorePodcastRecentProps {
    recentPodcasts: ExplorePodcastSummary[];
    isLoadingFeatured: boolean;
}

export function ExplorePodcastRecent({ recentPodcasts, isLoadingFeatured }: ExplorePodcastRecentProps) {
    const isMobile = useIsMobile();
    if (isMobile) return (
        <div className="w-full flex flex-col gap-2">
            <span className="w-full font-medium text-xl">Recently Added</span>
            <div className="w-full flex flex-col gap-2">
                {isLoadingFeatured ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <ExplorePodcastMobileCard
                            key={`skeleton-${index}`}
                            isLoading={isLoadingFeatured}
                        />
                    ))
                ) : (
                    recentPodcasts.map((podcast) => (
                        <ExplorePodcastMobileCard
                            key={podcast.slug}
                            podcast={podcast}
                            isLoading={isLoadingFeatured}
                        />
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full flex flex-col gap-2">
            <span className="font-medium text-xl">Recently Added</span>
            <div className="flex flex-col md:flex-row justify-between gap-4">
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
                            feature
                        />
                    ))
                )}
            </div>
        </div>
    );
}