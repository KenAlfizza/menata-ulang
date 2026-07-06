import type { SlotComponentType } from "./types.tsx";

import { Fields } from "@puckeditor/core";
import { resolvePixelStyles } from "../fields/spacing.tsx";
import { spacingField } from "../fields/spacing.tsx";

/** Slot component fields */
export const SlotComponentFields: Fields<SlotComponentType> = {
    columns: {
        type: "select",
        label: "Grid Columns",
        options: [
            { label: "1 Column", value: "1" },
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" },
        ],
    },
    col1: { type: "slot" },
    col2: { type: "slot" },
    col3: { type: "slot" },
    spacing: spacingField,
}

/** Slot component renders */
export function SlotComponent({ col1: Col1, col2: Col2, col3: Col3, spacing, columns }: SlotComponentType) {
    const totalCols = parseInt(columns || "1", 10);

    return (
        <div
            style={{
                ...resolvePixelStyles(spacing),
                display: "grid",
                gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))`,
                gap: "24px",
                alignItems: "start",
            }}
            className="w-full min-h-[100px]"
        >
            <div className="min-h-[150px] border border-dashed border-slate-200/50 p-2 rounded">
                {Col1 ? <Col1 collisionAxis="dynamic" /> : null}
            </div>

            {totalCols >= 2 && (
                <div className="min-h-[150px] border border-dashed border-slate-200/50 p-2 rounded">
                    {Col2 ? <Col2 collisionAxis="dynamic" /> : null}
                </div>
            )}

            {totalCols >= 3 && (
                <div className="min-h-[150px] border border-dashed border-slate-200/50 p-2 rounded">
                    {Col3 ? <Col3 collisionAxis="dynamic" /> : null}
                </div>
            )}

            {totalCols >= 4 && (
                <div className="min-h-[150px] border border-dashed border-slate-200/50 p-2 rounded">
                    {/* col4 slot if you add it later */}
                </div>
            )}
        </div>
    );
}