import { ReactNode, ComponentType } from "react";
import { Typography, Spacing } from "./fields/types";

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

export interface ImageComponentProps {
    src: string;
    alt: string;
    width: string;       // Resize width (%)
    height: string;      // Resize height ratio (%)
    zoom: string;        // Crop zoom
    cropX: string;       // Crop X
    cropY: string;       // Crop Y
    spacing: Spacing;
}