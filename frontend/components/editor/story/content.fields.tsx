import { Fields } from "@puckeditor/core";

import { BookType, Text } from "lucide-react";
import { spacingField } from "@/components/story/edit/fields/spacing";
import { typographyField } from "@/components/story/edit/fields/typography";
import { resizeField } from "@/components/story/edit/fields/size";
import { cropField } from "@/components/story/edit/fields/crop";
import { justifyOptions } from "@/components/story/edit/components/flexComponent.tsx";

import { FlexContainerProps, ImageProps, SlotProps, TextProps, TitleProps } from "@/components/story/edit/types.tsx";

export const contentFields: {
    Title: Fields<TitleProps>;
    Text: Fields<TextProps>;
    Slot: Fields<SlotProps>;
    Image: Fields<ImageProps>;
    Container: Fields<FlexContainerProps>;
    } = {
    Title: {
        title: {
            type: "text",
            label: "Title",
            labelIcon: <BookType size={16} />,
        },
        typography: typographyField,
        spacing: spacingField,
    },

    Text: {
        text: {
            type: "textarea",
            label: "Text",
            labelIcon: <Text size={16} />,
            contentEditable: true,
        },
        typography: typographyField,
        spacing: spacingField,
    },

    Slot: {
        columns: {
        type: "select",
        label: "Grid Columns",
        options: [
            { label: "1 Column", value: "1" },
            { label: "2 Columns", value: "2" },
            { label: "3 Columns", value: "3" },
        ],
        },
        col1: { type: "slot" },
        col2: { type: "slot" },
        col3: { type: "slot" },
        spacing: spacingField,
    },

    Image: {
        src: { type: "text", label: "Image URL" },
        alt: { type: "text", label: "Alt Text" },
        resize: resizeField,
        crop: cropField,
        spacing: spacingField,
    },

    Container: {
        direction: {
            type: "select",
            label: "Direction",
            options: [
            { label: "Row", value: "row" },
            { label: "Column", value: "column" },
            ],
        },
        spacing: spacingField,
        slot: { type: "slot" },
        justify: {
            label: "Justify",
            type: "select",
            options: justifyOptions,
        },
    }
}