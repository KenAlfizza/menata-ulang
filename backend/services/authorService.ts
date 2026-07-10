import { success } from "zod";
import { prisma, Prisma } from "../lib/prisma.ts";
import { storage } from "../lib/storage.ts";
import { defaultPuckData } from "../types/puck.ts";
import { AuthorServiceResult, CreateStoryData, UpdateStoryData } from "../types/services/author.ts";
import { StoryRecord } from "../types/story.ts";
import { error } from "node:console";


export const authorService = {
    /**
     * Creates a new story, its associated thread, and the initial story page.
     * Throws an error immediately if the slug already exists in the database.
     * 
     * @param {number} userId - The ID of the author creating the story.
     * @param {CreateStoryData} createStoryData - The story data containing title, description, slug, image (optional), puckData.
     * @returns {Promise<{story: any, page: any}>} The created story and story page records.
     * @throws {Error} If the slug is already taken or the database transaction fails.
     */
    async createStory(
        userId: number, 
        createStoryData: CreateStoryData,
    ) : Promise<AuthorServiceResult<StoryRecord>> 
    {
        const { slug, title, description, image } = createStoryData;

        try {
            // Check for slug existence outside the transaction to prevent database locks
            const existingStory = await prisma.story.findUnique({
                where: { slug },
                select: { id: true }
            });

            if (existingStory) return { success: false, error: 'SLUG_TAKEN'};

            // Process image asset storage safely if slug is clear
            let imageUrl: string | undefined;
            if (image) imageUrl = await storage.save(image, "stories");
            
            // Open transaction and write records
            return await prisma.$transaction(async (tx) => {
                const thread = await tx.thread.create({ data: {} });

                const story = await tx.story.create({
                    data: {
                        title: title,
                        description: description,
                        slug: slug,
                        authorId: userId,
                        imageUrl: imageUrl || "",
                        threadId: thread.id,
                    }
                });

                const page = await tx.storyPage.create({
                    data: {
                        storyId: story.id,
                        puckData: defaultPuckData(title),
                    }
                });

                const storyRecord: StoryRecord = {
                    id: story.id,
                    slug: story.slug,
                    title: story.title,
                    description: story.description,
                    createdAt: story.createdAt,
                    updatedAt: story.updatedAt,
                    authorId: story.authorId,
                    image: image,
                    imageUrl: story.imageUrl,
                    published: story.published,
                    publishedAt: story.publishedAt,
                    heartsCount: story.heartsCount,
                    threadId: story.threadId,
                    page: {
                        id: page.id,
                        puckData: page.puckData as Prisma.InputJsonArray,
                    }
                }

                return {
                    success: true,
                    data: storyRecord,
                };
            });
        } catch (error) {
            console.error("Database Transaction Failed:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Updates an existing story and its associated page content.
     * Handles dynamic transaction scoping and file replacements without runtime redundancy.
     * 
     * @param {string} storyId - The CUID unique identifier of the story to update.
     * @param {UpdateStoryData} updateStoryData - The payload containing partial fields.
     * @param {Object} existingState - Metadata markers extracted during authentication.
     * @param {string} existingState.imageUrl - The active image target asset string path.
     * @param {string} [existingState.pageId] - The unique page CUID, if parsed.
     * @returns {Promise<{success: boolean}>} Complete event resolution callback.
     * @throws {Error} Unique constraint updates or transaction lockouts.
     */
    async updateStory(
        storyId: string,
        updateStoryData: UpdateStoryData,
        existingState: { imageUrl: string; pageId?: string } 
    ) {
        const { slug, title, description, image, published, puckData } = updateStoryData;

        // 1. Defend against Unique Constraint errors before opening transaction loops
        if (slug !== undefined) {
            const slugConflict = await prisma.story.findFirst({
                where: {
                    slug: slug,
                    NOT: { id: storyId } // Ensure we don't trip over our own active record
                },
                select: { id: true }
            });

            if (slugConflict) {
                throw new Error(`The slug "${slug}" is already taken by another story.`);
            }
        }

        // 2. Evaluate storage alterations cleanly outside the database runtime context
        let newImageUrl = existingState.imageUrl;
        let fileUploaded = false;

        if (image instanceof File) {
            newImageUrl = await storage.save(image, "stories");
            fileUploaded = true;
        }

        // 3. Assemble dynamic batch actions array to strip redundancy
        const operations = [];

        const hasStoryChanges = 
            title !== undefined || 
            description !== undefined || 
            slug !== undefined || 
            published !== undefined || 
            fileUploaded;

        if (hasStoryChanges) {
            operations.push(
                prisma.story.update({
                    where: { id: storyId },
                    data: {
                        title: title ?? undefined,
                        description: description ?? undefined,
                        slug: slug ?? undefined,
                        imageUrl: newImageUrl,
                        published: published ?? undefined,
                        publishedAt: published === true ? new Date() : undefined // Auto-stamps updates
                    }
                })
            );
        }

        // 4. Update the layout table only if requested and structural targets exist
        if (puckData !== undefined && existingState.pageId) {
            operations.push(
                prisma.storyPage.update({
                    where: { id: existingState.pageId }, 
                    data: { 
                        puckData: puckData as unknown as Prisma.InputJsonValue, 
                    }
                })
            );
        }

        // 5. Fire sequential queries concurrently under atomic transaction coverage
        if (operations.length > 0) {
            await prisma.$transaction(operations);
        }

        // 6. Clean up abandoned cloud image assets asynchronously if replaced
        if (fileUploaded && existingState.imageUrl) {
            await storage.delete(existingState.imageUrl).catch(console.error);
        }

        return { success: true };
    },
};