"use client";
import "@puckeditor/core/puck.css";

import { Puck, Config } from "@puckeditor/core";
import { BookType, Text, Ruler } from "lucide-react";

import Image from "next/image";
import Link from "next/link";

// Import components
import { TitleProps, TextProps, SlotProps, ImageProps, FlexContainerProps } from "@/components/story/edit/types";

import { SlotComponent } from "@/components/story/edit/components/slotComponent";

// Import fields
import { spacingField, defaultSpacing, resolvePixelStyles } from "@/components/story/edit/fields/spacing";
import { typographyField, defaultTypography, defaultTypographyHeader, resolveTypographyStyles  } from "@/components/story/edit/fields/typography";
import { resizeField, defaultSize } from "@/components/story/edit/fields/size";
import { cropField, defaultCrop } from "@/components/story/edit/fields/crop";

// Import Components
import { ImageComponent } from "@/components/story/edit/components/imageComponent";
import { FlexComponent, justifyOptions } from "@/components/story/edit/components/flexComponent";

// Configuration 
type EditStoryConfig = Config<{
  Title: TitleProps;
  Text: TextProps;
  Slot: SlotProps;
  Image: ImageProps;
  Container: FlexContainerProps;
}>;

// Puck Config
const config: EditStoryConfig = {
  components: {
    Title: {
        fields: {
            title: { 
                type: "text",
                label: "Title",
                labelIcon: <BookType size={16}/>, 
            },
            typography: typographyField,
            spacing: spacingField, 
        },
        defaultProps: {
            title: "My Story",
            typography: { ...defaultTypographyHeader },
            spacing: { ...defaultSpacing },
        },
        render: ({ title, typography, spacing }) => {
            return (
              <h2
                  className="font-bold tracking-tight text-slate-950"
                  style={{ 
                    ...resolveTypographyStyles(typography),
                    ...resolvePixelStyles(spacing) 
                  }}
              >
                  {title}
              </h2>
            )
        },
    },
    Text: {
      fields: {
        text: { 
            type: "textarea",
            label: "Text",
            labelIcon: <Text size={16}/>,
            contentEditable: true,
        },
        typography: typographyField,
        spacing: spacingField,
      },
      defaultProps: {
        text:    "This is a paragraph of text.",
        typography: defaultTypography,
        spacing: defaultSpacing,
      },
      render: ({ text, typography, spacing }) => (
        <div style={{
            ...resolveTypographyStyles(typography),
            ...resolvePixelStyles(spacing)
        }}>{text}</div>
      ),
    },
    Slot: {
      fields: {
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
      defaultProps: {
        columns: "1",
        spacing: defaultSpacing,
      },
      render: (props) => <SlotComponent {...props} />,
    },
    Image: {
        fields: {
            src: { type: "text", label: "Image URL" },
            alt: { type: "text", label: "Alt Text" },
            resize: resizeField,
            crop: cropField,
            spacing: spacingField,
        },
        defaultProps: {
            src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000",
            alt: "Story Image",
            resize: defaultSize,
            crop: defaultCrop,
            spacing: defaultSpacing,
        },
        render: (props) => <ImageComponent {...props}/>
    },
    Container: {
        fields: {
            direction: {
                type: "select",
                label: "Direction",
                options: [
                    { label: "Row", value: "row" },
                    { label: "Column", value: "column" },
                ],
            },
            spacing: spacingField,
            slot: {
                type: "slot",
            },
            justify: {
                label: "Justify",
                type: "select",
                options: justifyOptions,
            },

        },
        render: (props) => <FlexComponent {...props} />
    },
  },
}

const initialData = { content: [], root: { props: {title: "New Page"}} };
const save = (_data: unknown) => {};

export default function StoryEditPage() {

    return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-[#1A1A2E]">
        <Puck config={config} data={initialData} onPublish={save} 
            overrides={{
                puck: ({ children }) => (
                <div 
                    style={{ 
                    height: "100%",
                    maxHeight: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    background: "#FFB7C3"
                    }}
                >
                    {children}
                </div>
                ),
                header: ({ children }) => (
                <div className="bg-[#FFB7C3] p-3 flex justify-between items-center text-slate-800 border-b border-slate-200/20">
                    <div className="w-full flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/logo-text.svg"
                                alt="Menata Ulang Logo"
                                width={128}
                                height={128}
                                priority
                                className="w-auto h-8 brightness-0"
                            />
                        </Link>
                        <h1 className="font-bold text-lg">Story Editor</h1>
                    </div>
                    </div>
                )
            }}
        />
    </div>
  );
}