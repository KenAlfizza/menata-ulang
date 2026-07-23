"use client"

import { ResearchCard } from "./research-card.tsx";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context.tsx";
import { useResearcherRefresh } from "@/context/workspace/researcher-refresh-context.tsx";

import type { WorkspaceResearchRecord } from "@/types/workspace.ts";
import { fetchRecentResearches } from "@/services/workspace/researcher.ts";

export default function RecentResearches() {
    const { accessToken } = useAuth();
    const { refreshKey } = useResearcherRefresh();
    const [recentResearches, setRecentResearches] = useState<WorkspaceResearchRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadRecentResearches() {
            if (!accessToken) return;
            try {
                setIsLoading(true);
                setError(null);

                const data = await fetchRecentResearches(accessToken);
                setRecentResearches(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load recent researches")
            } finally {
                setIsLoading(false);
            }
        }

        if (accessToken) {
            loadRecentResearches();
        }
    }, [accessToken, refreshKey]); // refetch on token change OR on any publish toggle

    if (error) return <div className="py-4 text-red-500">{error}</div>;

    return (
        <div className="w-full">
            <h2 className="text-2xl tracking-tight text-zinc-600">Recent Researches</h2>
            <div className="flex flex-row gap-8 py-4">
                <ResearchCard isNewResearch />
                <div 
                className="w-full transition-opacity duration-300 ease-in-out"
                style={{ opacity: isLoading ? 0.4 : 1 }}
            >
                <div className="grid grid-cols-2 gap-8">
                    {/* If loading, show skeletons. Otherwise, show stories. */}
                    {isLoading
                    ?   Array.from({ length: 2 }).map((_, i) => <ResearchCard key={`skeleton-${i}`} isLoading />)
                    :   recentResearches.map((research) => (
                            <ResearchCard 
                                key={research.id} 
                                research={research} 
                            />
                        ))
                    } 
                </div>
            </div>
                
            </div>
        </div>
    )
}