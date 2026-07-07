import { Fields, ComponentConfig } from "@puckeditor/core";
import { GridSlotType } from "./types.tsx";

export const GridSlotFields: Fields<GridSlotType> = {
    columns: { type: "number", label: "Columns", min: 1 },
    rows: { type: "number", label: "Rows", min: 1 },
    gap: { type: "number", label: "Gap (px)" },
    slot: { type: "slot" },
};

export const GridSlotComponent: ComponentConfig<GridSlotType>["render"] = ({
    columns = 1,
    rows = 1,
    gap = 16,
    slot: SlotContent,
}) => {
    return (
        <SlotContent
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(80px, auto))`,
                gap: `${gap}px`,
                width: "100%",
            }}
            minEmptyHeight={80}
        />
    );
};