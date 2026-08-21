"use client"
import { ExploreFilterBar } from "../explore-filter.tsx";
import { ExplorePodcastCard } from "./card/explore-podcast-card.tsx";
import { ExplorePodcastSummary } from "@/types/explore/podcast.ts";
import { ExploreFilter } from "@/types/explore/explore.ts";
import { ExplorePagination } from "../explore-pagination.tsx";
import { useIsMobile } from "@/hooks/use-mobile.ts";
import { ExplorePodcastMobileCard } from "./card/explore-podcast-mobile-card.tsx";
import { ExploreMobileFilter } from "../mobile/explore-mobile-filter.tsx";

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
    const isMobile = useIsMobile();
    if (isMobile) return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
                <span className="font-medium text-xl">Podcast Feed</span>
                <ExploreMobileFilter page="podcast" sort={feedFilter.sort} order={feedFilter.order} onSortChange={onSortChange}/>
            </div>
            <div className="w-full grid gap-2">
                {isLoadingFeed ? (
                    Array.from({ length: 10 }).map((_, index) => (
                        <ExplorePodcastMobileCard
                            key={`skeleton-${index}`}
                            isLoading={isLoadingFeed}
                        />
                    ))
                ) : (
                    feedPodcast.map((podcast) => (
                        <ExplorePodcastMobileCard
                            key={podcast.slug}
                            podcast={podcast}
                            isLoading={isLoadingFeed}
                        />
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
                <span className="font-medium text-xl">Podcast Feed</span>
                <ExploreFilterBar 
                    page="podcast"
                    sort={feedFilter.sort ?? "title"} 
                    order={feedFilter.order ?? "asc"} 
                    onSortChange={onSortChange}
                />
            </div>
            <div className="w-full grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-5 lg:gap-4">
                {isLoadingFeed ? (
                    Array.from({ length: 10 }).map((_, index) => (
                        <ExplorePodcastCard
                            key={`skeleton-${index}`}
                            isLoading={isLoadingFeed}
                            feedPodcast={feedPodcast}
                        />
                    ))
                ) : (
                    feedPodcast.map((podcast) => (
                        <ExplorePodcastCard
                            key={podcast.slug}
                            podcast={podcast}
                            isLoading={isLoadingFeed}
                            feedPodcast={feedPodcast}
                        />
                    ))
                )}
            </div>
            <ExplorePagination currentPage={feedPage} totalPages={feedTotalPages} onPageChange={onPageChange}/>
        </div>
    );
}