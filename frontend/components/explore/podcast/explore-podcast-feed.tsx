"use client"
import { ExploreFilterBar } from "../explore-filter.tsx";
import { ExplorePodcastCard } from "./explore-podcast-card.tsx";
import { ExplorePodcastSummary } from "@/types/explore/podcast.ts";
import { ExploreFilter } from "@/types/explore/explore.ts";

interface ExplorePodcastFeedProps {
    feedPodcast: ExplorePodcastSummary[];
    isLoadingFeed: boolean;
    feedFilter: ExploreFilter;
    onSortChange: (sort: ExploreFilter["sort"], order: ExploreFilter["order"]) => void;
}

export function ExplorePodcastFeed({ feedPodcast, isLoadingFeed, feedFilter, onSortChange }: ExplorePodcastFeedProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
                <span className="font-medium text-lg">Podcast Feed</span>
                <ExploreFilterBar 
                    sort={feedFilter.sort ?? "title"} 
                    order={feedFilter.order ?? "asc"} 
                    onSortChange={onSortChange}
                />
            </div>
            <div className="flex flex-row gap-8">
                {isLoadingFeed ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <ExplorePodcastCard
                            key={`skeleton-${index}`}
                            isLoading={isLoadingFeed}
                        />
                    ))
                ) : (
                    feedPodcast.map((podcast) => (
                        <ExplorePodcastCard
                            key={podcast.slug}
                            podcast={podcast}
                            isLoading={isLoadingFeed}
                        />
                    ))
                )}
            </div>
        </div>
    );
}