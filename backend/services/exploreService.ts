import { prisma } from "../lib/prisma.ts";
import { PodcastRecord } from "../types/podcast.ts";
import { ResearchRecord } from "../types/research.ts";
import { ExplorePodcast, ExploreResearch, ExploreServiceResult, ExploreStory } from "../types/services/explore.ts";
import { StoryRecord } from "../types/story.ts";

export const exploreService = {
    /**
     * Builds and returns a complete ExploreStory object using the provided story source data.
     * 
     * @param story - The source object from Prisma containing the story properties and its associated pages.
     * @returns A promise that resolves to the fully constructed ExploreStory object.
     */
    async buildExploreStory(
        story: StoryRecord
    ) : Promise<ExploreStory> {
        const exploreStory: ExploreStory = {
            puckData: story.page.puckData
        }
        return exploreStory;
    },
    

    /**
     * Fetches a single published story by its slug, including its associated pages.
     * 
     * @param slug - The unique slug of the story to retrieve.
     * @returns A promise resolving to a service result containing the ExploreStory or an error.
     */
    async getStory(
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

            if (!story) return { success: false, error: 'NOT_FOUND' };

            return {
                success: true,
                data: await this.buildExploreStory(story as unknown as StoryRecord)
            };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Builds and returns a complete ExploreResearch object using the provided research source data.
     * 
     * @param research - The source object from Prisma containing the research properties and its associated pages.
     * @returns A promise that resolves to the fully constructed ExploreResearch object.
     */
    async buildExploreResearch(
        research: ResearchRecord
    ) : Promise<ExploreResearch> {
        const exploreResearch: ExploreResearch = {
            puckData: research.page.puckData
        }
        return exploreResearch;
    },
    

    /**
     * Fetches a single published research by its slug, including its associated pages.
     * 
     * @param slug - The unique slug of the research to retrieve.
     * @returns A promise resolving to a service result containing the ExploreResearch or an error.
     */
    async getResearch(
        slug: string
    ) : Promise<ExploreServiceResult<ExploreResearch>> {
        try {
            const research = await prisma.research.findUnique({
                where: { 
                    slug, 
                    published: true 
                },
                include: { 
                    page: true 
                }
            })

            if (!research) return { success: false, error: 'NOT_FOUND' };

            return {
                success: true,
                data: await this.buildExploreResearch(research as unknown as ResearchRecord)
            };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Builds and returns a complete ExplorePodcast object using the provided podcast source data.
     * 
     * @param podcast - The source object from Prisma containing the podcast properties and its associated pages.
     * @returns A promise that resolves to the fully constructed ExplorePodcast object.
     */
    buildExplorePodcast(
        podcast: PodcastRecord
    ) : ExplorePodcast {
        const explorePodcast: ExplorePodcast = {
            slug: podcast.slug,
            title: podcast.title,
            description: podcast.description,
            transcript: podcast.transcript,
            duration: podcast.duration,

            audioUrl: podcast.audioUrl,
            imageUrl: podcast.imageUrl,

            hostName: podcast.hostName,
            hostId: podcast.hostId,
            
            threadId: podcast.threadId,
            heartsCount: podcast.heartsCount,
        }
        return explorePodcast;
    },
    

    /**
     * Fetches a single published podcast by its slug, including its associated pages.
     * 
     * @param slug - The unique slug of the podcast to retrieve.
     * @returns A promise resolving to a service result containing the ExplorePodcast or an error.
     */
    async getPodcast(
        slug: string
    ) : Promise<ExploreServiceResult<ExplorePodcast>> {
        try {
            const podcast = await prisma.podcast.findUnique({
                where: { 
                    slug, 
                    published: true 
                },
                include: {
                    host: {select: { name: true }}
                }
            })

            if (!podcast) return { success: false, error: 'NOT_FOUND' };

            return {
                success: true,
                data: this.buildExplorePodcast({
                    ...podcast,
                    hostName: podcast.host.name
                })
            };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }
}