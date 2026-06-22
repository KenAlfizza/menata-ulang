import { ReactNode, ComponentType } from "react";
import { Typography, Spacing, Size, Crop } from "./fields/types";
import { Slot } from "@puckeditor/core";

export interface TitleProps {
    title: string;
    spacing: Spacing;
    typography: Typography;
}

export interface TextProps {
    text: string;
    spacing: Spacing;
    typography: Typography;
}

export interface SlotProps {
    spacing: Spacing;
    columns: "1" | "2" | "3" | "4";
    col1?: React.ComponentType<{ collisionAxis?: string }>;
    col2?: React.ComponentType<{ collisionAxis?: string }>;
    col3?: React.ComponentType<{ collisionAxis?: string }>;
    content?: React.ComponentType<{ collisionAxis?: string }>;
}

export interface ImageProps {
    src: string;
    alt: string;
    resize: Size;        // Size interface
    crop: Crop;
    spacing: Spacing;
}

export interface FlexContainerProps {
    direction: "row" | "column";
    spacing: Spacing;
    slot: React.ElementType;
}