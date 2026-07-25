// Import Puck
import { FieldLabel } from "@puckeditor/core";
import { Color, ColorCustomField } from "./types.tsx";

// Import Icons
import { Pipette, Paintbrush, Layers } from "lucide-react";

// Import Shadcn / Radix Components
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export const defaultColor: Color = {
    mode: "solid",
    hex: "#ffffff",
    opacity: "100%",
};

const parsePercent = (val: string, fallback: number): number => {
    const parsed = parseInt(val?.replace("%", ""), 10);
    return isNaN(parsed) ? fallback : parsed;
};

// Helper function to convert hex + percentage opacity to an rgba() or hex string
export const getBackgroundColor = (colorObj?: { hex?: string; opacity?: string }) => {
    if (!colorObj || !colorObj.hex) return "transparent";

    const hex = colorObj.hex;
    const opacityStr = colorObj.opacity || "100%";
    const opacityNum = parseInt(opacityStr.replace("%", ""), 10) / 100;

    // If opacity is 100% (or NaN), just return the hex
    if (isNaN(opacityNum) || opacityNum >= 1) {
        return hex;
    }

    // Convert hex to rgb for rgba usage
    let c = hex.replace("#", "");
    if (c.length === 3) {
        c = c.split("").map((char) => char + char).join("");
    }
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    return `rgba(${r}, ${g}, ${b}, ${opacityNum})`;
};

export const colorPickerField: ColorCustomField = {
    type: "custom",
    label: "Color",
    render: ({ value, onChange }) => {
        const currentColor = value || defaultColor;

        const currentHex = currentColor.hex || "#ffffff";
        const currentOpacity = parsePercent(currentColor.opacity, 100);

        const handleHexChange = (hexVal: string) => {
            onChange({ ...currentColor, hex: hexVal });
        };

        const handleOpacityChange = (values: number[]) => {
            onChange({ ...currentColor, opacity: `${values[0]}%` });
        };

        const presetSwatches = [
            "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0",
            "#f43f5e", "#0ea5e9", "#10b981", "#f59e0b", "#6366f1", "#0f172a"
        ];

        return (
            <FieldLabel label="Color" icon={<Paintbrush size={16} />}>
                {/* Container with stopPropagation to keep Puck stable */}
                <div
                    className="flex flex-col gap-3 w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-1"
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* Hex & Color Selector Control (Inline Native Color + Text Input) */}
                    <div className="flex flex-col gap-1.5 bg-white p-2 rounded border border-slate-200">
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                <Pipette size={14} className="text-slate-400" />
                                <span>Color Value</span>
                            </span>
                            <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                                {currentHex}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Native color picker styled as a button box (No nested Popover) */}
                            <div className="relative w-8 h-8 rounded border border-slate-300 overflow-hidden shrink-0 cursor-pointer shadow-sm">
                                <input
                                    type="color"
                                    value={currentHex}
                                    onChange={(e) => handleHexChange(e.target.value)}
                                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer opacity-0"
                                />
                                <div
                                    className="w-full h-full pointer-events-none"
                                    style={{ backgroundColor: currentHex }}
                                />
                            </div>

                            {/* Shadcn Input */}
                            <Input
                                type="text"
                                value={currentHex}
                                onChange={(e) => handleHexChange(e.target.value)}
                                placeholder="#ffffff"
                                className="h-8 text-xs font-mono uppercase bg-slate-50 border border-slate-200 focus-visible:ring-1 focus-visible:ring-emerald-600"
                            />
                        </div>
                    </div>

                    {/* Quick Swatches Grid */}
                    <div className="flex flex-wrap gap-1.5 p-1 bg-white rounded border border-slate-200 justify-between">
                        {presetSwatches.map((swatch) => (
                            <button
                                key={swatch}
                                type="button"
                                onClick={() => handleHexChange(swatch)}
                                className={`w-5 h-5 rounded-sm border transition-transform hover:scale-110 active:scale-95 ${currentHex.toLowerCase() === swatch.toLowerCase()
                                        ? "border-slate-600 ring-1 ring-slate-400"
                                        : "border-slate-200"
                                    }`}
                                style={{ backgroundColor: swatch }}
                                title={swatch}
                            />
                        ))}
                    </div>

                    {/* Opacity Control (Using Shadcn Slider) */}
                    <div className="flex flex-col gap-2.5 bg-white p-2 rounded border border-slate-200">
                        <div className="flex items-center justify-between w-full">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                <Layers size={14} className="text-slate-400" />
                                <span>Opacity</span>
                            </span>
                            <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {currentOpacity}%
                            </span>
                        </div>

                        {/* Shadcn Slider component uses array values */}
                        <Slider
                            defaultValue={[currentOpacity]}
                            value={[currentOpacity]}
                            max={100}
                            step={1}
                            onValueChange={handleOpacityChange}
                            className="py-1 cursor-pointer"
                        />
                    </div>

                </div>
            </FieldLabel>
        );
    },
};