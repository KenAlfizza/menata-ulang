import { Filter } from "lucide-react";
import { useMyPodcasts } from "@/hooks/workpace/podcast/use-podcast-workspace.ts";
import { SearchBar } from "../../searchbar.tsx";
import { Button } from "../../ui/button.tsx";
import { PageSelector } from "../page-selector.tsx";
import { PodcastCard } from "./podcast-card.tsx";

export default function MyPodcasts() {
    const myPodcasts = useMyPodcasts();

    return (
        <div className="w-full">
            <div className="flex items-center">
                <h2 className="text-2xl tracking-tight text-zinc-600">My Podcasts ({myPodcasts.totalCount})</h2>

                <div className="flex gap-2 ml-auto">
                    <SearchBar
                        placeholder="Search..."
                        onSearch={(val) => {
                            myPodcasts.setSearch(val);
                            myPodcasts.setPage(1);
                        }}
                    />
                    <Button className="bg-black">
                        <Filter className="text-white" />
                    </Button>
                </div>
            </div>

            {/* Transition Container: Stable height, changing opacity */}
            <div
                className="transition-opacity duration-300 ease-in-out"
                style={{ opacity: myPodcasts.isLoading ? 0.4 : 1 }}
            >
                <div className="grid grid-cols-5 gap-2 py-4">
                    {/* If loading, show skeletons. Otherwise, show podcasts. */}
                    {myPodcasts.isLoading
                        ? Array.from({ length: 9 }).map((_, i) => <PodcastCard key={`skeleton-${i}`} isLoading />)
                        : myPodcasts.podcasts.map((podcast) => <PodcastCard key={podcast.id} podcast={podcast} />)
                    }
                </div>
            </div>

            <div className="mt-8">
                <PageSelector
                    currentPage={myPodcasts.page}
                    totalPages={myPodcasts.totalPages}
                    onPageChange={myPodcasts.setPage}
                />
            </div>
        </div>
    );
}