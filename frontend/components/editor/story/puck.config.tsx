import { Config } from "@puckeditor/core";

/** Import components */
// Root component
import { RootComponentType } from "../components/types.tsx";
import { RootComponent, RootComponentFields } from "../components/root.tsx";

// Title component
import { TitleComponentType } from "../components/types.tsx";
import { TitleComponent, TitleComponentFields } from "../components/title.tsx";

// Text component
import { TextComponentType } from "../components/types.tsx";
import { TextComponent, TextComponentFields } from "../components/text.tsx";

// Image Component
import { ImageComponentType } from "../components/types.tsx";
import { ImageComponent, createImageComponentFields } from "../components/image.tsx";

// Flex Component
import { FlexComponentType } from "../components/types.tsx";
import { FlexComponent, FlexComponentFields } from "../components/flex.tsx";

// Grid Component
import { GridSlotType } from "../components/types.tsx";
import { GridSlotComponent, GridSlotFields } from "../components/grid-slot.tsx";

// Default fields metadata
import { defaultTypography, defaultTypographyHeader } from "../fields/typography.tsx";
import { defaultPadding } from "../fields/padding.tsx";
import { defaultSize } from "../fields/size.tsx";
import { defaultColor, defaultColorText } from "../fields/color.tsx";
import { defaultMargin } from "../fields/margin.tsx";


export type EditStoryConfig = Config<{
    Title: TitleComponentType;
    Text: TextComponentType;
    Image: ImageComponentType;
    Flex: FlexComponentType;
    Grid: GridSlotType;
}, RootComponentType>;

export const createPuckConfig = (accessToken: string): EditStoryConfig => {
    return {
        root: {
            fields: RootComponentFields,
            defaultProps: {
                padding: { ...defaultPadding },
                color: { ...defaultColor },
            },
            render: (props) => <RootComponent {...props} />
        },

        components: {
            Title: {
                fields: TitleComponentFields,
                defaultProps: {
                    title: "My Story",
                    typography: { ...defaultTypographyHeader },
                    color: { ...defaultColorText },
                    margin: { ...defaultMargin },
                },
                render: (props) => <TitleComponent {...props} />
            },
            Text: {
                fields: TextComponentFields,
                defaultProps: {
                    text: "This is a paragraph of text.",
                    typography: defaultTypography,
                    color: { ...defaultColorText },
                    margin: { ...defaultMargin },
                },
                render: (props) => <TextComponent {...props} />
            },
            Image: {
                fields: createImageComponentFields(accessToken),
                defaultProps: {
                    resize: defaultSize,
                    margin: { ...defaultMargin },
                    imageUpload: {
                        url: "",
                        alt: "Story Image"
                    }
                },
                render: (props) => <ImageComponent {...props} />,
            },
            Flex: {
                fields: FlexComponentFields,
                defaultProps: {
                    direction: "row",
                    justify: "flex-start",
                    margin: { ...defaultMargin },
                    padding: { ...defaultPadding },
                    color: { ...defaultColor },
                    slot: [],
                },
                render: (props) => <FlexComponent {...props} />,
            },
            Grid: {
                label: "Grid",
                fields: GridSlotFields,
                defaultProps: { 
                    columns: 2, 
                    rows: 1, 
                    gap: 16, 
                    slot: [], 
                    color: { ...defaultColor }, 
                    margin: { ...defaultMargin },
                    padding: { ...defaultPadding },
                },
                render: GridSlotComponent,
            },
        },
    };
};
