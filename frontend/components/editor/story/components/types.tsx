import { Typography, Spacing, Size, Crop } from "../fields/types";

export interface TitleComponentType {
    // Content Fields
    title: string;
    spacing: Spacing;
    typography: Typography;

    // Animation Fields
    clickAction?: string;
    hoverAction?: string;
}

export interface TextComponentType {
    text: string;
    spacing: Spacing;
    typography: Typography;
}

export interface SlotComponentType {
    spacing: Spacing;
    columns: "1" | "2" | "3" | "4";
    col1?: React.ComponentType<{ collisionAxis?: string }>;
    col2?: React.ComponentType<{ collisionAxis?: string }>;
    col3?: React.ComponentType<{ collisionAxis?: string }>;
    content?: React.ComponentType<{ collisionAxis?: string }>;
}

export interface ImageComponentType {
    src: string;
    alt: string;
    resize: Size;        // Size interface
    crop: Crop;
    spacing: Spacing;
}

export interface FlexComponentType {
    direction: "row" | "column";
    justify: string;
    spacing: Spacing;
    slot: React.ElementType;
}