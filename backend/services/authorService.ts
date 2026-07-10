import { prisma, Prisma } from "../lib/prisma.ts";
import { storage } from "../lib/storage.ts";
import { defaultPuckData } from "../types/puck.ts";
import { AuthorServiceResult, CreateStoryData, UpdateStoryData } from "../types/services/author.ts";
import { StoryRecord } from "../types/story.ts";

export const authorService = {
   /**
     * Creates a new story, its associated thread, and an initial story page within a single database transaction.
     * @description
     * 1. Validates slug uniqueness before proceeding.
     * 2. Processes and saves the story image to storage.
     * 3. Executes a Prisma transaction to ensure atomicity:
     * - Creates a new thread.
     * - Creates the story record.
     * - Creates the initial story page.
     * 
     * @param {number} userId - The ID of the author creating the story.
     * @param {CreateStoryData} createStoryData - Object containing story details (slug, title, description, image, etc).
     * @returns {Promise<AuthorServiceResult<StoryRecord>>} A promise that resolves to:
     * - `success: true` with the created `StoryRecord` if the operation completes.
     * - `success: false` with `SLUG_TAKEN` if the slug already exists.
     * - `success: false` with `INTERNAL_ERROR` if the transaction fails or an unexpected error occurs.
     * 
     * @example
     * const result = await authorService.createStory(userId, data);
     * if (!result.success) {
     *    if (result.error === 'SLUG_TAKEN') // handle conflict...
     * }
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
     * Retrieves a story record by its unique ID for a specific author.
     * Performs an ownership check to ensure the story belongs to the requesting user.
     * Normalizes the image path for web-accessible URLs.
     * 
     * @param {string} storyId - The unique identifier of the story to retrieve.
     * @param {number} userId - The ID of the author requesting the story.
     * @returns {Promise<AuthorServiceResult<StoryRecord>>} - A promise resolving to a success object 
     * containing the story data, or a failure object with the specific error type.
     * 
     * * @example
     * const result = await authorService.getStoryById("abc-123", 1);
     * if (result.success) {
     *      console.log(result.data.title);
     * }
     */
    async getStoryById(storyId: string, userId: number): Promise<AuthorServiceResult<StoryRecord>> {
        try {
            const story = await prisma.story.findUnique({
                where: { id: storyId },
                include: { page: true }
            });

            if (!story) return { success: false, error: 'NOT_FOUND' };
            
            // Authorization check: Ensure only the author can fetch this story
            if (story.authorId !== userId) return { success: false, error: 'UNAUTHORIZED' };

            // Map to StoryRecord (ensure imageUrl is normalized for URLs)
            const storyRecord: StoryRecord = {
                ...story,
                imageUrl: story.imageUrl.replace(/\\/g, '/'),
                page: {
                    id: story.page[0].id,
                    puckData: story.page[0].puckData as Prisma.InputJsonArray
                }
            };

            return { success: true, data: storyRecord };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Updates an existing story and its associated data based on the provided partial update object.
     * Performs an ownership check to ensure the story belongs to the requesting author before 
     * proceeding with any modifications. Automatically handles file storage if a new image 
     * is provided and normalizes the image path for web accessibility. Check if slug is already used
     * 
     * @param {string} storyId - The unique identifier of the story to update.
     * @param {number} userId - The ID of the author requesting the update.
     * @param {UpdateStoryData} data - The partial data object containing fields to be updated.
     * 
     * @returns {Promise<AuthorServiceResult<StoryRecord>>} A promise that resolves to:
     * - `success: true` with the updated `StoryRecord` if the operation completes.
     * - `success: false` with `NOT_FOUND` if the story does not exist.
     * - `success: false` with `UNAUTHORIZED` if the user does not own the story.
     * - `success: false` with `INTERNAL_ERROR` if the database operation fails.
     * - `success: false` with `SLUG_USED` if the slug is already taken.
     * 
     * @example
     * const updateData = { title: "New Title", published: true };
     * const result = await authorService.updateStory("abc-123", 1, updateData);
     * if (result.success) {
     *      console.log("Story updated:", result.data.id);
     * }
     */
    async updateStory(
        storyId: string,
        userId: number,
        data: UpdateStoryData
    ): Promise<AuthorServiceResult<StoryRecord>> {
        try {
            // 1. Verify ownership and existence
            const existing = await prisma.story.findUnique({ 
                where: { id: storyId },
                include: { page: true }
            });
            if (!existing) return { success: false, error: 'NOT_FOUND' };
            if (existing.authorId !== userId) return { success: false, error: 'UNAUTHORIZED' };

            // Check for slug existence outside the transaction to prevent database locks
            if (data.slug) {
                const existingSlug = await prisma.story.findUnique({
                    where: { slug: data.slug },
                    select: { id: true }
                });
                if (existingSlug) return { success: false, error: 'SLUG_TAKEN'};
            }

            // 2. Handle image update (if provided)
            let imageUrl = existing.imageUrl;
            if (data.image) {
                imageUrl = await storage.save(data.image, "stories");
                imageUrl = imageUrl.replace(/\\/g, '/');
            }

            // 3. Update in database
            const updated = await prisma.story.update({
                where: { id: storyId },
                data: {
                    title: data.title ?? existing.title,
                    description: data.description ?? existing.description,
                    slug: data.slug ?? existing.slug,
                    published: data.published ?? existing.published,
                    imageUrl: imageUrl,
                    // Update page puckData if provided
                    page: data.puckData ? {
                        update: { where: { id: existing.page[0].id }, data: { puckData: data.puckData } }
                    } : undefined
                },
                include: { page: true }
            });

            // 4. Map back to StoryRecord
            const storyRecord: StoryRecord = {
                ...updated,
                page: {
                    id: updated.page[0].id,
                    puckData: updated.page[0].puckData as Prisma.InputJsonArray
                }
            };

            return { success: true, data: storyRecord };
        } catch (error) {
            console.error("Update Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }
};