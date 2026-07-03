// fields.tsx
import React from "react";
import { FieldLabel } from "@puckeditor/core";
import { Typography, TypographyCustomField } from "./types.tsx";

// Import UI Icons
import { 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Bold,
  Italic,
  Underline
} from "lucide-react";

// Typography Resolver
export function resolveTypographyStyles(typography: Typography): React.CSSProperties {
  return {
    fontFamily: typography?.family,
    fontSize: typography?.size,
    textAlign: typography?.align || "left",
    fontWeight: typography?.bold ? "bold" : "normal",
    fontStyle: typography?.italic ? "italic" : "normal",
    textDecoration: typography?.underline ? "underline" : "none",
  };
}

// Font size option
export const fontSizeOptions = Array.from({ length: (96 - 4) / 4 + 1 }, (_, i) => {
    const size = 4 + i * 4;
    return { label: `${size}px`, value: `${size}px` };
});

// Font family option
export const fontFamilyOptions = [
    { label: "REM", value: "var(--font-rem), sans-serif" },
    { label: "Sans Serif", value: "ui-sans-serif, system-ui, sans-serif" },
    { label: "Serif", value: "ui-serif, Georgia, serif" },
    { label: "Mono", value: "ui-monospace, SFMono-Regular, monospace" },
    { label: "Playfair Display", value: "'Playfair Display', serif" },
];

export const defaultTypographyHeader: Typography = {
    family: "var(--font-rem), sans-serif", 
    size: "48px", 
    align: "left",
    bold: true,
    italic: false,
    underline: false,
};

export const defaultTypography: Typography = {
    family: "var(--font-rem), sans-serif", 
    size: "16px", 
    align: "left",
    bold: false,
    italic: false,
    underline: false,
};

// Typography Custom Field
export const typographyField: TypographyCustomField = {
    type: "custom",
    label: "Typography",
    render: ({ value, onChange }) => {
        const currentFont = value || defaultTypography;
        const isBoldActive = !!currentFont.bold;
        const isItalicActive = !!currentFont.italic;
        const isUnderlineActive = !!currentFont.underline;

        // Alignment Options Mapping
        const alignments: { value: Typography["align"]; icon: React.ReactNode }[] = [
            { value: "left", icon: <AlignLeft size={14} /> },
            { value: "center", icon: <AlignCenter size={14} /> },
            { value: "right", icon: <AlignRight size={14} /> },
            { value: "justify", icon: <AlignJustify size={14} /> },
        ];

        return (
            <FieldLabel label="Typography" icon={<Type size={16}/>}>
                <div className="flex flex-col gap-2 w-full mt-1">
                    {/* Top Row: Font Family and Size Selectors */}
                    <div className="flex items-center gap-2 w-full p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <select
                            value={currentFont.family}
                            onChange={(e) => onChange({ ...currentFont, family: e.target.value })}
                            className="w-2/3 h-8 px-2 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {fontFamilyOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        <select
                            value={currentFont.size}
                            onChange={(e) => onChange({ ...currentFont, size: e.target.value })}
                            className="w-1/3 h-8 px-2 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {fontSizeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Bottom Row: Inline Layout Style Actions Control Bar */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 w-full">
                        
                        {/* Style Modification Sub-Group */}
                        <div className="flex items-center gap-0.5">
                            {/* Bold */}
                            <button
                                type="button"
                                onClick={() => onChange({ ...currentFont, bold: !isBoldActive })}
                                className={`flex items-center justify-center w-7 h-7 rounded transition-all ${
                                    isBoldActive 
                                    ? "bg-white text-blue-600 shadow-sm border border-slate-200 font-bold" 
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                }`}
                                title="Bold Text"
                            >
                                <Bold size={14} strokeWidth={isBoldActive ? 3 : 2} />
                            </button>

                            {/* Italic */}
                            <button
                                type="button"
                                onClick={() => onChange({ ...currentFont, italic: !isItalicActive })}
                                className={`flex items-center justify-center w-7 h-7 rounded transition-all ${
                                    isItalicActive 
                                    ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                }`}
                                title="Italic Text"
                            >
                                <Italic size={14} strokeWidth={isItalicActive ? 3 : 2} />
                            </button>

                            {/* Underline */}
                            <button
                                type="button"
                                onClick={() => onChange({ ...currentFont, underline: !isUnderlineActive })}
                                className={`flex items-center justify-center w-7 h-7 rounded transition-all ${
                                    isUnderlineActive 
                                    ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                }`}
                                title="Underline Text"
                            >
                                <Underline size={14} strokeWidth={isUnderlineActive ? 3 : 2} />
                            </button>
                        </div>

                        {/* Thin vertical layout divider item */}
                        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

                        {/* Alignment Control Button Group Container */}
                        <div className="flex items-center justify-between flex-grow">
                            {alignments.map((btn) => {
                                const isActive = (currentFont.align || "left") === btn.value;
                                return (
                                    <button
                                        key={btn.value}
                                        type="button"
                                        onClick={() => onChange({ ...currentFont, align: btn.value })}
                                        className={`flex items-center justify-center w-7 h-7 rounded transition-all ${
                                            isActive 
                                            ? "bg-white text-blue-600 shadow-sm border border-slate-200 font-semibold" 
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                        }`}
                                        title={`Align ${btn.value}`}
                                    >
                                        {btn.icon}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </FieldLabel>
        );
    }
}