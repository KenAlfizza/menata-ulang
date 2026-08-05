import Image from "next/image";

import { Data } from "@puckeditor/core";

import { BackButton } from "./back-button.tsx";
import { HistoryControls } from "./history-controls.tsx";
import { SaveButton } from "./save-button.tsx";

interface EditorHeaderProps {
    editorName: string;
    isSaving: boolean;
    onSave: (currentData: Data) => void;
    hasUnsavedChanges: boolean;
}

export function EditorHeader({ editorName, isSaving, onSave, hasUnsavedChanges }: EditorHeaderProps) {
    return (
        <div className="bg-white px-2 h-12 flex justify-between items-center border-b border-zinc-200 z-50">
            <div className="flex items-center gap-2 w-1/4">
                <BackButton hasUnsavedChanges={hasUnsavedChanges} />
                <Image
                    src="/logo-text.svg"
                    alt="Logo"
                    width={128}
                    height={128}
                    priority
                    className="w-auto h-6 brightness-0"
                />
                <span className="text-zinc-300 select-none text-xl">|</span>
                <span className="text-xs font-semibold text-zinc-900/50 uppercase">{editorName}</span>
            </div>

            <div className="flex items-center justify-end gap-1">
                <HistoryControls />
                <span className="text-zinc-300 select-none text-xl">|</span>
                <SaveButton hasUnsavedChanges={hasUnsavedChanges} isSaving={isSaving} onSave={onSave} />
            </div>
        </div>
    );
}