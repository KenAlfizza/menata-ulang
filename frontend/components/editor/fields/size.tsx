import { useState, useRef } from "react";
import { FieldLabel } from "@puckeditor/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ruler, Lock, Unlock, Scan } from "lucide-react";
import { Size, SizeCustomField } from "./types";

type Unit = "px" | "%" | "rem";
type Corner = "tl" | "tr" | "br" | "bl";
type Dimension = "width" | "height";

export const defaultSize: Size = {
  width: "",
  height: "",
  borderRadius: { 
    tl: "0", 
    tr: "0", 
    br: "0", 
    bl: "0" 
  },
};

// --- Utilities ---
const parseValue = (val: string | undefined): { num: string; unit: Unit } => {
    if (!val) return { num: "", unit: "px" };
    const unit = (val.endsWith("%") ? "%" : val.endsWith("rem") ? "rem" : "px") as Unit;
    const num = val.replace(unit, "");
    return { num, unit };
};

const getCornerLabel = (corner: string): string => {
    switch (corner) {
        case 'tl': return 'Top Left';
        case 'tr': return 'Top Right';
        case 'bl': return 'Bottom Left';
        case 'br': return 'Bottom Right';
        default: return 'Corner';
    }
};

export const resizeField: SizeCustomField = {
    type: "custom",
    label: "Resize",
    render: ({ value, onChange }) => {
        const current = value || { width: "auto", height: "auto", borderRadius: { tl: "0", tr: "0", br: "0", bl: "0" } };
        const [locked, setLocked] = useState(true);
        const [cornersLinked, setCornersLinked] = useState(true);
        const aspectRatio = useRef<number | null>(null);

        const handleDimChange = (dim: Dimension, val: string, unit: Unit) => {
            const num = parseFloat(val);
            if (isNaN(num) && val !== "") return;

            if (locked && aspectRatio.current && unit === "px" && val !== "") {
                const isW = dim === "width";
                const other = isW ? Math.round(num / aspectRatio.current) : Math.round(num * aspectRatio.current);
                onChange({ ...current, width: `${isW ? num : other}px`, height: `${isW ? other : num}px` });
            } else {
                onChange({ ...current, [dim]: val === "" ? "" : `${num}${unit}` });
            }
        };

        return (
            <FieldLabel label="Dimensions" icon={<Ruler size={16} />}>
                <div className="mt-1 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    {/* Dimension Fields */}
                    <div className="flex items-end gap-2">
                        {(["width", "height"] as Dimension[]).map((d) => {
                            const { num, unit } = parseValue(current[d]);
                            return (
                                <div key={d} className="flex flex-1 flex-col gap-1">
                                    <Label className="text-[10px] font-bold uppercase text-slate-500">{d}</Label>
                                    <div className="flex gap-1">
                                        <Input className="h-8 font-mono text-xs" placeholder="auto" value={num} onChange={(e) => handleDimChange(d, e.target.value, unit)} />
                                        <select className="h-8 rounded border border-slate-200 bg-white px-1 text-[10px]" value={unit} onChange={(e) => handleDimChange(d, num, e.target.value as Unit)}>
                                            <option value="px">px</option>
                                            <option value="%">%</option>
                                            <option value="rem">rem</option>
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                        <Button size="icon" variant={locked ? "default" : "outline"} className="h-8 w-8 shrink-0" onClick={() => setLocked(!locked)}>
                            {locked ? <Lock size={13} /> : <Unlock size={13} />}
                        </Button>
                    </div>

                    {/* Corner Radius Section */}
                    <div className="rounded border border-slate-200 bg-white p-2">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-500"><Scan size={12} /> Radius</span>
                            <Button size="icon" variant={cornersLinked ? "default" : "outline"} className="h-6 w-6" onClick={() => setCornersLinked(!cornersLinked)}>
                                {cornersLinked ? <Lock size={11} /> : <Unlock size={11} />}
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {(["tl", "tr", "br", "bl"] as Corner[]).map((c) => (
                                <div key={c} className="grid grid-cols-[1fr_1.5fr] items-center gap-1">
                                    <span className="text-xs">
                                        {getCornerLabel(c)}
                                    </span>
                                    <Input className="h-7 text-xs" value={current.borderRadius[c]} onChange={(e) => {
                                        const val = e.target.value;
                                        const nextRadius = cornersLinked ? { tl: val, tr: val, br: val, bl: val } : { ...current.borderRadius, [c]: val };
                                        onChange({ ...current, borderRadius: nextRadius });
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </FieldLabel>
        );
    },
};