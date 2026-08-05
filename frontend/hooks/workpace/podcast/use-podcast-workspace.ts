import { useAuth } from "@/context/auth-context.tsx";
import { useEffect, useState, useCallback } from "react";
import { ApiError } from "@/types/error.ts";
import { WorkspacePodcastRecord } from "../../../types/workspace.ts";
import { fetchMyPodcasts } from "../../../services/workspace/host.ts";
import { useWorkspaceRefresh } from "@/context/workspace/refresh-context.tsx";
import { extractErrorMessage } from "../../../lib/error.ts";


export function useMyPodcasts() {
    const { accessToken } = useAuth();
    const { refreshKey } = useWorkspaceRefresh();
    
    // Error & Loading State
    const [error, setError] = useState<ApiError | null>(null);
    const [toastError, setToastError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Podcast entries
    const [podcasts, setPodcasts] = useState<WorkspacePodcastRecord[]>([]);
    const [totalCount, setTotalCount] = useState(0);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Search
    const [search, setSearch] = useState("");


    // Fetch on mount
    useEffect(() => {
        async function loadMyPodcasts() {
            if (!accessToken) {
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const result = await fetchMyPodcasts(accessToken);

                setPodcasts(result.items);
                setTotalCount(result.total);
                setPage(result.page);
                setTotalPages(result.totalPages);
            } catch (err: any) {
                const error = err as ApiError
                const errorMessage = extractErrorMessage(error, "Failed to fetch my podcasts");
                console.log(error);

                setError(error);
                setToastError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }
        loadMyPodcasts();
    }, [accessToken, refreshKey, search, page]);

    return {
        podcasts,
        totalCount,
        page,
        setPage,
        totalPages,
        search,
        setSearch,
        isLoading,
        error,
        toastError,
        setToastError,
    };
}