import { CustomField } from "@puckeditor/core";
import { Typography, Spacing } from "./fields/types.tsx";

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

export type SpacingCustomField = CustomField<Spacing>;