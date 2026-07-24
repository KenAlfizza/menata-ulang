"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

import { Puck, Data } from "@puckeditor/core";
import { createPuckConfig } from "./puck.config";
import "@puckeditor/core/puck.css";

import { useAuth } from "@/context/auth-context";
import { retrieveResearchPage } from "@/services/editor/researcher.ts";
import { useSaveResearch } from "../../../hooks/editor/use-save.ts";
import { EditorHeader } from "../header/editor-header.tsx";

import { Loader2 } from "lucide-react";

interface ResearchEditorProps {
    pageId: string;
}

export function ResearchEditor({ pageId }: ResearchEditorProps) {
    const { accessToken } = useAuth();

    const [data, setData] = useState<Data | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Save hook
    const {isSaving, saveWorkspace } = useSaveResearch({pageId, accessToken});

    // Dynamically generate the config once the access token is loaded
    const puckConfig = useMemo(() => {
        return createPuckConfig(accessToken || "");
    }, [accessToken]);

    useEffect(() => {
        async function initPageWorkspace() {
            if (!pageId || !accessToken) return;
            try {
                setIsLoading(true);
                const researchPage = await retrieveResearchPage(accessToken, pageId);
                setData(researchPage.puckData);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Failed to properly initialize editor data");
            } finally {
                setIsLoading(false);
            }
        }

        initPageWorkspace();
    }, [pageId, accessToken]);

    const overrides = useMemo(
        () => ({
            header: () => <EditorHeader isSaving={isSaving} onSave={saveWorkspace} />,
        }),
        [isSaving, saveWorkspace]
    );

    if (isLoading) {
        return (
            <div className="bg-zinc-100 w-full h-screen flex items-center justify-center gap-3">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-zinc-500">Syncing Canvas Workspace...</span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="w-full h-screen bg-[#1A1A2E] flex flex-col items-center justify-center text-white p-6">
                <p className="text-red-400 font-semibold mb-4">{error}</p>
                <Link href="/" className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md transition">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen flex flex-col overflow-hidden bg-background select-none">
            <Puck
                config={puckConfig}
                data={data}
                onChange={(newData) => setData(newData)}
                ui={{ leftSideBarVisible: false }}
                overrides={overrides}
            />
        </div>
    );
}