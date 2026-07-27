"use client";
import { createUsePuck } from "@puckeditor/core";
import { Redo2, Undo2 } from "lucide-react";
import { Button } from "../../ui/button.tsx";

const usePuck = createUsePuck();

export function HistoryControls() {
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
                className="text-zinc-500 bg-zinc-100 h-8 w-8 flex items-center justify-center rounded-md transition disabled:cursor-not-allowed hover:bg-zinc-200"
            >
                <Undo2 size={16} />
            </Button>
            <Button
                onClick={forward}
                disabled={!hasFuture}
                aria-label="Redo"
                className="text-zinc-500 bg-zinc-100 h-8 w-8 flex items-center justify-center rounded-md transition disabled:cursor-not-allowed hover:bg-zinc-200"
            >
                <Redo2 size={16} />
            </Button>
        </div>
    );
}