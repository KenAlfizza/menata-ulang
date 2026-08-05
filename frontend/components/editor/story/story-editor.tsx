"use client";
import Link from "next/link";

import { useEffect, useState, useMemo } from "react";
import { Puck, Data } from "@puckeditor/core";
import { createPuckConfig } from "./puck.config";
import "@puckeditor/core/puck.css";

import { useAuth } from "@/context/auth-context";
import { retrieveStoryPage } from "@/services/editor/author.ts";
import { useSaveStory } from "@/hooks/editor/use-save.ts";

import { AlertTriangle, FileQuestion, Loader2, ServerCrash, ShieldAlert } from "lucide-react";
import { ApiError, ApiErrorResponse } from "@/types/error.ts";
import { EditorHeader } from "../header/editor-header.tsx";

interface StoryEditorProps {
    pageId: string;
}

export function StoryEditor({ pageId }: StoryEditorProps) {
    const { accessToken } = useAuth();

    const [data, setData] = useState<Data | null>(null);
    const [lastSavedData, setLastSavedData] = useState<Data | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<ApiErrorResponse | null>(null);
    const [statusCode, setStatusCode] = useState<number | null>(null);

    const { isSaving, saveWorkspace } = useSaveStory({ pageId, accessToken });

    const hasUnsavedChanges = useMemo(() => {
        if (!data || !lastSavedData) return false;
        return JSON.stringify(data) !== JSON.stringify(lastSavedData);
    }, [data, lastSavedData]);

    const puckConfig = useMemo(() => {
        return createPuckConfig(accessToken || "");
    }, [accessToken]);

    useEffect(() => {
        async function initPageWorkspace() {
            if (!pageId || !accessToken) return;
            try {
                setIsLoading(true);
                const storyPage = await retrieveStoryPage(accessToken, pageId);
                setData(storyPage.puckData);
                setLastSavedData(storyPage.puckData);
            } catch (err: any) {
                if (err instanceof ApiError) {
                    setError(err.response);
                    setStatusCode(err.status);
                } else {
                    setError({
                        success: false,
                        error: {
                            message: err.message || "An unexpected error occurred",
                            code: "UNKNOWN_ERROR"
                        }
                    });
                    setStatusCode(500);
                }
                console.error(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        initPageWorkspace();
    }, [pageId, accessToken]);

    const handleSaveToServer = async (currentPuckData: any) => {
        const success = await saveWorkspace(currentPuckData);
        if (success) {
            setLastSavedData(currentPuckData);
        }
    };

    const overrides = useMemo(
        () => ({
            header: () => (
                <EditorHeader 
                    editorName="STORY EDITOR"
                    isSaving={isSaving} 
                    onSave={handleSaveToServer} 
                    hasUnsavedChanges={hasUnsavedChanges} 
                />
            ),
        }),
        [isSaving, handleSaveToServer, hasUnsavedChanges]
    );

    if (isLoading) {
        return (
            <div className="bg-zinc-100 w-full h-screen flex items-center justify-center gap-3">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-zinc-500">Loading Story Editor...</span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="w-full h-screen bg-zinc-50 flex flex-col items-center justify-center text-zinc-900 p-6 selection:bg-zinc-200">
                <div className="flex flex-col items-center text-center max-w-md space-y-4">
                    <div className="flex flex-row gap-4 items-center">
                        {statusCode && statusCode >= 500 ? (
                            <ServerCrash className="text-zinc-300" size={128} strokeWidth={1.75} />
                        ) : statusCode === 404 ? (
                            <FileQuestion className="text-zinc-300" size={128} strokeWidth={1.75} />
                        ) : statusCode === 403 || statusCode === 401 ? (
                            <ShieldAlert className="text-zinc-300" size={128} strokeWidth={1.75} />
                        ) : (
                            <AlertTriangle className="text-zinc-300" size={128} strokeWidth={1.75} />
                        )}

                        <div className="text-left">
                            <span className="text-6xl font-bold tracking-tight text-zinc-300">
                                {statusCode}
                            </span>
                            
                            <div className="space-y-1">
                                <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                                    {error?.error?.message}
                                </h1>
                                <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                                    Error Code: {error?.error?.code}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Link
                            href="/workspace/author/"
                            className="inline-flex items-center justify-center text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 px-4 py-2 rounded-md shadow-sm transition"
                        >
                            Return to Workspace
                        </Link>
                    </div>
                </div>
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
