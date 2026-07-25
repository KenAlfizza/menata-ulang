// Import types
import { Fields } from "@puckeditor/core";
import { TitleComponentType } from "./types.tsx";

// Import fields
import { resolveTypographyStyles, typographyField } from "../fields/typography.tsx";

// Import icon
import { BookType } from "lucide-react";
import { marginField, resolveMarginStyles } from "../fields/margin.tsx";
import { paddingField, resolvePaddingStyles } from "../fields/padding.tsx";

// Title component fields
export const TitleComponentFields: Fields<TitleComponentType> = {
    title: {
        type: "text",
        label: "Title",
        labelIcon: <BookType size={16} />,
    },
    typography: typographyField,
    margin: marginField,
}

// Title component render
export function TitleComponent({ title, typography, margin }: TitleComponentType) {
    return (
        <div style={{ 
            width: "100%", 
            display: "flex", 
            flexDirection: "column",
        }}>
            <h2
                className="font-bold tracking-tight text-slate-950"
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    ...resolveTypographyStyles(typography),
                    ...resolveMarginStyles(margin),
                }}
            >
                {title}
            </h2>
        </div>
    );
}