"use client"

// import { fetchRecentStories } from "@/api/author";

import { ResearchCard } from "./research-card.tsx";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context.tsx";
import type { ResearchRecord } from "@/api/researcher.ts";

export default function RecentResearches() {
    const { accessToken } = useAuth();
    const [recentResearches, setRecentResearches] = useState<ResearchRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadRecentStories() {
            if (!accessToken) return;
            try {
                setIsLoading(true);
                setError(null);

                // const stories = await fetchRecentStories(accessToken);
                // setRecentStories(stories);
            } catch (err) {
                console.error(err);
                setError("Failed to load recent stories")
            } finally {
                setIsLoading(false);
            }
        }

        if (accessToken) {
            loadRecentStories();
        }
    }, [accessToken]); // Re run for access token changes

    if (isLoading) return <div className="py-4 text-gray-500">Loading stories...</div>;
    if (error) return <div className="py-4 text-red-500">{error}</div>;

    return (
        <div className="w-full">
            <h2 className="text-black text-2xl font-semibold">Recent Research</h2>
            <div className="grid grid-cols-4 gap-8 py-4">
                <ResearchCard />

                {recentResearches.map((research) => (
                    <ResearchCard 
                        key={research.id} 
                        research={research} 
                    />
                ))}
                
            </div>
        </div>
    )
}
