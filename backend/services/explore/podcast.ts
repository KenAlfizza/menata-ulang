import { prisma } from "../../lib/prisma.ts";
import { ExploreServiceResult } from "../../types/services/explore.ts";
import { ExploreFilter, ExplorePaginatedResult, IExploreService } from "../../types/services/explore/interface.ts";
import { ExplorePodcast, ExplorePodcastSummary } from "../../types/services/explore/podcast.ts";

export class ExplorePodcastService implements IExploreService {
    constructor() { }

    async get(slug: string): Promise<ExploreServiceResult<ExplorePodcast>> {
        try {
            const podcast = await prisma.podcast.findUnique({
                where: { slug, published: true },
                include: { host: { select: { name: true } } }
            });

            if (!podcast) return { success: false, error: 'NOT_FOUND' };

            // Storing fetched data into the data class structure
            const data = new ExplorePodcast(
                podcast.slug,
                podcast.title,
                podcast.description,
                podcast.transcript,
                podcast.duration,
                podcast.audioUrl,
                podcast.imageUrl,
                podcast.host.name,
                podcast.hostId,
                podcast.threadId,
                podcast.publishedAt,
                podcast.heartsCount
            );

            return { success: true, data };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }

    async getExploreFeed(
        filter: ExploreFilter
    ): Promise<ExploreServiceResult<ExplorePaginatedResult<ExplorePodcastSummary>>> {
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
                hostName: { host: { name: order } }
            };

            const orderBy = allowedSortFields[sort] ?? { publishedAt: order };

            const [podcasts, total] = await prisma.$transaction([
                prisma.podcast.findMany({
                    where,
                    include: { host: { select: { name: true } } },
                    take: limit,
                    skip,
                    orderBy
                }),
                prisma.podcast.count({ where })
            ]);

            const items = podcasts.map(p => new ExplorePodcastSummary(
                p.slug,
                p.title,
                p.description,
                p.host.name,
                p.hostId,
                p.imageUrl,
                p.audioUrl,
                p.publishedAt,
                p.heartsCount
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