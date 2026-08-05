"use-client";

import { WorkspaceRefreshProvider } from "@/context/workspace/refresh-context.tsx";
import { PodcastCard } from "./podcast-card.tsx";
import MyPodcasts from "./my-podcasts.tsx";
import RecentPodcasts from "./recent-podcast.tsx";

export default function PodcastWorkspace() {
    return (
        <WorkspaceRefreshProvider>
            <main className="px-8 space-y-8 overflow-x-hidden mb-16">        
                <RecentPodcasts />
                <MyPodcasts />
            </main>            
        </WorkspaceRefreshProvider>
    )
}