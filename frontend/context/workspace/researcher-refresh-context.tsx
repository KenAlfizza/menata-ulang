// context/workspace/researcher-refresh-context.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ResearcherRefreshContextValue {
    refreshKey: number;
    triggerRefresh: () => void;
}

const ResearcherRefreshContext = createContext<ResearcherRefreshContextValue | undefined>(undefined);

export function ResearcherRefreshProvider({ children }: { children: ReactNode }) {
    const [refreshKey, setRefreshKey] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    return (
        <ResearcherRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
            {children}
        </ResearcherRefreshContext.Provider>
    );
}

export function useResearcherRefresh() {
    const ctx = useContext(ResearcherRefreshContext);
    if (!ctx) throw new Error("useResearcherRefresh must be used within a ResearcherRefreshProvider");
    return ctx;
}