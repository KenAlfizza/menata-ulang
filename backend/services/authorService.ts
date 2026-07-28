import { prisma } from "../lib/prisma.ts";
import { storage } from "../lib/storage.ts";
import { PaginatedResult } from "../types/common.ts";
import { defaultPuckData, PuckOutputData } from "../types/puck.ts";
import { AuthorServiceResult, CreateStoryData, MyStorySummary, UpdateStoryData, UpdateStoryPageData } from "../types/services/author.ts";
import { StoryRecord, StoryFilter, StoryPageRecord } from "../types/story.ts";

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
                        puckData: page.puckData as PuckOutputData,
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
                    puckData: story.page[0].puckData as PuckOutputData
                }
            };

            return { success: true, data: storyRecord };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Retrieves a story page data by its unique ID for a specific author.
     * Performs an ownership check to ensure the story belongs to the requesting user.
     * 
     * @param {string} pageId - The unique identifier of the page to retrieve.
     * @param {number} userId - The ID of the author requesting the story.
     * @returns {Promise<AuthorServiceResult<StoryRecord>>} - A promise resolving to a success object 
     * containing the story page data, or a failure object with the specific error type.
     * 
     * * @example
     * const result = await authorService.getStoryPageById("abc-123", 1);
     * if (result.success) {
     *      console.log(result.data.id);
     * }
     */
    async getStoryPageById(pageId: string, userId: number): Promise<AuthorServiceResult<StoryPageRecord>> {
        try {
            const storyPageRecord = await prisma.storyPage.findUnique({
                where: { id: pageId },
                include: {story: true}
            });

            if (!storyPageRecord) return { success: false, error: 'NOT_FOUND' };
            
            // Authorization check: Ensure only the author can fetch this story
            if (storyPageRecord.story.authorId !== userId) return { success: false, error: 'UNAUTHORIZED' };

            const storyPageRecordPrepared = {
                id: storyPageRecord.id,
                puckData: storyPageRecord.puckData,
            }
            
            return { success: true, data: storyPageRecordPrepared };
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

            const updatePayload: Parameters<typeof prisma.story.update>[0]['data'] = {};

            if (data.title !== undefined) updatePayload.title = data.title;
            if (data.description !== undefined) updatePayload.description = data.description;
            if (data.slug !== undefined) updatePayload.slug = data.slug;

            // Check for slug existence outside the transaction to prevent database locks
            if (updatePayload.slug) {
                const existingSlug = await prisma.story.findFirst({
                    where: { 
                        slug: data.slug,
                        NOT: { id: storyId } // Ignore the current story being updated
                    },
                    select: { id: true }
                });
                if (existingSlug) return { success: false, error: 'SLUG_TAKEN'};
            }

            // If a new image was uploaded and saved, update the imageUrl field
            if (data.image) {
                const imageUrl = await storage.save(data.image, "stories");
                updatePayload.imageUrl = imageUrl.replace(/\\/g, '/');
            }

            // Update in database using only the provided fields
            const updated = await prisma.story.update({
                where: { id: storyId },
                data: updatePayload,
                include: { 
                    page: {
                        select: { id: true, puckData: true }
                    } 
                }
            });

            // 4. Create a record object
            const storyRecord: StoryRecord = {
                ...updated,
                page: {
                    id: updated.page[0].id,
                    puckData: updated.page[0].puckData as PuckOutputData,
                }
            };

            return { success: true, data: storyRecord}

        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Updates an existing story page data.
     * Performs an ownership check to ensure the story page belongs to the requesting author before 
     * proceeding with any modifications.
     * 
     * @param {string} pageId - The unique identifier of the story to update.
     * @param {number} userId - The ID of the author requesting the update.
     * @param {UpdateStoryData} data - The page data object containing fields to be updated.
     * 
     * @returns {Promise<AuthorServiceResult<StoryPageRecord>>} A promise that resolves to:
     * - `success: true` with the updated `StoryPageRecord` if the operation completes.
     * - `success: false` with `NOT_FOUND` if the story does not exist.
     * - `success: false` with `UNAUTHORIZED` if the user does not own the story.
     * - `success: false` with `INTERNAL_ERROR` if the database operation fails.
     * 
     * @example
     * const updateData = { puckData };
     * const result = await authorService.updateStoryPage("abc-123", 1, updateData);
     * if (result.success) {
     *      console.log("Story page updated:", result.data.id);
     * }
     */
    async updateStoryPage(
        pageId: string,
        userId: number,
        data: UpdateStoryPageData
    ): Promise<AuthorServiceResult<StoryPageRecord>> {
        try {
            // 1. Verify ownership and existence
            const existing = await prisma.storyPage.findUnique({ 
                where: { id: pageId },
                include: { story: true }
            });
            if (!existing) return { success: false, error: 'NOT_FOUND' };
            if (existing.story.authorId !== userId) return { success: false, error: 'UNAUTHORIZED' };

            // 2. Update in database
            const updatedStoryPage = await prisma.storyPage.update({
                where: { id: pageId },
                data: data,
            });

            return { success: true, data: updatedStoryPage}

        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Updates the publish status of a story entity.
     * Performs an ownership check to ensure the story belongs to the requesting user.
     * 
     * @param {string} storyId - The unique identifier of the story.
     * @param {number} userId - The ID of the user requesting the status change.
     * @param {boolean} published - The target publish state.
     * 
     * @returns {Promise<AuthorServiceResult<StoryRecord>>}
     */
    async setStoryPublishStatus(
        storyId: string,
        userId: number,
        published: boolean
    ): Promise<AuthorServiceResult<StoryRecord>> {
        try {
            // Verify ownership and existence
            const existing = await prisma.story.findUnique({ 
                where: { id: storyId },
                include: { 
                    page: {
                        select: { id: true, puckData: true }
                    } 
                }
            });
            if (!existing) return { success: false, error: 'NOT_FOUND' };
            // Adjust this field name based on your actual schema (e.g., authorId, ownerId)
            if (existing.authorId !== userId) return { success: false, error: 'UNAUTHORIZED' };

            // Update in database
            const updated = await prisma.story.update({
                where: { id: storyId },
                data: { 
                    published,
                    publishedAt: published ? (existing.publishedAt || new Date()) : null
                },
                include: { 
                    page: {
                        select: { id: true, puckData: true }
                    } 
                }
            });

            // Create a story record object (adjust type to match your StoryRecord definition)
            const storyRecord: StoryRecord = {
                ...updated,
                page: {
                    id: updated.page[0].id,
                    puckData: updated.page[0].puckData as PuckOutputData,
                }
            };

            return { success: true, data: storyRecord };

        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Deletes a story and its associated records by its unique ID.
     * Performs an ownership check to ensure the story belongs to the requesting author.
     * 
     * @param {string} storyId - The unique identifier of the story to delete.
     * @param {number} userId - The ID of the author requesting the deletion.
     * @returns {Promise<AuthorServiceResult<boolean>>} A promise resolving to `success: true` 
     * if the deletion was successful, or an error object if it failed or is unauthorized.
     * 
     * @example
     * const result = await authorService.deleteStory("abc-123", 1);
     *      if (result.success) console.log("Story deleted successfully");
     */
    async deleteStory(
        storyId: string,
        userId: number
    ): Promise<AuthorServiceResult<boolean>> {
        try {
            // 1. Fetch record to verify ownership and retrieve the image key
            const existing = await prisma.story.findUnique({
                where: { id: storyId },
                select: { authorId: true, imageUrl: true }
            });

            if (!existing) return { success: false, error: 'NOT_FOUND' };
            if (existing.authorId !== userId) return { success: false, error: 'UNAUTHORIZED' };

            // Perform deletion within a transaction
            // We use a transaction to ensure that the database and file system
            // operations are synchronized as closely as possible.
            await prisma.$transaction(async (tx) => {
                await tx.story.delete({ where: { id: storyId } });
                
                // 3. Delete the file if an imageUrl exists
                if (existing.imageUrl) {
                    await storage.delete(existing.imageUrl);
                }
            });

            return { success: true, data: true };
        } catch (error) {
            console.error("Delete Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Retrieves a paginated list of stories authored by a specific user.
     * 
     * @param {number} userId - The ID of the author.
     * @param {StoryFilter} filter - Pagination, search, and sorting criteria.
     * @returns {Promise<AuthorServiceResult<PaginatedResult<StoryRecord>>>} 
     * A result object containing the paginated data or an error state.
     * 
     * @example
     * const result = await authorService.getMyStories(1, { page: 1, limit: 10, sort: 'updatedAt' });
     * if (result.success) console.log(result.data.items);
     */
    async getMyStories(
        userId: number,
        filter: StoryFilter
    ): Promise<AuthorServiceResult<PaginatedResult<MyStorySummary>>> {
        try {
            const { search, limit, page, sort = 'updatedAt', order = 'desc' } = filter;
            const skip = (page - 1) * limit;

            const where = {
                authorId: userId,
                ...(search && { title: { contains: search, mode: 'insensitive' as const } })
            };

            const [stories, total] = await prisma.$transaction([
                prisma.story.findMany({
                    where,
                    include: { page: true },
                    take: limit,
                    skip,
                    orderBy: { [sort]: order }
                }),
                prisma.story.count({ where })
            ]);

            const items: MyStorySummary[] = stories.map(s => ({
                id: s.id,
                title: s.title,
                description: s.description,
                updatedAt: s.updatedAt,
                imageUrl: s.imageUrl,
                published: s.published,
                heartsCount: s.heartsCount,
            }));

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
            console.error("Fetch Stories Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },


    /**
     * Retrieves the 3 most recently updated stories for the dashboard.
     * Uses the MyStorySummary type to return only the necessary fields.
     * @param {number} userId - The author's ID.
     * @returns {Promise<AuthorServiceResult<MyStorySummary[]>>}
     * @example const result = await authorService.getMyStories(1);
     */
    async getMyRecentStories(
        userId: number,
    ): Promise<AuthorServiceResult<MyStorySummary[]>> {
        try {
            const stories = await prisma.story.findMany({
                where: { authorId: userId },
                take: 3,
                orderBy: {updatedAt: "desc"}
            })

            const items: MyStorySummary[] = stories.map(s => ({
                id: s.id,
                title: s.title,
                description: s.description,
                updatedAt: s.updatedAt,
                imageUrl: s.imageUrl,
                published: s.published,
                heartsCount: s.heartsCount,
            }));

            return { 
                success: true, 
                data: items,
            };
        } catch (error) {
            console.error("Fetch Recent Stories Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }
};