// Import Puck
import { FieldLabel } from "@puckeditor/core";
import { Color, ColorCustomField } from "../research/fields./../fields/types.tsx";

// Import Icons
import { Pipette, Paintbrush, Layers } from "lucide-react";

// Import Shadcn / Radix Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const defaultColor: Color = {
  mode: "solid",
  hex: "#ffffff",
  opacity: "100%",
};

const parsePercent = (val: string, fallback: number): number => {
  const parsed = parseInt(val?.replace("%", ""), 10);
  return isNaN(parsed) ? fallback : parsed;
};

export const colorPickerField: ColorCustomField = {
  type: "custom",
  label: "Background Color",
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
      <FieldLabel label="Background Color" icon={<Paintbrush size={16} />}>
        {/* Container with stopPropagation to keep Puck stable */}
        <div 
          className="flex flex-col gap-3 w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Hex & Color Selector Control (Using Shadcn Popover & Input) */}
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
              {/* Shadcn Popover for Advanced Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-8 h-8 p-0 border border-slate-300 rounded shrink-0"
                    style={{ backgroundColor: currentHex }}
                  />
                </PopoverTrigger>
                {/* Important: onInteractOutside allows clicks within Puck sidebar without bugging out */}
                <PopoverContent 
                  className="w-auto p-3 flex flex-col gap-2" 
                  onInteractOutside={(e) => e.preventDefault()}
                >
                  <input 
                    type="color" 
                    value={currentHex} 
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-40 h-40 cursor-pointer rounded border border-slate-200"
                  />
                </PopoverContent>
              </Popover>

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
                className={`w-5 h-5 rounded-sm border transition-transform hover:scale-110 active:scale-95 ${
                  currentHex.toLowerCase() === swatch.toLowerCase() 
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