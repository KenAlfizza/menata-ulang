"use client"
import { ArrowDownAZ, ArrowUpZA, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "../ui/button.tsx";
import { ExploreFilter } from "../../types/explore/explore.ts";

export interface ExploreFilterBarProps {
    sort: ExploreFilter["sort"];
    order: ExploreFilter["order"];
    onSortChange: (sort: ExploreFilter["sort"], order: ExploreFilter["order"]) => void;
}

const backgroundColorMap = {
    story: "bg-red-300/60",
    podcast: "bg-yellow-300/60",
    research: "bg-blue-300/60",
};

export function ExploreFilterBar({ sort, order, onSortChange }: ExploreFilterBarProps) {
    const isAZ = sort === "title" && order === "asc";
    const isZA = sort === "title" && order === "desc";
    const isNewest = sort === "updatedAt" && order === "desc";
    const isOldest = sort === "updatedAt" && order === "asc";

    const handleAlphabeticalToggle = () => {
        if (isAZ) {
            onSortChange("title", "desc");
        } else {
            onSortChange("title", "asc");
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={handleAlphabeticalToggle}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isAZ || isZA 
                        ? "bg-yellow-300/60 text-slate-700 hover:bg-white/80" 
                        : "bg-white/50 text-slate-700 hover:bg-white/80"
                }`}
            >
                {isZA ? (
                    <>
                        <ArrowUpZA className="h-4 w-4" />
                        Z-A
                    </>
                ) : (
                    <>
                        <ArrowDownAZ className="h-4 w-4" />
                        A-Z
                    </>
                )}
            </Button>
            <Button
                onClick={() => onSortChange("updatedAt", "desc")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isNewest 
                        ? "bg-yellow-300/60 text-slate-700 hover:bg-yellow-300/60" 
                        : "bg-white/50 text-slate-700 hover:bg-white/80"
                }`}
            >
                <RotateCw className="h-4 w-4" />
                Newest
            </Button>
            <Button
                onClick={() => onSortChange("updatedAt", "asc")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isOldest 
                        ? "bg-yellow-300/60 text-slate-700 hover:bg-yellow-300/60" 
                        : "bg-white/50 text-slate-700 hover:bg-white/80"
                }`}
            >
                <RotateCcw className="h-4 w-4" />
                Oldest
            </Button>
        </div>
    );
}