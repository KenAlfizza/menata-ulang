import { ExplorePodcastFeed } from "./explore-podcast-feed.tsx";
import { ExplorePodcastPopular } from "./explore-podcast-popular.tsx";
import { ExplorePodcastRecent } from "./explore-podcast-recent.tsx";

export function ExplorePodcast() {
    return (
        <div className="px-12 space-y-8">
            <section className="flex flex-col gap-8">
                <div className="flex flex-row gap-24">
                    <ExplorePodcastPopular/>
                    <ExplorePodcastRecent/>
                </div>
                <ExplorePodcastFeed/>
            </section>
        </div>
    )
}