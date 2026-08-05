import { FlexComponentType } from "./types.tsx"; 

// Import fields
import { ComponentConfig, Fields } from "@puckeditor/core";
import { colorPickerField, getColor } from "../fields/color.tsx";
import { marginField, resolveMarginStyles } from "../fields/margin.tsx";
import { paddingField, resolvePaddingStyles } from "../fields/padding.tsx";

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
    justify: {
        label: "Justify",
        type: "select",
        options: justifyOptions,
    },
    margin: marginField,
    padding: paddingField,
    slot: { type: "slot" },
    color: colorPickerField
}

/** Flex component render */
export const FlexComponent: ComponentConfig<FlexComponentType>["render"] = ({
  direction = "row",
  justify = "flex-start",
  margin,
  padding,
  slot: Slot,
  color,
}) => {
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Slot
        style={{
          display: "flex",
          flexWrap: "wrap",
          flexDirection: direction,
          justifyContent: justify,
          width: "100%",
          boxSizing: "border-box",
          minWidth: "64px",
          minHeight: "100px",
          backgroundColor: getColor(color),
          ...resolveMarginStyles(margin),
          ...resolvePaddingStyles(padding),
        }}
      />
    </div>
  );
};