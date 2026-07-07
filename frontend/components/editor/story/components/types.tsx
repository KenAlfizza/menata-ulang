import { ReactNode } from "react";
import { Typography, Spacing, Size, Crop } from "../fields/types.tsx";
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
    src: string;
    alt: string;
    resize: Size;        
    spacing: Spacing;
    crop: Crop; // Updated to match object interface
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