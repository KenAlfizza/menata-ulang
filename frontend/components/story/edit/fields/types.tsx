import { CustomField } from "@puckeditor/core";

// Custom field's data state
export interface Spacing {
    all: string;
    top: string;
    bottom: string;
    left: string;
    right: string;
}

export interface Typography {
    family: string;
    size: string;
    align: "left" | "center" | "right" | "justify";
    bold: boolean;
    italic: boolean;
    underline: boolean;

}

// Strictly-typed Puck Custom Field interface
export type SpacingCustomField = CustomField<Spacing>;
export type TypographyCustomField = CustomField<Typography>;