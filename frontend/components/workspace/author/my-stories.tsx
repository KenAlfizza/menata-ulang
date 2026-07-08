"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Filter } from "lucide-react";
import { useAuth } from "@/context/auth-context.tsx";
import { fetchMyStories } from "@/services/workspace/author";
import type { WorkspaceStoryRecord } from "@/types/workspace.ts";

import { SearchBar } from "../../searchbar.tsx";
import { Button } from "../../ui/button.tsx";
import { StoryCard } from "./story-card.tsx";
import { PageSelector } from "./page-selector.tsx";

export default function MyStories() {
    const { accessToken } = useAuth();
    
    // Core State
    const [stories, setStories] = useState<WorkspaceStoryRecord[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    // Single source of truth for loading/transition state
    const [isLoading, setIsLoading] = useState(true);
    
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(1);

    const isInitialMount = useRef(true);

    const loadStories = useCallback(async () => {
        if (!accessToken) return;
        
        setIsLoading(true);
        try {
            const data = await fetchMyStories(accessToken, { filter, page, limit: 10 });
            
            // We keep the loading state true for 300ms to ensure the fade-in 
            // effect is visible even if the API is extremely fast
            setTimeout(() => {
                setStories(data.stories);
                setTotalCount(data.totalCount);
                setTotalPages(data.totalPages);
                setIsLoading(false);
            }, 300);
        } catch (err) {
            console.error("Fetch Error:", err);
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

    return (
        <div className="w-full overflow-hidden">
            <div className="flex items-center mb-6">
                <h2 className="text-2xl font-semibold">My Stories ({totalCount})</h2>

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

            {/* Transition Container: Stable height, changing opacity */}
            <div 
                className="min-h-[400px] transition-opacity duration-300 ease-in-out"
                style={{ opacity: isLoading ? 0.4 : 1 }}
            >
                <div className="grid grid-cols-5 gap-8 py-4">
                    {/* If loading, show skeletons. Otherwise, show stories. */}
                    {isLoading
                        ? Array.from({ length: 10 }).map((_, i) => <StoryCard key={`skeleton-${i}`} isLoading />)
                        : stories.map((story) => <StoryCard key={story.id} story={story} />)
                    }
                </div>
            </div>

            <div className="mt-8">
                <PageSelector 
                    currentPage={page} 
                    totalPages={totalPages} 
                    onPageChange={setPage} 
                />
            </div>
        </div>
    );
}