import { Config, Fields } from "@puckeditor/core";
import { BookType, Text } from "lucide-react";

// Import components props
import { TitleProps, TextProps, SlotProps, ImageProps, FlexContainerProps } from "@/components/story/edit/types";
import { SlotComponent } from "@/components/story/edit/components/slotComponent";

// Import components renders
import { ImageComponent } from "@/components/story/edit/components/imageComponent";
import { FlexComponent } from "@/components/story/edit/components/flexComponent";

// Import fields
import { defaultSpacing, resolvePixelStyles } from "@/components/story/edit/fields/spacing";
import { defaultTypography, defaultTypographyHeader, resolveTypographyStyles } from "@/components/story/edit/fields/typography";
import { defaultSize } from "@/components/story/edit/fields/size";
import { defaultCrop } from "@/components/story/edit/fields/crop";

// Import fields
import { contentFields } from "./fields/content.fields.tsx";

export type EditStoryConfig = Config<{
  Title: TitleProps;
  Text: TextProps;
  Slot: SlotProps;
  Image: ImageProps;
  Container: FlexContainerProps;
}>;

export const createPuckConfig = (): EditStoryConfig => {
  return {
    components: {
      Title: {
        fields: contentFields.Title,
        defaultProps: {
          title: "My Story",
          typography: { ...defaultTypographyHeader },
          spacing: { ...defaultSpacing },
        },
        render: ({ title, typography, spacing }) => (
          <h2
            className="font-bold tracking-tight text-slate-950"
            style={{
              ...resolveTypographyStyles(typography),
              ...resolvePixelStyles(spacing),
            }}
          >
            {title}
          </h2>
        ),
      },
      Text: {
        fields: contentFields.Text,
        defaultProps: {
          text: "This is a paragraph of text.",
          typography: defaultTypography,
          spacing: defaultSpacing,
        },
        render: ({ text, typography, spacing }) => (
          <div
            style={{
              ...resolveTypographyStyles(typography),
              ...resolvePixelStyles(spacing),
            }}
          >
            {text}
          </div>
        ),
      },
      Slot: {
        fields: contentFields.Slot,
        defaultProps: {
          columns: "1",
          spacing: defaultSpacing,
        },
        render: (props) => <SlotComponent {...props} />,
      },
      Image: {
        fields: contentFields.Image,
        defaultProps: {
          src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000",
          alt: "Story Image",
          resize: defaultSize,
          crop: defaultCrop,
          spacing: defaultSpacing,
        },
        render: (props) => <ImageComponent {...props} />,
      },
      Container: {
        fields: contentFields.Container,
        render: (props) => <FlexComponent {...props} />,
      },
    },
  };
};