import { Config } from "@puckeditor/core";

/** Import components */
// Title component
import { TitleComponentType } from "./components/types.tsx";
import { TitleComponent, TitleComponentFields } from "./components/title.tsx";

// Text component
import { TextComponentType } from "./components/types.tsx";
import { TextComponent, TextComponentFields } from "./components/text.tsx";

// Slot component
import { SlotComponentType } from "./components/types.tsx"
import { SlotComponent, SlotComponentFields } from "./components/slot.tsx";

// Image Component
import { ImageComponentType } from "./components/types.tsx";
import { ImageComponent, ImageComponentFields } from "./components/image.tsx";


// Flex Component
import { FlexComponentType } from "./components/types.tsx";
import { FlexComponent, FlexComponentFields } from "./components/flex.tsx";
import { defaultTypography, defaultTypographyHeader } from "./fields/typography.tsx";
import { defaultSpacing } from "./fields/spacing.tsx";
import { defaultSize } from "./fields/size.tsx";
import { defaultCrop } from "./fields/crop.tsx";

export type EditStoryConfig = Config<{
  Title: TitleComponentType;
  Text: TextComponentType;
  Slot: SlotComponentType;
  Image: ImageComponentType;
  Flex: FlexComponentType;
}>;

export const createPuckConfig = (): EditStoryConfig => {
  return {
    root: {
        fields: {
            Title: {type: "text"},
            Description: {type: "textarea"},
        },
        render: ({ children }) => {
            return children
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
      Slot: {
        fields: SlotComponentFields,
        defaultProps: {
          columns: "1",
          spacing: defaultSpacing,
        },
        render: (props) => <SlotComponent {...props} />,
      },
      Image: {
        fields: ImageComponentFields,
        defaultProps: {
          src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000",
          alt: "Story Image",
          resize: defaultSize,
          crop: defaultCrop,
          spacing: defaultSpacing,
        },
        render: (props) => <ImageComponent {...props} />,
      },
      Flex: {
        fields: FlexComponentFields,
        render: (props) => <FlexComponent {...props} />,
      },
    },
  };
};