"use client"
import { ExploreFilter } from "@/types/explore/explore.ts";
import { ExploreSearchBar } from "../explore-searchbar.tsx";
import { ExplorePodcastFeed } from "./explore-podcast-feed.tsx";
import { ExplorePodcastPopular } from "./explore-podcast-popular.tsx";
import { ExplorePodcastRecent } from "./explore-podcast-recent.tsx";
import { useExplorePodcast } from "@/hooks/explore/use-explore-podcast.ts";
import { useIsMobile } from "@/hooks/use-mobile.ts";

export function ExplorePodcast() {
    const explore = useExplorePodcast();
    const isMobile = useIsMobile();

    // Mobile view
    if (isMobile) {
        return (
            <div className="space-y-8">
                <section className="flex flex-col gap-8 items-center">
                    <ExploreSearchBar 
                        onSearch={(val) => {
                            explore.setSearch(val);
                            explore.setPage(1);
                            explore.setIsSearching(true);
                        }} 
                        onCloseSearch={() => {
                            explore.setSearch("");
                            explore.setPage(1);
                            explore.setIsSearching(false);
                        }}
                    />        

                    {!explore.isSearching && (
                        <div className="w-full grid grid-cols-1 gap-y-8 lg:grid-cols-5 lg:gap-12">
                            <div className="w-full lg:col-span-2">
                            <ExplorePodcastPopular 
                                popularPodcast={explore.popularPodcast}
                                isLoadingFeatured={explore.isLoadingFeatured}
                            />
                            </div>
                            <div className="w-full lg:col-span-3">
                            <ExplorePodcastRecent 
                                recentPodcasts={explore.recentPodcasts}
                                isLoadingFeatured={explore.isLoadingFeatured}
                            />  
                            </div>
                        </div>
                    )}
                    
                    <ExplorePodcastFeed 
                        feedPodcast={explore.feedPodcast}
                        isLoadingFeed={explore.isLoadingFeed}
                        feedFilter={{
                            search: explore.search,
                            page: explore.page,
                            limit: 10,
                            sort: explore.sort,
                            order: explore.order,
                        }}
                        onSortChange={(sortField: ExploreFilter["sort"], sortOrder: ExploreFilter["order"]) => {
                            explore.setSort(sortField ?? "title");
                            explore.setOrder(sortOrder ?? "asc");
                            explore.setPage(1);
                        }}
                        feedPage={explore.page}
                        feedTotalPages={explore.totalPages}
                        onPageChange={(feedPage) => {
                            explore.setPage(feedPage);
                        }}
                    />
                </section>
            </div>
        )
    }


    return (
        <div className="space-y-8">
            <section className="flex flex-col gap-8">
                <div className="max-w-md">
                    <ExploreSearchBar 
                        onSearch={(val) => {
                            explore.setSearch(val);
                            explore.setPage(1);
                            explore.setIsSearching(true);
                        }} 
                        onCloseSearch={() => {
                            explore.setSearch("");
                            explore.setPage(1);
                            explore.setIsSearching(false);
                        }}
                    />     
                </div>   

                {!explore.isSearching && (
                    <div className="w-full grid grid-cols-1 gap-y-8 lg:grid-cols-5 lg:gap-12">
                        <div className="w-full lg:col-span-2">
                        <ExplorePodcastPopular 
                            popularPodcast={explore.popularPodcast}
                            isLoadingFeatured={explore.isLoadingFeatured}
                        />
                        </div>
                        <div className="w-full lg:col-span-3">
                        <ExplorePodcastRecent 
                            recentPodcasts={explore.recentPodcasts}
                            isLoadingFeatured={explore.isLoadingFeatured}
                        />  
                        </div>
                    </div>
                )}
                
                <ExplorePodcastFeed 
                    feedPodcast={explore.feedPodcast}
                    isLoadingFeed={explore.isLoadingFeed}
                    feedFilter={{
                        search: explore.search,
                        page: explore.page,
                        limit: 10,
                        sort: explore.sort,
                        order: explore.order,
                    }}
                    onSortChange={(sortField: ExploreFilter["sort"], sortOrder: ExploreFilter["order"]) => {
                        explore.setSort(sortField ?? "title");
                        explore.setOrder(sortOrder ?? "asc");
                        explore.setPage(1);
                    }}
                    feedPage={explore.page}
                    feedTotalPages={explore.totalPages}
                    onPageChange={(feedPage) => {
                        explore.setPage(feedPage);
                    }}
                />
            </section>
        </div>
    );
}