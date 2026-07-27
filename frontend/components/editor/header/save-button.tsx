"use client";

import { createUsePuck } from "@puckeditor/core";
import { Loader2, Save } from "lucide-react";
import { Button } from "../../ui/button";

// Initialize the hook so it supports selectors
const usePuck = createUsePuck();

interface SaveButtonProps {
    isSaving: boolean;
    onSave: (data: any) => void;
}

export function ResearchSaveButton({ isSaving, onSave }: SaveButtonProps) {
    // Access the live Puck data correctly via s.appState.data
    const puckData = usePuck((s) => s.appState.data);

    return (
        <Button
            disabled={isSaving}
            onClick={() => onSave(puckData)}
            aria-label="Save"
            className="bg-zinc-100 h-8 w-8 flex items-center justify-center rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-200"
        >
            {isSaving ? <Loader2 color="#00a6f4" size={16} className="animate-spin" /> : <Save color="#00a6f4" size={16} />}
        </Button>
    );
}