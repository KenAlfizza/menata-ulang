"use client"
import { ExplorePodcastCard } from "./explore-podcast-card.tsx";
import { useExplorePodcast } from "@/hooks/explore/use-explore-podcast.ts";

export function ExplorePodcastFeed() {
    const explorePodcast = useExplorePodcast();
    const isLoading = explorePodcast.isLoadingFeed;
    const podcasts = explorePodcast.feedPodcast;
    return (
        <div className="flex flex-col gap-2">
            <span className="font-medium text-lg">Podcast Feed</span>
            <div className="flex flex-row gap-8">
                {isLoading ? (
                    // Render 3 skeleton / placeholder cards when loading
                    Array.from({ length: 5 }).map((_, index) => (
                        <ExplorePodcastCard
                            key={`skeleton-${index}`}
                            isLoading={isLoading}
                        />
                    ))
                ) : (
                    // Render actual podcast cards when data is ready
                    podcasts.map((podcast) => (
                        <ExplorePodcastCard
                            key={podcast.slug}
                            podcast={podcast}
                            isLoading={isLoading}
                        />
                    ))
                )}
            </div>
        </div>
    );
}