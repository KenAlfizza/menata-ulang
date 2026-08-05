"use client";

import RecentReseaches from "./recent-researches.tsx"
import MyResearches from "./my-researches.tsx"
import { ResearcherRefreshProvider } from "@/context/workspace/researcher-refresh-context.tsx";

export default function ResearcherWorkspace() {
    return (
        <ResearcherRefreshProvider>
            <div className="px-8 space-y-8 overflow-x-hidden mb-16">
                <section className="w-full">
                    <RecentReseaches />
                </section>
                <section className="w-full">
                    <MyResearches />
                </section>
            </div>
        </ResearcherRefreshProvider>
    )
}