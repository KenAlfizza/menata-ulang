import { ResearchPageRecord } from "./page.ts";

/**
 * `ResearchRecord` model returned by the backend.
 */
export interface ResearchRecord {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    slug: string;
    published: boolean;
    publishedAt: Date;
    createdAt: Date | string;
    updatedAt: Date | string;
    authorId: number;
    page: ResearchPageRecord;
}

/**
 * Update research data similar to the backend update data
 */
export interface UpdateResearchData {
    title?: string;
    description?: string;
    slug?: string;
    image?: File;
    published?: boolean;
}
