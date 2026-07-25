import { ReactNode } from "react";
import { Typography, Size, ImageUpload, Color, Margin, Padding} from "../fields/types.tsx";
import { Slot } from "@puckeditor/core";

/**
 * Component type definitions containing the corresponding field types
 */
export interface TitleComponentType {
    // Content Fields
    title: string;
    typography: Typography;
    margin: Margin;

    // Animation Fields
    clickAction?: string;
    hoverAction?: string;
}

export interface TextComponentType {
    text: string;
    margin: Margin;
    typography: Typography;
}

export interface ImageComponentType {
    resize: Size;        
    margin: Margin;
    imageUpload: ImageUpload;
}

export interface FlexComponentType {
    direction: "row" | "column";
    justify: string;
    margin: Margin;
    padding: Padding;
    slot: Slot;
    color: Color;
}

export interface GridSlotType {
    margin: Margin;
    padding: Padding;
    columns: number;
    rows: number;
    gap: number;
    slot: Slot;
    color: Color;
}

/**
 * Root component type definition containing the corresponding field types
 */
export interface RootComponentType {
    padding: Padding;
    color: Color;
    children?: ReactNode;
}