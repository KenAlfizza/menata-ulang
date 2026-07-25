import { Fields, ComponentConfig } from "@puckeditor/core";
import { GridSlotType } from "./types.tsx";
import { colorPickerField, getBackgroundColor } from "../fields/color.tsx";
import { paddingField, resolvePaddingStyles } from "../fields/padding.tsx";
import { marginField, resolveMarginStyles } from "../fields/margin.tsx";

export const GridSlotFields: Fields<GridSlotType> = {
    columns: { type: "number", label: "Columns", min: 1 },
    rows: { type: "number", label: "Rows", min: 1 },
    gap: { type: "number", label: "Gap (px)" },
    slot: { type: "slot" },
    color: colorPickerField,
    padding: paddingField,
    margin: marginField,
};

export const GridSlotComponent: ComponentConfig<GridSlotType>["render"] = ({
    columns = 1,
    rows = 1,
    gap = 16,
    slot: SlotContent,
    color,
    padding,
    margin,
}) => {
    return (
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <SlotContent
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(80px, auto))`,
                    gap: `${gap}px`,
                    width: "100%",
                    boxSizing: "border-box",
                    minBlockSize: "128px",
                    minInlineSize: "128px",
                    backgroundColor: getBackgroundColor(color),
                    ...resolveMarginStyles(margin),
                    ...resolvePaddingStyles(padding),
                }}
                minEmptyHeight={80}
            />
        </div>
    );
};