"use-client";

import { WorkspaceRefreshProvider } from "@/context/workspace/refresh-context.tsx";


export default function PodcastWorkspace() {
    return (
        <WorkspaceRefreshProvider>
            <main className="px-8 space-y-8 overflow-x-hidden mb-16">
                Podcast Workspace    
            </main>            
        </WorkspaceRefreshProvider>
    )
}