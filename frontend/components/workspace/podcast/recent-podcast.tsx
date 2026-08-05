import { useRecentPodcasts } from "@/hooks/workpace/podcast/use-podcast-workspace.ts";
import { PodcastCard } from "./podcast-card.tsx";

export default function RecentPodcasts() {
    const recentPodcasts = useRecentPodcasts();
    console.log(recentPodcasts);

    return (
        <div className="w-full">
            <div className="flex items-center mb-6">
                <h2 className="text-2xl tracking-tight text-zinc-600">Recent Podcasts</h2>
            </div>

            {/* Transition Container: Stable height, changing opacity */}
            <div
                className="transition-opacity duration-300 ease-in-out"
                style={{ opacity: recentPodcasts.isLoading ? 0.4 : 1 }}
            >
                <div className="grid grid-cols-4 gap-2 py-4">
                    {/* If loading, show skeletons. Otherwise, show podcasts. */}
                    <PodcastCard isNewPodcast/>
                    {recentPodcasts.isLoading
                        ? Array.from({ length: 3 }).map((_, i) => <PodcastCard key={`skeleton-${i}`} isLoading />)
                        : (recentPodcasts.podcasts?.length ? recentPodcasts.podcasts : []).map((podcast) => <PodcastCard key={podcast.id} podcast={podcast} />)
                    }
                </div>
            </div>
        </div>
    );
}