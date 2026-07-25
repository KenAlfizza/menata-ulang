// Import types
import { Fields } from "@puckeditor/core";
import { TextComponentType } from "./types.tsx";

// Import fields
import { resolveTypographyStyles, typographyField } from "../fields/typography.tsx";

// Import icon
import { Text } from "lucide-react";
import { marginField, resolveMarginStyles } from "../fields/margin.tsx";
import { colorPickerField, getColor } from "../fields/color.tsx";

// Text component fields
export const TextComponentFields: Fields<TextComponentType> = {
    text: {
        type: "textarea",
        label: "Text",
        labelIcon: <Text size={16} />,
        contentEditable: true,
    },
    typography: typographyField,
    color: colorPickerField,
    margin: marginField,
};

// Text component render
export function TextComponent({ text, typography, color, margin, }: TextComponentType) {
    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
            <div
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    color: getColor(color),
                    ...resolveTypographyStyles(typography),
                    ...resolveMarginStyles(margin),
                }}
            >
                {text}
            </div>
        </div>
    )
}