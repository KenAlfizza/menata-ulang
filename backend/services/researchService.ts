import { PuckOutputData } from "../types/puck.ts";
import { ResearchPageRecord, ResearchRecord } from "../types/research.ts";

export const researchService = {
    /**
     * Builds and returns a complete ResearchRecord object using the provided research source data.
     * Expects the `author` relation (selecting `name`) and `page` relation to already be included.
     *
     * @param research - The source object from prisma containing the research properties, author, and page(s).
     * @returns A promise that resolves to the fully constructed ResearchRecord.
     */
    async buildResearchRecord(
        research: {
            id: string;
            slug: string;
            title: string;
            description: string;
            createdAt: Date;
            updatedAt: Date | null;
            researcherId: number;
            researcher: {name: string}
            imageUrl: string;
            published: boolean;
            publishedAt: Date | null;
            heartsCount: number;
            threadId: string;
            page: ResearchPageRecord;
        }
    ): Promise<ResearchRecord> {
        const researchRecord: ResearchRecord = {
            id: research.id,
            slug: research.slug,
            title: research.title,
            description: research.description,
            createdAt: research.createdAt,
            updatedAt: research.updatedAt,
            researcherId: research.researcherId,
            researcherName: research.researcher.name,
            imageUrl: research.imageUrl,
            published: research.published,
            publishedAt: research.publishedAt,
            heartsCount: research.heartsCount,
            threadId: research.threadId,
            page: {
                id: research.page.id,
                puckData: research.page.puckData as PuckOutputData,
            }
        };
        return researchRecord;
    },


    
}