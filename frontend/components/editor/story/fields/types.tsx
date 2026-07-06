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

export interface Size {
    height: string;
    width: string;
    borderRadius: {
        tl: string;
        tr: string;
        br: string;
        bl: string;
    }
}

export interface Crop {
    zoom: string;   
    cropX: string;  
    cropY: string;  
}

export interface Color {
  mode: "solid" | "gradient";
  hex: string;
  opacity: string;
}

// Strictly-typed Puck Custom Field interface
export type SpacingCustomField = CustomField<Spacing>;
export type TypographyCustomField = CustomField<Typography>;
export type SizeCustomField = CustomField<Size>;
export type CropCustomField = CustomField<Crop>;
export type ColorCustomField = CustomField<Color>;