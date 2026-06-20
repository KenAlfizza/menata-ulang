"use client";
import "@puckeditor/core/puck.css";

import { Puck, Config} from "@puckeditor/core";
import { ALargeSmall, Type, Move, TextCursor, BookType, Text } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Import components
import { TitleProps, TextProps, SlotProps, ImageComponentProps } from "@/components/story/edit/types";
// Import fields
import { spacingField, defaultSpacing, resolvePixelStyles } from "@/components/story/edit/fields/spacing";
import { typographyField, defaultTypography, defaultTypographyHeader, resolveTypographyStyles  } from "@/components/story/edit/fields/typography";


// Configuration 
type EditStoryConfig = Config<{
  Title: TitleProps;
  Text: TextProps;
  Slot: SlotProps;
  Image: ImageComponentProps;
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
        // Define 3 separate slots so columns 2 and 3 have unique targets
        col1: { type: "slot" },
        col2: { type: "slot" },
        col3: { type: "slot" },
        spacing: spacingField,
      },
      defaultProps: {
        columns: "1",
        spacing: defaultSpacing,
      },
      render: ({ col1: Col1, col2: Col2, col3: Col3, spacing, columns }) => {
        const totalCols = parseInt(columns || "1", 10);

        return (
          <div 
            style={{ 
              ...resolvePixelStyles(spacing),
              display: "grid",
              // Dynamically configure columns side-by-side using CSS Grid
              gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))`,
              gap: "24px",
              alignItems: "start" // Keeps heights separate and dynamic per component
            }}
            className="w-full min-h-[100px]"
          >
            {/* Column 1 is always visible */}
            <div className="min-h-[150px] border border-dashed border-slate-200/50 p-2 rounded">
              {Col1 ? <Col1 collisionAxis="dynamic" /> : null}
            </div>

            {/* Column 2 renders if 2 or more columns are selected */}
            {totalCols >= 2 && (
              <div className="min-h-[150px] border border-dashed border-slate-200/50 p-2 rounded">
                {Col2 ? <Col2 collisionAxis="dynamic" /> : null}
              </div>
            )}

            {/* Column 3 renders if 3 columns are selected */}
            {totalCols >= 3 && (
              <div className="min-h-[150px] border border-dashed border-slate-200/50 p-2 rounded">
                {Col3 ? <Col3 collisionAxis="dynamic" /> : null}
              </div>
            )}
          </div>
        );
      },
    },
    Image: {
      fields: {
        src: {
          type: "text",
          label: "Image URL",
          placeholder: "https://images.unsplash.com/...",
        },
        alt: { type: "text", label: "Alt Text" },
        
        // ==========================================
        // RESIZE CONTROLS
        // ==========================================
        height: {
          type: "custom",
          label: "Resize Height Ratio (%)",
          render: ({ value, onChange }) => (
            <div className="flex flex-col gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-2 border-b border-blue-100 pb-1">
                📐 Layout Resize Controls
              </div>
              <label className="text-xs text-slate-500 font-medium">Height Ratio</label>
              {/* Slider goes from 20% (panoramic banner) to 100% (tall square block) */}
              <input type="range" min="20" max="100" step="5" value={value || "50"} 
                     onChange={(e) => onChange(e.target.value)} className="w-full h-1 bg-slate-200 accent-blue-600 appearance-none cursor-pointer" />
              <span className="text-[10px] text-slate-500 text-right">{value || "50"}%</span>
            </div>
          )
        },
        width: {
          type: "custom",
          label: "Resize Width (%)",
          render: ({ value, onChange }) => (
            <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
              <label className="text-xs text-slate-500 font-medium">Width</label>
              <input type="range" min="20" max="100" step="5" value={value || "100"} 
                     onChange={(e) => onChange(e.target.value)} className="w-full h-1 bg-slate-200 accent-blue-600 appearance-none cursor-pointer" />
              <span className="text-[10px] text-slate-500 text-right">{value || "100"}%</span>
            </div>
          )
        },

        // ==========================================
        // CROP CONTROLS
        // ==========================================
        zoom: {
          type: "custom",
          label: "Crop Zoom Factor",
          render: ({ value, onChange }) => (
            <div className="flex flex-col gap-1 mt-3" onClick={(e) => e.stopPropagation()}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-2 border-b border-emerald-100 pb-1">
                ✂️ Inner Crop Controls
              </div>
              <label className="text-xs text-slate-500 font-medium">Zoom Factor</label>
              <input type="range" min="1" max="3" step="0.1" value={value || "1"} 
                     onChange={(e) => onChange(e.target.value)} className="w-full h-1 bg-slate-200 accent-emerald-600 appearance-none cursor-pointer" />
              <span className="text-[10px] text-slate-500 text-right">{value || "1.0"}x</span>
            </div>
          )
        },
        cropX: {
          type: "custom",
          label: "Crop Position X",
          render: ({ value, onChange }) => (
            <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
              <label className="text-xs text-slate-500 font-medium">Horizontal Shift (X)</label>
              <input type="range" min="0" max="100" step="1" value={value || "50"} 
                     onChange={(e) => onChange(e.target.value)} className="w-full h-1 bg-slate-200 accent-emerald-600 appearance-none cursor-pointer" />
              <span className="text-[10px] text-slate-500 text-right">{value || "50"}%</span>
            </div>
          )
        },
        cropY: {
          type: "custom",
          label: "Crop Position Y",
          render: ({ value, onChange }) => (
            <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
              <label className="text-xs text-slate-500 font-medium">Vertical Shift (Y)</label>
              <input type="range" min="0" max="100" step="1" value={value || "50"} 
                     onChange={(e) => onChange(e.target.value)} className="w-full h-1 bg-slate-200 accent-emerald-600 appearance-none cursor-pointer" />
              <span className="text-[10px] text-slate-500 text-right">{value || "50"}%</span>
            </div>
          )
        },
        spacing: spacingField,
      },
      defaultProps: {
        src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000",
        alt: "Story Image",
        height: "50", // 50% height ratio looks like a standard landscape image
        width: "100",
        zoom: "1",
        cropX: "50",
        cropY: "50",
        spacing: defaultSpacing,
      },
      render: ({ src, alt, width, height, zoom, cropX, cropY, spacing }) => {
        const numWidth = width || "100";
        const pctHeight = height || "50";
        const numZoom = zoom || "1";
        const posX = cropX || "50";
        const posY = cropY || "50";

        return (
          // OUTSIDE WRAPPER: Flex layout forces the child frame to stay perfectly dead-center
          <div className="w-full flex justify-center items-center">
            <div 
              style={{ 
                ...resolvePixelStyles(spacing),
                width: `${numWidth}%`,
                // We use aspect ratio (Width / Height percentage) to keep height percentage fluid!
                aspectRatio: `${numWidth} / ${pctHeight}`,
                marginLeft: "auto",
                marginRight: "auto"
              }} 
              className="relative overflow-hidden rounded-lg bg-slate-100 transition-all block"
            >
              {src ? (
                <img
                  src={src}
                  alt={alt || "Story image"}
                  className="w-full h-full object-cover transition-transform duration-75 origin-center"
                  style={{
                    transform: `scale(${numZoom})`,
                    objectPosition: `${posX}% ${posY}%`
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 bg-slate-100 border border-dashed border-slate-300 rounded-lg p-4">
                  No image source provided.
                </div>
              )}
            </div>
          </div>
        );
      },
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