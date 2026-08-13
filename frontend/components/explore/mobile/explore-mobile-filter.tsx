"use client"

import { useState } from "react";
import { ArrowDownAZ, ArrowUpZA, RotateCcw, RotateCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog.tsx";
import { ExploreFilter } from "@/types/explore/explore.ts";
import { ExploreFilterBarProps } from "@/components/explore/explore-filter.tsx";

export function ExploreMobileFilter({ sort, order, onSortChange }: ExploreFilterBarProps) {
    const [open, setOpen] = useState(false);

    const isAZ = sort === "title" && order === "asc";
    const isZA = sort === "title" && order === "desc";
    const isNewest = sort === "updatedAt" && order === "desc";
    const isOldest = sort === "updatedAt" && order === "asc";

    const handleSelect = (newSort: ExploreFilter["sort"], newOrder: ExploreFilter["order"]) => {
        onSortChange(newSort, newOrder);
        setOpen(false);
    };

    const hasActiveFilter = isAZ || isZA || isNewest || isOldest;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={`flex items-center gap-2 p-2 text-sm font-medium transition-colors ${
                        hasActiveFilter
                            ? "bg-yellow-300/60 text-slate-700 hover:bg-yellow-300/80"
                            : "bg-white/50 text-slate-700 hover:bg-white/80"
                    }`}
                >
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[300px]">
                <DialogHeader>
                    <DialogTitle>Sort By</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 py-2">
                    <Button
                        variant="ghost"
                        onClick={() => handleSelect("title", isAZ ? "desc" : "asc")}
                        className={`justify-start gap-2 ${isAZ || isZA ? "bg-yellow-300/40 font-semibold" : ""}`}
                    >
                        {isZA ? (
                            <>
                                <ArrowUpZA className="h-4 w-4" />
                                Title (Z-A)
                            </>
                        ) : (
                            <>
                                <ArrowDownAZ className="h-4 w-4" />
                                Title (A-Z)
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => handleSelect("updatedAt", "desc")}
                        className={`justify-start gap-2 ${isNewest ? "bg-yellow-300/40 font-semibold" : ""}`}
                    >
                        <RotateCw className="h-4 w-4" />
                        Newest
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => handleSelect("updatedAt", "asc")}
                        className={`justify-start gap-2 ${isOldest ? "bg-yellow-300/40 font-semibold" : ""}`}
                    >
                        <RotateCcw className="h-4 w-4" />
                        Oldest
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}