import { Data } from "@puckeditor/core";

/**
 * Core Database Model Interface returned by backend
 */
export interface ResearchRecord {
    id: string;
    title: string;
    description: string;
    slug: string;
    puckData: Data;
    published: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
    researcherId: number;
}