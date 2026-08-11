"use client"
import { ExploreFilter } from "@/types/explore/explore.ts";
import { ExploreSearchBar } from "../explore-searchbar.tsx";
import { ExplorePodcastFeed } from "./explore-podcast-feed.tsx";
import { ExplorePodcastPopular } from "./explore-podcast-popular.tsx";
import { ExplorePodcastRecent } from "./explore-podcast-recent.tsx";
import { useExplorePodcast } from "@/hooks/explore/use-explore-podcast.ts";

export function ExplorePodcast() {
    const explore = useExplorePodcast();

    return (
        <div className="space-y-8">
            <section className="flex flex-col gap-8">
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
                    <div className="flex flex-row gap-16">
                        <ExplorePodcastPopular 
                            popularPodcast={explore.popularPodcast}
                            isLoadingFeatured={explore.isLoadingFeatured}
                        />
                        <ExplorePodcastRecent 
                            recentPodcasts={explore.recentPodcasts}
                            isLoadingFeatured={explore.isLoadingFeatured}
                        />  
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