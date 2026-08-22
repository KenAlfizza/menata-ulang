"use client"
import { useEffect, useState } from "react";
import { ExplorePodcastSummary } from "@/types/explore/podcast.ts";
import { ApiError } from "@/types/error.ts";
import { getPodcastPopular, getPodcasts } from "../../services/explore/podcast.ts";
import { ExploreFilter } from "../../types/explore/explore.ts";

export function useExplorePodcast() {
    const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
    const [isLoadingFeed, setIsLoadingFeed] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);

    const [popularPodcast, setPopularPodcast] = useState<ExplorePodcastSummary>();
    const [recentPodcasts, setRecentPodcasts] = useState<ExplorePodcastSummary[]>([]);
    
    const [feedPodcasts, setFeedPodcasts] = useState<ExplorePodcastSummary[]>([]);
    const [totalCount, setTotalCount] = useState(0);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [search, setSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const [sort, setSort] = useState<ExploreFilter["sort"]>("title");
    const [order, setOrder] = useState<ExploreFilter["order"]>("asc");

    useEffect(() => {
        async function loadFeaturedData() {
            try {
                setIsLoadingFeatured(true);
                const recentFilter: ExploreFilter = {
                    page: 1,
                    limit: 3,
                    sort: "updatedAt",
                    order: "desc",
                };
                
                const [recentResult, popularResult] = await Promise.all([
                    getPodcasts(recentFilter),
                    getPodcastPopular()
                ]);

                setRecentPodcasts(recentResult.items);
                setPopularPodcast(popularResult);
            } catch (err: any) {
                console.error("Failed to load featured podcasts:", err);
            } finally {
                setIsLoadingFeatured(false);
            }
        }

        loadFeaturedData();
    }, []);

    useEffect(() => {
        async function loadFeedData() {
            try {
                setIsLoadingFeed(true);
                setError(null);

                const feedFilter: ExploreFilter = {
                    search,
                    page,
                    limit: 10,
                    sort,
                    order,
                };

                const feedResult = await getPodcasts(feedFilter);

                setFeedPodcasts(feedResult.items);
                setTotalCount(feedResult.total);
                setPage(feedResult.page);
                setTotalPages(feedResult.totalPages);
            } catch (err: any) {
                const apiError = err as ApiError;
                setError(apiError);
            } finally {
                setIsLoadingFeed(false);
            }
        }

        loadFeedData();
    }, [search, page, sort, order]);

    return {
        isLoadingFeatured,
        isLoadingFeed,
        error,
        popularPodcast,
        recentPodcasts,
        feedPodcasts,
        totalCount,
        page,
        setPage,
        totalPages,
        search,
        setSearch,
        isSearching,
        setIsSearching,
        sort,
        setSort,
        order,
        setOrder,
    };
}