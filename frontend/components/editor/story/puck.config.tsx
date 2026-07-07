import { Config } from "@puckeditor/core";

/** Import components */
// Title component
import { TitleComponentType } from "./components/types.tsx";
import { TitleComponent, TitleComponentFields } from "./components/title.tsx";

// Text component
import { TextComponentType } from "./components/types.tsx";
import { TextComponent, TextComponentFields } from "./components/text.tsx";

// Image Component
import { ImageComponentType } from "./components/types.tsx";
import { ImageComponent, ImageComponentFields } from "./components/image.tsx";

// Flex Component
import { FlexComponentType } from "./components/types.tsx";
import { FlexComponent, FlexComponentFields } from "./components/flex.tsx";

// Grid Component
import { GridSlotType } from "./components/types.tsx";
import { GridSlotComponent, GridSlotFields } from "./components/grid-slot.tsx";

// Default fields metadata
import { defaultTypography, defaultTypographyHeader } from "./fields/typography.tsx";
import { defaultSpacing } from "./fields/spacing.tsx";
import { defaultSize } from "./fields/size.tsx";


export type EditStoryConfig = Config<{
    Title: TitleComponentType;
    Text: TextComponentType;
    Image: ImageComponentType;
    Flex: FlexComponentType;
    Grid: GridSlotType;
}>;

export const createPuckConfig = (): EditStoryConfig => {
    return {
        root: {
            fields: {
                Title: { type: "text" },
                Description: { type: "textarea" },
            },
            render: ({ children }) => {
                return children;
            },
        },

        components: {
            Title: {
                fields: TitleComponentFields,
                defaultProps: {
                    title: "My Story",
                    typography: { ...defaultTypographyHeader },
                    spacing: { ...defaultSpacing },
                },
                render: (props) => <TitleComponent {...props} />
            },
            Text: {
                fields: TextComponentFields,
                defaultProps: {
                    text: "This is a paragraph of text.",
                    typography: defaultTypography,
                    spacing: defaultSpacing,
                },
                render: (props) => <TextComponent {...props} />
            },
            Image: {
                fields: ImageComponentFields,
                defaultProps: {
                    resize: defaultSize,
                    spacing: defaultSpacing,
                    imageUpload: {
                        url: "",
                        alt: "Story Image"
                    }
                },
                render: (props) => <ImageComponent {...props} />,
            },
            Flex: {
                fields: FlexComponentFields,
                render: (props) => <FlexComponent {...props} />,
            },
            Grid: {
                label: "Grid",
                fields: GridSlotFields,
                defaultProps: { columns: 2, rows: 1, gap: 16, slot: [] },
                render: GridSlotComponent,
            },
        },
    };
};