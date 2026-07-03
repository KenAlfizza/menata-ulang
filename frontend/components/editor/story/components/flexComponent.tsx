import { FlexContainerProps } from "../types";

export const justifyOptions = [
    { label: "Start", value: "flex-start" },
    { label: "Center", value: "center" },
    { label: "End", value: "flex-end" },
    { label: "Space Between", value: "space-between" },
    { label: "Space Around", value: "space-around" },
    { label: "Space Evenly", value: "space-evenly" },
] as const;


export function FlexComponent({ direction, justify, slot: Slot }: FlexContainerProps) {
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