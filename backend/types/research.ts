import { PuckOutputData } from "./puck.ts";

/**
 * The research record data type
 */
export type ResearchRecord = {
    id: string,
    slug: string,
    title: string,
    description: string,
    createdAt: Date,
    updatedAt: Date | null,
    researcherName: string,
    researcherId: number,
    imageUrl: string,
    published: boolean,
    publishedAt: Date | null,
    heartsCount: number,
    threadId: string,
    page: ResearchPageRecord
}

/**
 * The research page data type
 */
export type ResearchPageRecord = {
    id: string,
    puckData: PuckOutputData,
}

/**
 * Defines the criteria for filtering and paginating research.
 * All fields are optional to allow for flexible, partial filtering.
 */
export interface ResearchFilter {
    published?: boolean;
    search?: string;
    limit: number;
    page: number;
    sort?: "title" | "updatedAt";
    order?: "asc" | "desc";
}
