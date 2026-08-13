"use client"
import { ExploreFilterBar } from "../explore-filter.tsx";
import { ExplorePodcastCard } from "./explore-podcast-card.tsx";
import { ExplorePodcastSummary } from "@/types/explore/podcast.ts";
import { ExploreFilter } from "@/types/explore/explore.ts";
import { ExplorePagination } from "../explore-pagination.tsx";

interface ExplorePodcastFeedProps {
    feedPodcast: ExplorePodcastSummary[];
    isLoadingFeed: boolean;
    feedFilter: ExploreFilter;
    onSortChange: (sort: ExploreFilter["sort"], order: ExploreFilter["order"]) => void;
    feedPage: number;
    feedTotalPages: number;
    onPageChange: (feedPage: number) => void;
}

export function ExplorePodcastFeed({ feedPodcast, isLoadingFeed, feedFilter, onSortChange, feedPage, feedTotalPages, onPageChange }: ExplorePodcastFeedProps) {
    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
                <span className="font-medium text-lg">Podcast Feed</span>
                <ExploreFilterBar 
                    sort={feedFilter.sort ?? "title"} 
                    order={feedFilter.order ?? "asc"} 
                    onSortChange={onSortChange}
                />
            </div>
            <div className="w-full grid grid-cols-5 gap-8">
                {isLoadingFeed ? (
                    Array.from({ length: 10 }).map((_, index) => (
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
            <ExplorePagination currentPage={feedPage} totalPages={feedTotalPages} onPageChange={onPageChange}/>
        </div>
    );
}