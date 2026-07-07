// components/size/resize-field.tsx
import { useState, useRef } from "react";
import { FieldLabel } from "@puckeditor/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ruler, Lock, Unlock, Scan } from "lucide-react";
import { Size, SizeCustomField } from "./types";

export const defaultSize: Size = {
  width: "",
  height: "",
  borderRadius: { tl: "0", tr: "0", br: "0", bl: "0" },
};

type Corner = "tl" | "tr" | "br" | "bl";
type Dimension = "width" | "height";

const CORNERS: { key: Corner; label: string }[] = [
  { key: "tl", label: "Top left" },
  { key: "tr", label: "Top right" },
  { key: "br", label: "Bottom right" },
  { key: "bl", label: "Bottom left" },
];

/** Splits "320px" / "100%" / "" into a numeric part + unit, so px and
 *  % values never get silently mixed in aspect-ratio math. */
function parseValue(val: string | undefined): { num: number | null; unit: "px" | "%" } {
  if (!val) return { num: null, unit: "px" };
  if (val.endsWith("%")) return { num: parseFloat(val), unit: "%" };
  return { num: parseFloat(val.replace("px", "")), unit: "px" };
}

function formatValue(num: number, unit: "px" | "%") {
  return `${num}${unit}`;
}

/** Width/height pair with an aspect-ratio lock. */
function DimensionFields({
  current,
  natural,
  locked,
  onToggleLock,
  onChange,
}: {
  current: Size;
  natural: { width: string; height: string };
  locked: boolean;
  onToggleLock: () => void;
  onChange: (dimension: Dimension, rawVal: string) => void;
}) {
  const displayValue = (dimension: Dimension) => {
    const val = current[dimension];
    if (!val) return "";
    const { num, unit } = parseValue(val);
    return num === null ? "" : unit === "%" ? `${num}%` : `${num}`;
  };

  return (
    <div className="flex items-end gap-2">
      {(["width", "height"] as Dimension[]).map((dimension) => (
        <div key={dimension} className="flex flex-1 flex-col gap-1">
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {dimension === "width" ? "Width" : "Height"}
          </Label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder={natural[dimension] || "auto"}
            value={displayValue(dimension)}
            onChange={(e) => onChange(dimension, e.target.value)}
            className="font-mono text-xs"
          />
        </div>
      ))}

      <Button
        type="button"
        size="icon"
        variant={locked ? "default" : "outline"}
        onClick={onToggleLock}
        title={locked ? "Unlock aspect ratio" : "Lock aspect ratio"}
        className="mb-[1px] h-8 w-8 shrink-0"
      >
        {locked ? <Lock size={13} /> : <Unlock size={13} />}
      </Button>
    </div>
  );
}

/** Four-corner border radius editor with a link-all toggle. */
function CornerRadiusFields({
  radius,
  linked,
  onToggleLink,
  onChange,
}: {
  radius: Size["borderRadius"];
  linked: boolean;
  onToggleLink: () => void;
  onChange: (corner: Corner, rawVal: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded border border-slate-200 bg-white p-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <Scan size={12} />
          Corner radius
        </span>
        <Button
          type="button"
          size="icon"
          variant={linked ? "default" : "outline"}
          onClick={onToggleLink}
          title={linked ? "Unlink corners" : "Link corners"}
          className="h-6 w-6"
        >
          {linked ? <Lock size={11} /> : <Unlock size={11} />}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {CORNERS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1">
            <Label className="shrink-0 font-mono text-[10px] text-slate-400">{label}</Label>
            <Input
              type="number"
              min={0}
              value={radius?.[key] ?? "0"}
              onChange={(e) => onChange(key, e.target.value)}
              className="ml-auto font-mono text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const resizeField: SizeCustomField = {
  type: "custom",
  label: "Resize",
  render: ({ value, onChange }) => {
    const current: Size = value || defaultSize;
    const currentRadius = current.borderRadius || defaultSize.borderRadius;

    const [natural, setNatural] = useState({ width: "", height: "" });
    const [locked, setLocked] = useState(true);
    const [cornersLinked, setCornersLinked] = useState(true);
    const aspectRatio = useRef<number | null>(null);

    const handleDimensionChange = (dimension: Dimension, rawVal: string) => {
      if (rawVal === "") {
        onChange({ ...current, [dimension]: "" });
        return;
      }

      const isPercent = rawVal.trim().endsWith("%");
      const num = parseFloat(rawVal);
      if (isNaN(num) || num <= 0) return;
      const unit: "px" | "%" = isPercent ? "%" : "px";

      // Aspect-ratio lock only makes sense in px — mixing % width with
      // px height (or vice versa) doesn't have a stable ratio, so we
      // skip the lock math entirely when either side is a percentage.
      if (locked && aspectRatio.current && unit === "px") {
        const other = dimension === "width"
          ? Math.round(num / aspectRatio.current)
          : Math.round(num * aspectRatio.current);

        onChange({
          ...current,
          width: dimension === "width" ? formatValue(num, "px") : formatValue(other, "px"),
          height: dimension === "height" ? formatValue(num, "px") : formatValue(other, "px"),
        });
        return;
      }

      if (unit === "px") {
        const otherDim = dimension === "width" ? current.height : current.width;
        const { num: otherNum, unit: otherUnit } = parseValue(otherDim);
        if (otherNum && otherUnit === "px") {
          aspectRatio.current = dimension === "width" ? num / otherNum : otherNum / num;
        }
      }

      onChange({ ...current, [dimension]: formatValue(num, unit) });
    };

    const handleCornerChange = (corner: Corner, rawVal: string) => {
      const num = rawVal === "" ? "0" : rawVal;
      onChange({
        ...current,
        borderRadius: cornersLinked
          ? { tl: num, tr: num, br: num, bl: num }
          : { ...currentRadius, [corner]: num },
      });
    };

    const handleLockToggle = () => {
      if (!locked) {
        const w = parseValue(current.width);
        const h = parseValue(current.height);
        if (w.num && h.num && w.unit === "px" && h.unit === "px") {
          aspectRatio.current = w.num / h.num;
        }
      }
      setLocked((prev) => !prev);
    };

    return (
      <FieldLabel label="Dimensions" icon={<Ruler size={16} />}>
        <div
          className="mt-1 flex w-full flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <DimensionFields
            current={current}
            natural={natural}
            locked={locked}
            onToggleLock={handleLockToggle}
            onChange={handleDimensionChange}
          />

          <CornerRadiusFields
            radius={currentRadius}
            linked={cornersLinked}
            onToggleLink={() => setCornersLinked((prev) => !prev)}
            onChange={handleCornerChange}
          />
        </div>
      </FieldLabel>
    );
  },
};