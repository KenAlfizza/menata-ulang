"use client";
import "@puckeditor/core/puck.css";

import { Puck, Config} from "@puckeditor/core";
import { ALargeSmall, Type, Move, TextCursor, BookType, Text } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Import components
import { TitleProps, TextProps } from "@/components/story/edit/types.tsx";
// Import fields
import { spacingField, defaultSpacing, resolvePixelStyles } from "@/components/story/edit/fields/spacing.tsx";
import { typographyField, defaultTypography, defaultTypographyHeader, resolveTypographyStyles  } from "@/components/story/edit/fields/typography.tsx";


// Configuration 
type EditStoryConfig = Config<{
  Title: TitleProps;
  Text: TextProps;
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
  },
};

const initialData = { content: [], root: {} };
const save = (_data: unknown) => {};

// Page Component

export default function StoryEditPage() {
  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden bg-[#1A1A2E]">
        
        {/* Editor body */}
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