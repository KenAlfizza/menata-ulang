import { FieldLabel } from "@puckeditor/core";
import { Input } from "@/components/ui/input";
import { ArrowUpToLine, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine, Scan } from "lucide-react";
import { Padding, PaddingCustomField } from "./types";

type Unit = "px" | "%" | "rem";

// Helper to split "16px" into { num: "16", unit: "px" }
const parsePadding = (val: string | undefined): { num: string; unit: Unit } => {
    if (!val) return { num: "", unit: "px" };
    const unit = (val.endsWith("%") ? "%" : val.endsWith("rem") ? "rem" : "px") as Unit;
    const num = val.replace(unit, "");
    return { num, unit };
};

export function resolvePaddingStyles(padding: Padding): React.CSSProperties {
  const { all, top, bottom, left, right } = padding || {};
  
  if (all && all !== "0px" && all !== "") {
    return { padding: all };
  }

  return {
    paddingTop: top || "0px",
    paddingBottom: bottom || "0px",
    paddingLeft: left || "0px",
    paddingRight: right || "0px",
  };
}

export const defaultPadding: Padding = {
    all: "0px", top: "0px", bottom: "0px", left: "0px", right: "0px",
};

export const paddingField: PaddingCustomField = {
    type: "custom",
    label: "Padding",
    render: ({ value, onChange }) => {
        const current = value || defaultPadding;

        const handleChange = (side: keyof Padding, num: string, unit: Unit) => {
            const val = num === "" ? "" : `${num}${unit}`;
            if (side === "all") {
                onChange({ all: val, top: val, bottom: val, left: val, right: val });
            } else {
                onChange({ ...current, [side]: val });
            }
        };

        const renderInput = (side: keyof Padding) => {
            const { num, unit } = parsePadding(current[side]);
            return (
                <div className="flex gap-1">
                    <Input
                        className="h-7 w-full text-xs font-mono"
                        value={num}
                        onChange={(e) => handleChange(side, e.target.value, unit)}
                        placeholder="0"
                    />
                    <select
                        className="h-7 rounded border border-slate-200 bg-white px-1 text-[10px]"
                        value={unit}
                        onChange={(e) => handleChange(side, num, e.target.value as Unit)}
                    >
                        <option value="px">px</option>
                        <option value="%">%</option>
                        <option value="rem">rem</option>
                    </select>
                </div>
            );
        };

        return (
            <FieldLabel label="Padding" icon={<Scan size={16} />}>
                <div className="mt-1 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <div className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-white p-1.5">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <Scan size={14} className="text-slate-400" /> All
                        </span>
                        <div className="w-[120px]">{renderInput("all")}</div>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-2">
                        {[
                            { side: "top", icon: <ArrowUpToLine size={13} /> },
                            { side: "bottom", icon: <ArrowDownToLine size={13} /> },
                            { side: "left", icon: <ArrowLeftToLine size={13} /> },
                            { side: "right", icon: <ArrowRightToLine size={13} /> },
                        ].map(({ side, icon }) => (
                            <div key={side} className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-white p-1.5">
                                <span className="text-slate-400">{icon}</span>
                                {renderInput(side as keyof Padding)}
                            </div>
                        ))}
                    </div>
                </div>
            </FieldLabel>
        );
    },
};