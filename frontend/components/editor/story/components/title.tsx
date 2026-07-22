// Import types
import { Fields } from "@puckeditor/core";
import { TitleComponentType } from "./types.tsx";

// Import fields
import { resolveTypographyStyles, typographyField } from "../fields/typography.tsx";
import { resolvePixelStyles, spacingField } from "../fields/spacing.tsx";

// Import icon
import { BookType } from "lucide-react";

// Title component fields
export const TitleComponentFields: Fields<TitleComponentType> = {
    title: {
        type: "text",
        label: "Title",
        labelIcon: <BookType size={16} />,
    },
    typography: typographyField,
    spacing: spacingField,
}

// Title component render
export function TitleComponent({ title, typography, spacing }: TitleComponentType) {
    return (
        <h2
        className="font-bold tracking-tight text-slate-950"
        style={{
            ...resolveTypographyStyles(typography),
            ...resolvePixelStyles(spacing),
        }}
        >
        {title}
        </h2>
    )
}