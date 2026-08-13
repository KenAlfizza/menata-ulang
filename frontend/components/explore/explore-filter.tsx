"use client"
import { ArrowDownAZ, ArrowUpZA, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "../ui/button.tsx";
import { ExploreFilter, PageType } from "@/types/explore/explore.ts";

export interface ExploreFilterBarProps {
    page: PageType
    sort: ExploreFilter["sort"];
    order: ExploreFilter["order"];
    onSortChange: (sort: ExploreFilter["sort"], order: ExploreFilter["order"]) => void;
}

const backgroundColorMap = {
    story: "bg-red-300/60",
    podcast: "bg-yellow-300/60",
    research: "bg-blue-300/60",
};

export function ExploreFilterBar({ page, sort, order, onSortChange }: ExploreFilterBarProps) {
    const currentBackgroundColor = backgroundColorMap[page];
    const currentProperty = "bg-white/50 text-slate-700 hover:bg-white/80 hover:cursor-pointer";
    const currentSelectedProperty = `${currentBackgroundColor} text-slate-700 hover:${currentBackgroundColor}`;

    const isAZ = sort === "title" && order === "asc";
    const isZA = sort === "title" && order === "desc";
    const isNewest = sort === "updatedAt" && order === "desc";
    const isOldest = sort === "updatedAt" && order === "asc";

    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={() => onSortChange("title", "asc")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isAZ 
                        ? `${currentSelectedProperty}`
                        : `${currentProperty}`
                }`}
            >
                <ArrowDownAZ className="h-4 w-4" />
                A-Z
            </Button>
            <Button
                onClick={() => onSortChange("title", "desc")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isZA 
                        ? `${currentSelectedProperty}`
                        : `${currentProperty}`
                }`}
            >
                <ArrowUpZA className="h-4 w-4" />
                Z-A
            </Button>
            <Button
                onClick={() => onSortChange("updatedAt", "desc")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isNewest 
                        ? `${currentSelectedProperty}`
                        : `${currentProperty}`
                }`}
            >
                <RotateCw className="h-4 w-4" />
                Newest
            </Button>
            <Button
                onClick={() => onSortChange("updatedAt", "asc")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isOldest 
                        ? `${currentSelectedProperty}`
                        : `${currentProperty}`
                }`}
            >
                <RotateCcw className="h-4 w-4" />
                Oldest
            </Button>
        </div>
    );
}