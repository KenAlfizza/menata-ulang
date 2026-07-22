// Import types
import { Fields } from "@puckeditor/core";
import { TextComponentType } from "./types.tsx";

// Import fields
import { resolveTypographyStyles, typographyField } from "../fields/typography.tsx";
import { resolvePixelStyles, spacingField } from "../fields/spacing.tsx";

// Import icon
import { Text } from "lucide-react";

// Text component fields
export const TextComponentFields: Fields<TextComponentType> = {
    text: {
        type: "textarea",
        label: "Text",
        labelIcon: <Text size={16} />,
        contentEditable: true,
    },
    typography: typographyField,
    spacing: spacingField,
};

// Text component render
export function TextComponent({ text, typography, spacing }: TextComponentType) {
    return (
        <div
            style={{
                ...resolveTypographyStyles(typography),
                ...resolvePixelStyles(spacing),
            }}
            >
            {text}
        </div>
    )
}