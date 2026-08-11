"use client";

import { useParams } from "next/navigation";
import { PageType } from "@/types/explore/explore.ts";

const isValidPageType = (value: string | undefined): value is PageType =>
    value === "story" || value === "podcast" || value === "research";

export function useExplore(): PageType {
    const params = useParams<{ page?: string }>();
    return isValidPageType(params.page) ? params.page : "story";
}