import { FlexComponentType } from "./types.tsx"; 

// Import fields
import { Fields } from "@puckeditor/core";
import { spacingField } from "../fields/spacing.tsx";

export const justifyOptions = [
    { label: "Start", value: "flex-start" },
    { label: "Center", value: "center" },
    { label: "End", value: "flex-end" },
    { label: "Space Between", value: "space-between" },
    { label: "Space Around", value: "space-around" },
    { label: "Space Evenly", value: "space-evenly" },
] as const;

/** Flex component fields */
export const FlexComponentFields: Fields<FlexComponentType> = {
    direction: {
        type: "select",
        label: "Direction",
        options: [
        { label: "Row", value: "row" },
        { label: "Column", value: "column" },
        ],
    },
    spacing: spacingField,
    slot: { type: "slot" },
    justify: {
        label: "Justify",
        type: "select",
        options: justifyOptions,
    },
}

/** Flex component render */
export function FlexComponent({ direction, justify, slot: Slot }: FlexComponentType) {
    return (
        <Slot
            style={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: direction,

                justifyContent: justify,

                width: "100%",
                minWidth: "64px",
                minHeight: "100px",
            }}
        />
    );
}
    