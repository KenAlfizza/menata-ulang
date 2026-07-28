// context/workspace/researcher-refresh-context.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface WorkspaceRefreshContextValue {
    refreshKey: number;
    triggerRefresh: () => void;
}

const WorkspaceRefreshContext = createContext<WorkspaceRefreshContextValue | undefined>(undefined);

export function WorkspaceRefreshProvider({ children }: { children: ReactNode }) {
    const [refreshKey, setRefreshKey] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    return (
        <WorkspaceRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
            {children}
        </WorkspaceRefreshContext.Provider>
    );
}

export function useWorkspaceRefresh() {
    const ctx = useContext(WorkspaceRefreshContext);
    if (!ctx) throw new Error("useWorkspaceRefresh must be used within a WorkspaceRefreshProvider");
    return ctx;
}