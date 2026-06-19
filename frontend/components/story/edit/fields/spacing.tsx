// Import Puck
import { FieldLabel } from "@puckeditor/core";
import { Spacing, SpacingCustomField } from "./types.tsx";

// Import Icons
import { 
  Move, 
  Maximize, 
  ArrowUpToLine, 
  ArrowDownToLine, 
  ArrowLeftToLine, 
  ArrowRightToLine 
} from "lucide-react";

// Spacing Px Option
export const spacingPxOptions = Array.from({ length: (96 - 0) / 4 + 1 }, (_, i) => {
  const size = 0 + i * 4;
  return { label: `${size}px`, value: `${size}px` };
});

// Pixel Spacing Resolver
export function resolvePixelStyles(spacing: Spacing): React.CSSProperties {
  const { all, top, bottom, left, right } = spacing;

  // Prioritize "All Sides" if specified and not 0px
  if (all && all !== "0px") {
    return {
      marginTop: all,
      marginBottom: all,
      marginLeft: all,
      marginRight: all,
    };
  }

  return {
    marginTop: top || "0px",
    marginBottom: bottom || "0px",
    marginLeft: left || "0px",
    marginRight: right || "0px",
  };
}

// Default spacing option
export const defaultSpacing: Spacing = {
  all: "0px",
  top: "0px",
  bottom: "0px",
  left: "0px",
  right: "0px",
};

// Spacing Custom Field Implementation
export const spacingField: SpacingCustomField = {
  type: "custom",
  label: "Spacing",
  render: ({ value, onChange }) => {
    const currentSpacing = value || defaultSpacing;

    const handleSelectChange = (side: keyof Spacing, val: string) => {
        if (side == "all") {
            onChange({
                all: val,
                top: val,
                bottom: val,
                left: val,
                right: val,
            });
        } else {
            onChange({ ...currentSpacing, [side]: val });
        }
    };

    return (
      <FieldLabel label="Spacing" icon={<Move size={16} />}>
        <div className="flex flex-col gap-2 w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-1">
            
            {/* Row 1: All Sides spanning full width */}
            <div className="flex items-center justify-between w-full gap-2 bg-white p-1.5 rounded border border-slate-200">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700" title="All Sides">
                <Maximize size={14} className="text-slate-400" />
                <span>All</span>
            </span>
            <select
                value={currentSpacing["all"] || "0px"}
                onChange={(e) => handleSelectChange("all", e.target.value)}
                className="w-[100px] h-7 px-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                {spacingPxOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.value}</option>
                ))}
            </select>
            </div>

            {/* Row 2: 2x2 Symmetrical Grid for Individual Sides */}
            <div className="grid grid-cols-2 gap-2 w-full">
            {(
                [
                { side: "top", icon: <ArrowUpToLine size={13} />, label: "Top" },
                { side: "bottom", icon: <ArrowDownToLine size={13} />, label: "Bottom" },
                { side: "left", icon: <ArrowLeftToLine size={13} />, label: "Left" },
                { side: "right", icon: <ArrowRightToLine size={13} />, label: "Right" },
                ] as const
            ).map(({ side, icon, label }) => (
                <div key={side} className="flex items-center justify-between gap-2 bg-white p-1.5 rounded border border-slate-200 w-full">
                {/* Side Label Icon */}
                <span className="text-slate-400" title={label}>
                    {icon}
                </span>
                {/* Symmetrical Dropdown Selector */}
                <select
                    value={currentSpacing[side] || "0px"}
                    onChange={(e) => handleSelectChange(side, e.target.value)}
                    className="flex-grow max-w-[80px] h-7 px-1 border border-slate-200 rounded text-xs bg-white text-slate-800 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    {spacingPxOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.value}</option>
                    ))}
                </select>
                </div>
            ))}
            </div>

        </div>
        </FieldLabel>
    );
  },
};