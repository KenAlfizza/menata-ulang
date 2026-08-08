import { ExplorePodcastCard } from "./explore-podcast-card.tsx";

export function ExplorePodcastRecent() {
    return (
        <div className="flex flex-col gap-2">
            <span className="font-medium text-lg">Recently Added</span>
            <div className="grid grid-cols-3 gap-8">
                <ExplorePodcastCard/>
                <ExplorePodcastCard/>
                <ExplorePodcastCard/>
            </div>
        </div>
    )
}