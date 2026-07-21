"use client";

import { useEffect, useRef, useState, useTransition, useCallback, useMemo, createContext, useContext } from "react";
import { useRouter } from "next/navigation";

import { Puck, Data, createUsePuck } from "@puckeditor/core";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Undo2, Redo2, Save, ArrowLeft } from "lucide-react";

import { createPuckConfig } from "./puck.config";
import "@puckeditor/core/puck.css";

import { useAuth } from "@/context/auth-context";
import { Button } from "../../ui/button.tsx";
import { retrieveStoryPage, updateStoryPage } from "@/services/editor/author.ts";

const usePuck = createUsePuck();
const SavingContext = createContext(false);

interface StoryEditorProps {
    pageId: string;
}

function HistoryControls() {
    const back = usePuck((s) => s.history.back);
    const forward = usePuck((s) => s.history.forward);
    const hasPast = usePuck((s) => s.history.hasPast);
    const hasFuture = usePuck((s) => s.history.hasFuture);

    return (
        <div className="flex items-center gap-1">
            <Button
                onClick={back}
                disabled={!hasPast}
                aria-label="Undo"
                className="text-zinc-100 bg-zinc-100 h-8 w-8 flex items-center justify-center rounded-md transition disabled:cursor-not-allowed hover:bg-zinc-200"
            >
                <Undo2 size={16} />
            </Button>
            <Button
                onClick={forward}
                disabled={!hasFuture}
                aria-label="Redo"
                className="text-zinc-100 bg-zinc-100 h-8 w-8 flex items-center justify-center rounded-md transition disabled:cursor-not-allowed hover:bg-zinc-200"
            >
                <Redo2 size={16} />
            </Button>
        </div>
    );
}

function SaveButton({ onSave }: { onSave: () => void }) {
    const isSaving = useContext(SavingContext);
    return (
        <Button
            disabled={isSaving}
            onClick={onSave}
            aria-label="Save"
            className="bg-zinc-100 h-8 w-8 flex items-center justify-center rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-200"
        >
            {isSaving ? <Loader2 color="#00a6f4" size={16} className="animate-spin" /> : <Save color="#00a6f4" size={16} />}
        </Button>
    );
}

function BackButton() {
    const router = useRouter();
    return (
        <Button
            onClick={() => router.back()}
            aria-label="Back"
            className="text-zinc-600 bg-zinc-100 h-8 w-8 flex items-center justify-center rounded-md transition hover:bg-zinc-200"
        >
            <ArrowLeft size={16} />
        </Button>
    );
}

function EditorHeader({ onSave }: { onSave: () => void; }) {
    return (
        <div className="bg-white px-2 h-12 flex justify-between items-center border-b border-zinc-200 z-50">
            <div className="flex items-center gap-2 w-1/4">
                <BackButton />
                <Image
                    src="/logo-text.svg"
                    alt="Logo"
                    width={128}
                    height={128}
                    priority
                    className="w-auto h-6 brightness-0"
                />
                <span className="text-zinc-300 select-none text-xs">|</span>
                <span className="text-xs font-semibold text-zinc-900/50 uppercase">Story Editor</span>
            </div>

            <div className="flex items-center justify-end gap-1">
                <HistoryControls />
                <SaveButton onSave={onSave} />
            </div>
        </div>
    );
}

export function StoryEditor({ pageId }: StoryEditorProps) {
    const { accessToken } = useAuth();

    const [data, setData] = useState<Data | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, startSaving] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const dataRef = useRef<Data | null>(null);
    dataRef.current = data;

    // Dynamically generate the config once the access token is loaded
    const puckConfig = useMemo(() => {
        return createPuckConfig(accessToken || "");
    }, [accessToken]);

    useEffect(() => {
        async function initPageWorkspace() {
            if (!pageId || !accessToken) return;
            try {
                setIsLoading(true);
                const storyPage = await retrieveStoryPage(accessToken, pageId);
                console.log("Story page data: ", storyPage);
                setData(storyPage.puckData);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Failed to properly initialize editor data");
            } finally {
                setIsLoading(false);
            }
        }

        initPageWorkspace();
    }, [pageId, accessToken]);

    const handleSaveWorkspace = useCallback((currentData: Data) => {
        if (!pageId || !accessToken) return;

        startSaving(async () => {
            try {
                await updateStoryPage(accessToken, pageId, currentData);
            } catch (err: any) {
                alert(`Error trying to update data record: ${err.message}`);
            }
        });
    }, [pageId, accessToken]);

    const onSave = useCallback(() => {
        if (dataRef.current) handleSaveWorkspace(dataRef.current);
    }, [handleSaveWorkspace]);

    // Only `header` is overridden — outline, drawer, fields panel stay default.
    // Both onSave are stable callbacks, so this never changes
    // identity on a keystroke; isSaving reach their buttons
    // via Context instead of being dependencies here.
    const overrides = useMemo(
        () => ({
            header: () => <EditorHeader onSave={onSave} />,
        }),
        [onSave]
    );

    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center gap-3">
                <Loader2 className="animate-spin" size={24} />
                <span>Syncing Canvas Workspace...</span>
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
        <SavingContext.Provider value={isSaving}>
            <div className="relative w-full h-screen flex flex-col overflow-hidden bg-background select-none">
                <Puck
                    config={puckConfig}
                    data={data}
                    onChange={(newData) => setData(newData)}
                    ui={{ leftSideBarVisible: false }}
                    overrides={overrides}
                />
            </div>
        </SavingContext.Provider>
    );
}