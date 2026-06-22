import { useState, useRef } from "react";
import { FieldLabel } from "@puckeditor/core";
import { Size, SizeCustomField } from "./types";
import { Ruler, Lock, Unlock, Scan } from "lucide-react";

export const defaultSize: Size = {
  width: "",
  height: "",
  borderRadius: { tl: "0", tr: "0", br: "0", bl: "0" },
};

type Corner = "tl" | "tr" | "br" | "bl";

const CORNERS: { key: Corner; label: string }[] = [
  { key: "tl", label: "Top Left" },
  { key: "tr", label: "Top Right" },
  { key: "br", label: "Bottom Right" },
  { key: "bl", label: "Bottom Left" },
];

export const resizeField: SizeCustomField = {
  type: "custom",
  label: "Resize (px)",
  render: ({ value, onChange }) => {
    const current: Size = value || defaultSize;
    const currentRadius = current.borderRadius || defaultSize.borderRadius;

    const [naturalDimensions, setNaturalDimensions] = useState({ width: "", height: "" });
    const [locked, setLocked] = useState(true);
    const [cornersLinked, setCornersLinked] = useState(true);
    const aspectRatioRef = useRef<number | null>(null);

    const pData = (onChange as any)._data || {};
    const imgSrc = pData?.src || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000";

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setNaturalDimensions({ width: `${w}`, height: `${h}` });
      aspectRatioRef.current = w / h;
      if (!current.width && !current.height) {
        onChange({ ...current, width: `${w}px`, height: `${h}px` });
      }
    };

    const handleInputChange = (dimension: "width" | "height", rawVal: string) => {
      if (rawVal === "") {
        onChange({ ...current, [dimension]: "" });
        return;
      }
      const num = parseFloat(rawVal);
      if (isNaN(num) || num <= 0) return;

      if (locked && aspectRatioRef.current) {
        const ratio = aspectRatioRef.current;
        if (dimension === "width") {
          onChange({ ...current, width: `${num}px`, height: `${Math.round(num / ratio)}px` });
        } else {
          onChange({ ...current, width: `${Math.round(num * ratio)}px`, height: `${num}px` });
        }
      } else {
        const other = dimension === "width" ? current.height : current.width;
        const otherNum = parseFloat(other?.replace("px", "") || "0");
        if (dimension === "width") aspectRatioRef.current = num / otherNum;
        else aspectRatioRef.current = otherNum / num;
        onChange({ ...current, [dimension]: `${num}px` });
      }
    };

    const handleCornerChange = (corner: Corner, rawVal: string) => {
      const num = rawVal === "" ? "0" : rawVal;
      if (cornersLinked) {
        onChange({
          ...current,
          borderRadius: { tl: num, tr: num, br: num, bl: num },
        });
      } else {
        onChange({
          ...current,
          borderRadius: { ...currentRadius, [corner]: num },
        });
      }
    };

    const getDisplayValue = (dimension: "width" | "height") =>
      current[dimension]?.replace("px", "") ?? "";

    const handleLockToggle = () => {
      if (!locked) {
        const w = parseFloat(current.width?.replace("px", "") || "0");
        const h = parseFloat(current.height?.replace("px", "") || "0");
        if (w > 0 && h > 0) aspectRatioRef.current = w / h;
      }
      setLocked((prev) => !prev);
    };

    return (
      <FieldLabel label="Image Dimensions" icon={<Ruler size={16} />}>
        <img src={imgSrc} onLoad={handleImageLoad} className="hidden" aria-hidden />

        <div
          className="flex flex-col gap-3 w-full p-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-1 text-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Width / Height */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1 bg-white p-2 rounded border border-slate-200 flex-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">W (px)</label>
              <input
                type="number"
                placeholder={naturalDimensions.width || "---"}
                value={getDisplayValue("width")}
                onChange={(e) => handleInputChange("width", e.target.value)}
                className="w-full p-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-mono"
                min="1"
              />
            </div>

            <div className="flex flex-col gap-1 bg-white p-2 rounded border border-slate-200 flex-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">H (px)</label>
              <input
                type="number"
                placeholder={naturalDimensions.height || "---"}
                value={getDisplayValue("height")}
                onChange={(e) => handleInputChange("height", e.target.value)}
                className="w-full p-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-mono"
                min="1"
              />
            </div>

            <button
              onClick={handleLockToggle}
              title={locked ? "Unlock aspect ratio" : "Lock aspect ratio"}
              className={`mt-4 p-1.5 rounded border transition-colors ${
                locked ? "bg-blue-500 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
              }`}
            >
              {locked ? <Lock size={13} /> : <Unlock size={13} />}
            </button>
          </div>

          {/* Border Radius */}
          <div className="flex flex-col gap-2 bg-white p-2 rounded border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <Scan size={12} />
                Corners (px)
              </span>
              <button
                onClick={() => setCornersLinked((prev) => !prev)}
                title={cornersLinked ? "Unlink corners" : "Link corners"}
                className={`p-1 rounded border transition-colors ${
                  cornersLinked ? "bg-blue-500 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                }`}
              >
                {cornersLinked ? <Lock size={11} /> : <Unlock size={11} />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {CORNERS.map(({ key, label }) => (
                <div key={key} className="flex flex-row items-center gap-0.5">
                  <label className="text-[10px] text-slate-400 font-mono">{label}</label>
                  <input
                    type="number"
                    min="0"
                    value={currentRadius[key] ?? "0"}
                    onChange={(e) => handleCornerChange(key, e.target.value)}
                    className="w-2/5 ml-auto p-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </FieldLabel>
    );
  },
};