"use client";

import { WorkspaceRefreshProvider } from "@/context/workspace/refresh-context.tsx";
import MyPodcasts from "./my-podcasts.tsx";
import RecentPodcasts from "./recent-podcast.tsx";
import { PodcastPlayer } from "./podcast-player.tsx";
import { PodcastPlayerHorizontal } from "./podcast-player-horizontal.tsx";
import { PlayerProvider } from "../../../context/podcast/player-context.tsx";

export default function PodcastWorkspace() {
    return (
        <WorkspaceRefreshProvider>
            <PlayerProvider>
            <div className="flex-1 flex flex-col">
                <div className="flex-1 px-8 space-y-8 overflow-x-hidden pb-4">
                    <RecentPodcasts />
                    <MyPodcasts />
                </div>

                <div className="sticky z-10 bottom-0 px-8 pb-4 pt-3 bg-gradient-to-t from-zinc-100 from-60% to-transparent">
                    <PodcastPlayerHorizontal
                    />
                </div>
            </div>
            </PlayerProvider>
        </WorkspaceRefreshProvider>
    )
}