"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Filter } from "lucide-react";
import { useAuth } from "@/context/auth-context.tsx";

import { SearchBar } from "../../searchbar.tsx";
import { Button } from "../../ui/button.tsx";
import { ResearchCard } from "./research-card.tsx";
import { PageSelector } from "./page-selector.tsx";
import { fetchMyResearches } from "@/services/workspace/researcher.ts";
import { WorkspaceResearchRecord } from "@/types/workspace.ts";
import { useResearcherRefresh } from "@/context/workspace/researcher-refresh-context.tsx";
import { ApiError } from "@/types/error.ts";

export default function MyResearches() {
    const { accessToken } = useAuth();
    const { refreshKey } = useResearcherRefresh();
    
    const [researches, setResearches] = useState<WorkspaceResearchRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(1);

    const isInitialMount = useRef(true);

    const extractErrorMessage = (err: unknown, defaultMsg: string) => {
        if (err instanceof ApiError) {
            const errorPayload = err.response?.error;
            if (typeof errorPayload === "string") return errorPayload;
            if (errorPayload?.message) return errorPayload.message;
        }
        if (err instanceof Error) return err.message;
        return defaultMsg;
    };

    const loadStories = useCallback(async () => {
        if (!accessToken) return;
        
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const data = await fetchMyResearches(accessToken, { filter, page, limit: 10 });
            setTimeout(() => {
                setResearches(data.items);
                setTotal(data.total);
                setTotalPages(data.totalPages);
                setIsLoading(false);
            }, 300);
        } catch (err) {
            console.error("Fetch Error:", err);
            const message = extractErrorMessage(err, "Failed to load researches");
            setErrorMessage(message);
            setIsLoading(false);
        }
    }, [accessToken, filter, page]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            loadStories();
            return;
        }
        loadStories();
    }, [page, filter, loadStories]);

    // Refetch whenever a publish toggle happens anywhere (MyResearches or RecentResearches)
    useEffect(() => {
        if (refreshKey === 0) return; // skip firing on initial mount
        loadStories();
    }, [refreshKey, loadStories]);
    
    return (
        <div className="w-full">
            <div className="flex items-center">
                <h2 className="text-2xl tracking-tight text-zinc-600">My Research ({total})</h2>

                <div className="flex gap-2 ml-auto">
                    <SearchBar 
                        placeholder="Search..." 
                        onSearch={(val) => {
                            setFilter(val);
                            setPage(1);
                        }} 
                    />
                    <Button className="bg-black">
                        <Filter className="text-white" />
                    </Button>
                </div>
            </div>

            {errorMessage && (
                <div className="w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm my-4">
                    {errorMessage}
                </div>
            )}

            {/* Transition Container: Stable height, changing opacity */}
            <div 
                className="min-h-[360px] w-full transition-opacity duration-300 ease-in-out"
                style={{ opacity: isLoading ? 0.4 : 1 }}
            >
                <div className="grid grid-cols-2 gap-8 py-4">
                    {/* If loading, show skeletons. Otherwise, show stories. */}
                    {isLoading
                        ? Array.from({ length: 10 }).map((_, i) => <ResearchCard key={`skeleton-${i}`} isLoading />)
                        : researches.map((research) => <ResearchCard key={research.id} research={research} />)
                    }
                </div>
            </div>

            <div className="w-full mt-8">
                <PageSelector 
                    currentPage={page} 
                    totalPages={totalPages} 
                    onPageChange={setPage} 
                />
            </div>
        </div>
    );
}