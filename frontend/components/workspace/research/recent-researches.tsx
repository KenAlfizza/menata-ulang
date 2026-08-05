"use client"

import { ResearchCard } from "./research-card.tsx";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context.tsx";
import { useResearcherRefresh } from "@/context/workspace/researcher-refresh-context.tsx";

import type { WorkspaceResearchRecord } from "@/types/workspace.ts";
import { fetchRecentResearches } from "@/services/workspace/researcher.ts";
import { ApiError } from "@/types/error.ts";

export default function RecentResearches() {
    const { accessToken } = useAuth();
    const { refreshKey } = useResearcherRefresh();
    const [recentResearches, setRecentResearches] = useState<WorkspaceResearchRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const extractErrorMessage = (err: unknown, defaultMsg: string) => {
        if (err instanceof ApiError) {
            const errorPayload = err.response?.error;
            if (typeof errorPayload === "string") return errorPayload;
            if (errorPayload?.message) return errorPayload.message;
        }
        if (err instanceof Error) return err.message;
        return defaultMsg;
    };

    useEffect(() => {
        async function loadRecentResearches() {
            if (!accessToken) return;
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const data = await fetchRecentResearches(accessToken);
                setRecentResearches(data);
            } catch (err) {
                console.error(err);
                const message = extractErrorMessage(err, "Failed to load recent researches");
                setErrorMessage(message);
            } finally {
                setIsLoading(false);
            }
        }

        if (accessToken) {
            loadRecentResearches();
        }
    }, [accessToken, refreshKey]); // refetch on token change OR on any publish toggle

    return (
        <div className="w-full">
            <h2 className="text-2xl tracking-tight text-zinc-600">Recent Researches</h2>
            
            {errorMessage && (
                <div className="w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm my-4">
                    {errorMessage}
                </div>
            )}

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