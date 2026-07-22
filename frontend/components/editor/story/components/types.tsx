import { ReactNode } from "react";
import { Typography, Spacing, Size, ImageUpload } from "../fields/types.tsx";
import { Slot } from "@puckeditor/core";

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

export interface ImageComponentType {
    resize: Size;        
    spacing: Spacing;
    imageUpload: ImageUpload;
}

export interface FlexComponentType {
    direction: "row" | "column";
    justify: string;
    spacing: Spacing;
    slot: Slot;
}

export interface GridSlotType {
  columns: number;
  rows: number;
  gap: number;
  slot: Slot;
}