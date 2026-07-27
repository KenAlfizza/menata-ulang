import { useTransition, useCallback } from "react";
import { Data } from "@puckeditor/core";
import { updateResearchPage } from "@/services/editor/researcher";

interface UseSaveProps {
    pageId: string;
    accessToken: string | null;
}

export function useSaveResearch({ pageId, accessToken }: UseSaveProps) {
    const [isSaving, startSaving] = useTransition();

    const saveWorkspace = useCallback(async (currentData: Data): Promise<boolean> => {
        if (!pageId || !accessToken) return false;

        return new Promise((resolve) => {
            startSaving(async () => {
                try {
                    await updateResearchPage(accessToken, pageId, currentData);
                    resolve(true);
                } catch (err: any) {
                    alert(`Error trying to update data record: ${err.message}`);
                    resolve(false);
                }
            });
        });
    }, [pageId, accessToken]);

    return {
        isSaving,
        saveWorkspace,
    };
}