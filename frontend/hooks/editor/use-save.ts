// src/components/editor/use-save-research.ts
import { useState, useTransition, useCallback } from "react";
import { Data } from "@puckeditor/core";
import { updateResearchPage } from "@/services/editor/researcher";

interface UseSaveProps {
    pageId: string;
    accessToken: string | null;
}

export function useSaveResearch({ pageId, accessToken }: UseSaveProps) {
    const [isSaving, startSaving] = useTransition();

    const saveWorkspace = useCallback((currentData: Data) => {
        if (!pageId || !accessToken) return;

        startSaving(async () => {
            try {
                await updateResearchPage(accessToken, pageId, currentData);
            } catch (err: any) {
                alert(`Error trying to update data record: ${err.message}`);
            }
        });
    }, [pageId, accessToken]);

    return {
        isSaving,
        saveWorkspace,
    };
}