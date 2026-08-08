import { ExplorePodcastCard } from "./explore-podcast-card.tsx";

export function ExplorePodcastPopular() {
    return (
        <div className="flex flex-col gap-2">
            <span className="font-medium text-lg">Most Listened</span>
            <ExplorePodcastCard/>
        </div>
    )
}