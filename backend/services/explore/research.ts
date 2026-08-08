import { prisma } from "../../lib/prisma.ts";
import { ExploreServiceResult } from "../../types/services/explore.ts";
import { ExploreFilter, ExplorePaginatedResult, IExploreService } from "../../types/services/explore/interface.ts";
import { ExploreResearch, ExploreResearchSummary } from "../../types/services/explore/research.ts"; // Adjust path if needed

export class ExploreResearchService implements IExploreService {
    constructor() { }

    async get(slug: string): Promise<ExploreServiceResult<ExploreResearch>> {
        try {
            const research = await prisma.research.findUnique({
                where: { slug, published: true },
                include: { page: true }
            });

            if (!research || !research.page) return { success: false, error: 'NOT_FOUND' };

            // Storing fetched data into the data class structure
            const data = new ExploreResearch(
                research.page.puckData
            );

            return { success: true, data };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }

    async getExploreFeed(
        filter: ExploreFilter
    ): Promise<ExploreServiceResult<ExplorePaginatedResult<ExploreResearchSummary>>> {
        try {
            const { search, limit, page, sort = 'publishedAt', order = 'desc' } = filter;
            const skip = (page - 1) * limit;

            const where = {
                published: true,
                ...(search && { title: { contains: search, mode: 'insensitive' as const } })
            };

            const allowedSortFields: Record<string, any> = {
                publishedAt: { publishedAt: order },
                title: { title: order },
                heartsCount: { heartsCount: order },
                researcherName: { researcher: { name: order } }
            };

            const orderBy = allowedSortFields[sort] ?? { publishedAt: order };

            const [researches, total] = await prisma.$transaction([
                prisma.research.findMany({
                    where,
                    include: { researcher: { select: { name: true } } },
                    take: limit,
                    skip,
                    orderBy: orderBy
                }),
                prisma.research.count({ where })
            ]);

            const items = researches.map(r => new ExploreResearchSummary(
                r.slug,
                r.title,
                r.researcher.name,
                r.description,
                r.publishedAt,
                r.imageUrl,
                r.heartsCount
            ));

            return { 
                success: true, 
                data: { 
                    items, 
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                } 
            };
        } catch (error) {
            console.error("Fetch Explore Feed Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }
}