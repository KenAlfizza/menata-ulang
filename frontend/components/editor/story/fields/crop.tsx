// Import Puck
import { FieldLabel } from "@puckeditor/core";
import { Crop, CropCustomField } from "./types";

// Import Icons
import { 
  Scissors, 
  Maximize2, 
  MoveHorizontal, 
  MoveVertical 
} from "lucide-react";

// Default crop option
export const defaultCrop: Crop = {
  zoom: "1",
  cropX: "50%",
  cropY: "50%",
};

// Helpers to cleanly parse unit tokens out of string states
const parsePercent = (val: string, fallback: number): number => {
  const parsed = parseInt(val?.replace("%", ""), 10);
  return isNaN(parsed) ? fallback : parsed;
};

const parseFloatValue = (val: string, fallback: number): number => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? fallback : parsed;
};

// Crop Custom Field Implementation
export const cropField: CropCustomField = {
  type: "custom",
  label: "Inner Crop Controls",
  render: ({ value, onChange }) => {
    const currentCrop = value || defaultCrop;

    const handleSliderChange = (property: keyof Crop, rawVal: string, isPercent: boolean) => {
      const formattedVal = isPercent ? `${rawVal}%` : rawVal;
      onChange({ ...currentCrop, [property]: formattedVal });
    };

    const currentZoom = parseFloatValue(currentCrop.zoom, 1);
    const currentCropX = parsePercent(currentCrop.cropX, 50);
    const currentCropY = parsePercent(currentCrop.cropY, 50);

    return (
      <FieldLabel label="Inner Crop Controls" icon={<Scissors size={16} />}>
        <div 
          className="flex flex-col gap-3 w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Zoom Factor Slider */}
          <div className="flex flex-col gap-1.5 bg-white p-2 rounded border border-slate-200">
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Maximize2 size={14} className="text-slate-400" />
                <span>Zoom Factor</span>
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                {currentZoom.toFixed(1)}x
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="3" 
              step="0.1" 
              value={currentZoom} 
              onChange={(e) => handleSliderChange("zoom", e.target.value, false)} 
              className="w-full h-1 bg-slate-200 accent-emerald-600 appearance-none cursor-pointer rounded-lg focus:outline-none" 
            />
          </div>

          {/* Horizontal Shift (X) Slider */}
          <div className="flex flex-col gap-1.5 bg-white p-2 rounded border border-slate-200">
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <MoveHorizontal size={14} className="text-slate-400" />
                <span>Horizontal Shift (X)</span>
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                {currentCropX}%
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="1" 
              value={currentCropX} 
              onChange={(e) => handleSliderChange("cropX", e.target.value, true)} 
              className="w-full h-1 bg-slate-200 accent-emerald-600 appearance-none cursor-pointer rounded-lg focus:outline-none" 
            />
          </div>

          {/* Vertical Shift (Y) Slider */}
          <div className="flex flex-col gap-1.5 bg-white p-2 rounded border border-slate-200">
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <MoveVertical size={14} className="text-slate-400" />
                <span>Vertical Shift (Y)</span>
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                {currentCropY}%
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="1" 
              value={currentCropY} 
              onChange={(e) => handleSliderChange("cropY", e.target.value, true)} 
              className="w-full h-1 bg-slate-200 accent-emerald-600 appearance-none cursor-pointer rounded-lg focus:outline-none" 
            />
          </div>

        </div>
      </FieldLabel>
    );
  },
};