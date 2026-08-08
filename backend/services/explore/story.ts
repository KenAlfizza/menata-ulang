import { prisma } from "../../lib/prisma.ts";
import { ExploreServiceResult } from "../../types/services/explore.ts";
import { ExploreFilter, ExplorePaginatedResult, IExploreService } from "../../types/services/explore/interface.ts";

import { ExploreStory, ExploreStorySummary } from "../../types/services/explore/story.ts";

export class ExploreStoryService implements IExploreService {
    constructor() { }

    async get(
        slug: string
    ) : Promise<ExploreServiceResult<ExploreStory>> {
        try {
            const story = await prisma.story.findUnique({
                where: { 
                    slug, 
                    published: true 
                },
                include: { 
                    page: true 
                }
            })

            if (!story || !story.page) return { success: false, error: 'NOT_FOUND' };

            const data = new ExploreStory(
                story.page?.puckData ?? {}
            );

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }

    async getExploreFeed(
        filter: ExploreFilter
    ): Promise<ExploreServiceResult<ExplorePaginatedResult<ExploreStorySummary>>> {
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
                authorName: { author: { name: order } }
            };

            const orderBy = allowedSortFields[sort] ?? { publishedAt: order };

            const [stories, total] = await prisma.$transaction([
                prisma.story.findMany({
                    where,
                    include: { author: { select: { name: true } } },
                    take: limit,
                    skip,
                    orderBy
                }),
                prisma.story.count({ where })
            ]);

            const items = stories.map(s => new ExploreStorySummary(
                s.slug,
                s.title,
                s.author.name,
                s.description,
                s.publishedAt,
                s.imageUrl,
                s.heartsCount
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