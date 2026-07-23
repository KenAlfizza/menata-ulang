import { prisma } from "../lib/prisma.ts";
import { storage } from "../lib/storage.ts";
import { PaginatedResult } from "../types/common.ts";
import { defaultPuckData, PuckOutputData } from "../types/puck.ts";
import { ResearcherServiceResult, CreateResearchData, MyResearchSummary, UpdateResearchData, UpdateResearchPageData } from "../types/services/researcher.ts";
import { ResearchRecord, ResearchFilter, ResearchPageRecord } from "../types/research.ts";

export const researcherService = {
   /**
     * Creates a new research, its associated thread, and an initial research page within a single database transaction.
     * @description
     * 1. Validates slug uniqueness before proceeding.
     * 2. Processes and saves the research image to storage.
     * 3. Executes a Prisma transaction to ensure atomicity:
     * - Creates a new thread.
     * - Creates the research record.
     * - Creates the initial research page.
     * 
     * @param {number} userId - The ID of the researcher creating the research.
     * @param {CreateResearchData} createResearchData - Object containing research details (slug, title, description, image, etc).
     * @returns {Promise<ResearcherServiceResult<ResearchRecord>>} A promise that resolves to:
     * - `success: true` with the created `ResearchRecord` if the operation completes.
     * - `success: false` with `SLUG_TAKEN` if the slug already exists.
     * - `success: false` with `INTERNAL_ERROR` if the transaction fails or an unexpected error occurs.
     * 
     * @example
     * const result = await researcherService.createResearch(userId, data);
     * if (!result.success) {
     *    if (result.error === 'SLUG_TAKEN') // handle conflict...
     * }
     */
    async createResearch(
        userId: number, 
        createResearchData: CreateResearchData,
    ) : Promise<ResearcherServiceResult<ResearchRecord>> 
    {
        const { slug, title, description, image } = createResearchData;

        try {
            // Check for slug existence outside the transaction to prevent database locks
            const existingResearch = await prisma.research.findUnique({
                where: { slug },
                select: { id: true }
            });

            if (existingResearch) return { success: false, error: 'SLUG_TAKEN'};

            // Process image asset storage safely if slug is clear
            let imageUrl: string | undefined;
            if (image) imageUrl = await storage.save(image, "researches");
            
            // Open transaction and write records
            return await prisma.$transaction(async (tx) => {
                const thread = await tx.thread.create({ data: {} });

                const research = await tx.research.create({
                    data: {
                        title: title,
                        description: description,
                        slug: slug,
                        researcherId: userId,
                        imageUrl: imageUrl || "",
                        threadId: thread.id,
                    }
                });

                const page = await tx.researchPage.create({
                    data: {
                        researchId: research.id,
                        puckData: defaultPuckData(title),
                    }
                });

                const researchRecord: ResearchRecord = {
                    id: research.id,
                    slug: research.slug,
                    title: research.title,
                    description: research.description,
                    createdAt: research.createdAt,
                    updatedAt: research.updatedAt,
                    researcherId: research.researcherId,
                    imageUrl: research.imageUrl,
                    published: research.published,
                    publishedAt: research.publishedAt,
                    heartsCount: research.heartsCount,
                    threadId: research.threadId,
                    page: {
                        id: page.id,
                        puckData: page.puckData as PuckOutputData,
                    }
                }

                return {
                    success: true,
                    data: researchRecord,
                };
            });
        } catch (error) {
            console.error("Database Transaction Failed:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },


    /**
     * Retrieves a research record by its unique ID for a specific researcher.
     * Performs an ownership check to ensure the research belongs to the requesting user.
     * Normalizes the image path for web-accessible URLs.
     * 
     * @param {string} researchId - The unique identifier of the research to retrieve.
     * @param {number} userId - The ID of the researcher requesting the research.
     * @returns {Promise<ResearcherServiceResult<ResearchRecord>>} - A promise resolving to a success object 
     * containing the research data, or a failure object with the specific error type.
     * 
     * * @example
     * const result = await researcherService.getResearchById("abc-123", 1);
     * if (result.success) {
     *      console.log(result.data.title);
     * }
     */
    async getResearchById(researchId: string, userId: number): Promise<ResearcherServiceResult<ResearchRecord>> {
        try {
            const research = await prisma.research.findUnique({
                where: { id: researchId },
                include: { page: true }
            });

            if (!research) return { success: false, error: 'NOT_FOUND' };
            
            // Authorization check: Ensure only the researcher can fetch this research
            if (research.researcherId !== userId) return { success: false, error: 'UNAUTHORIZED' };

            // Map to ResearchRecord (ensure imageUrl is normalized for URLs)
            const researchRecord: ResearchRecord = {
                ...research,
                imageUrl: research.imageUrl.replace(/\\/g, '/'),
                page: {
                    id: research.page[0].id,
                    puckData: research.page[0].puckData as PuckOutputData
                }
            };

            return { success: true, data: researchRecord };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Retrieves a research page data by its unique ID for a specific researcher.
     * Performs an ownership check to ensure the research belongs to the requesting user.
     * 
     * @param {string} pageId - The unique identifier of the page to retrieve.
     * @param {number} userId - The ID of the researcher requesting the research.
     * @returns {Promise<ResearcherServiceResult<ResearchPageRecord>>} - A promise resolving to a success object 
     * containing the research page data, or a failure object with the specific error type.
     * 
     * * @example
     * const result = await researcherService.getResearchPageById("abc-123", 1);
     * if (result.success) {
     *      console.log(result.data.id);
     * }
     */
    async getResearchPageById(pageId: string, userId: number): Promise<ResearcherServiceResult<ResearchPageRecord>> {
        try {
            const researchPageRecord = await prisma.researchPage.findUnique({
                where: { id: pageId },
                include:{research: true}
            });

            if (!researchPageRecord) return { success: false, error: 'NOT_FOUND' };
            
            // Authorization check: Ensure only the researcher can fetch this research
            if (researchPageRecord.research.researcherId !== userId) return { success: false, error: 'UNAUTHORIZED' };

            const researchPageRecordPrepared = {
                id: researchPageRecord.id,
                puckData: researchPageRecord.puckData,
            }
            
            return { success: true, data: researchPageRecordPrepared };
        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Updates an existing research and its associated data based on the provided partial update object.
     * Performs an ownership check to ensure the research belongs to the requesting researcher before 
     * proceeding with any modifications. Automatically handles file storage if a new image 
     * is provided and normalizes the image path for web accessibility. Check if slug is already used
     * 
     * @param {string} researchId - The unique identifier of the research to update.
     * @param {number} userId - The ID of the researcher requesting the update.
     * @param {UpdateResearchData} data - The partial data object containing fields to be updated.
     * 
     * @returns {Promise<ResearcherServiceResult<ResearchRecord>>} A promise that resolves to:
     * - `success: true` with the updated `ResearchRecord` if the operation completes.
     * - `success: false` with `NOT_FOUND` if the research does not exist.
     * - `success: false` with `UNAUTHORIZED` if the user does not own the research.
     * - `success: false` with `INTERNAL_ERROR` if the database operation fails.
     * 
     * @example
     * const updateData = { title: "New Title", published: true };
     * const result = await researcherService.updateResearch("abc-123", 1, updateData);
     * if (result.success) {
     *      console.log("Research updated:", result.data.id);
     * }
     */
    async updateResearch(
        researchId: string,
        userId: number,
        data: UpdateResearchData
    ): Promise<ResearcherServiceResult<ResearchRecord>> {
        try {
            // 1. Verify ownership and existence
            const existing = await prisma.research.findUnique({ 
                where: { id: researchId },
                include: { page: true }
            });
            if (!existing) return { success: false, error: 'NOT_FOUND' };
            if (existing.researcherId !== userId) return { success: false, error: 'UNAUTHORIZED' };

            const updatePayload: Parameters<typeof prisma.research.update>[0]['data'] = {};

            if (data.title !== undefined) updatePayload.title = data.title;
            if (data.description !== undefined) updatePayload.description = data.description;
            if (data.slug !== undefined) updatePayload.slug = data.slug;

            // Check for slug existence outside the transaction to prevent database locks
            if (updatePayload.slug) {
                const existingSlug = await prisma.research.findFirst({
                    where: { 
                        slug: data.slug,
                        NOT: { id: researchId } // Ignore the current research being updated
                    },
                    select: { id: true }
                });
                if (existingSlug) return { success: false, error: 'SLUG_TAKEN'};
            }

            // If a new image was uploaded and saved, update the imageUrl field
            if (data.image) {
                const imageUrl = await storage.save(data.image, "researches");
                updatePayload.imageUrl = imageUrl.replace(/\\/g, '/');
            }

            // Update in database using only the provided fields
            const updated = await prisma.research.update({
                where: { id: researchId },
                data: updatePayload,
                include: { 
                    page: {
                        select: { id: true, puckData: true }
                    } 
                }
            });

            // 4. Create a record object
            const researchRecord: ResearchRecord = {
                ...updated,
                page: {
                    id: updated.page[0].id,
                    puckData: updated.page[0].puckData as PuckOutputData,
                }
            };

            return { success: true, data: researchRecord}

        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Updates an existing research page data.
     * Performs an ownership check to ensure the research page belongs to the requesting researcher before 
     * proceeding with any modifications.
     * 
     * @param {string} pageId - The unique identifier of the research to update.
     * @param {number} userId - The ID of the researcher requesting the update.
     * @param {UpdateResearchPageData} data - The page data object containing fields to be updated.
     * 
     * @returns {Promise<ResearcherServiceResult<ResearchPageRecord>>} A promise that resolves to:
     * - `success: true` with the updated `ResearchPageRecord` if the operation completes.
     * - `success: false` with `NOT_FOUND` if the research does not exist.
     * - `success: false` with `UNAUTHORIZED` if the user does not own the research.
     * - `success: false` with `INTERNAL_ERROR` if the database operation fails.
     * 
     * @example
     * const updateData = { puckData };
     * const result = await researcherService.updateResearchPage("abc-123", 1, updateData);
     * if (result.success) {
     *      console.log("Research page updated:", result.data.id);
     * }
     */
    async updateResearchPage(
        pageId: string,
        userId: number,
        data: UpdateResearchPageData
    ): Promise<ResearcherServiceResult<ResearchPageRecord>> {
        try {
            // 1. Verify ownership and existence
            const existing = await prisma.researchPage.findUnique({ 
                where: { id: pageId },
                include: { research: true }
            });
            if (!existing) return { success: false, error: 'NOT_FOUND' };
            if (existing.research.researcherId !== userId) return { success: false, error: 'UNAUTHORIZED' };

            // 2. Update in database
            const updatedResearchPage = await prisma.researchPage.update({
                where: { id: pageId },
                data: data,
            });

            return { success: true, data: updatedResearchPage}

        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },

    /**
     * Updates the publish status of a research entity.
     * Performs an ownership check to ensure the research belongs to the requesting researcher.
     * 
     * @param {string} researchId - The unique identifier of the research.
     * @param {number} userId - The ID of the researcher requesting the status change.
     * @param {boolean} published - The target publish state.
     * 
     * @returns {Promise<ResearcherServiceResult<ResearchRecord>>}
     */
    async setResearchPublishStatus(
        researchId: string,
        userId: number,
        published: boolean
    ): Promise<ResearcherServiceResult<ResearchRecord>> {
        try {
            // Verify ownership and existence
            const existing = await prisma.research.findUnique({ 
                where: { id: researchId },
                include: { 
                    page: {
                        select: { id: true, puckData: true }
                    } 
                }
            });
            if (!existing) return { success: false, error: 'NOT_FOUND' };
            if (existing.researcherId !== userId) return { success: false, error: 'UNAUTHORIZED' };

            // Update in database
            const updated = await prisma.research.update({
                where: { id: researchId },
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

            // Create a record object
            const researchRecord: ResearchRecord = {
                ...updated,
                page: {
                    id: updated.page[0].id,
                    puckData: updated.page[0].puckData as PuckOutputData,
                }
            };

            return { success: true, data: researchRecord };

        } catch (error) {
            console.error("Database Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },


    /**
     * Deletes a research and its associated records by its unique ID.
     * Performs an ownership check to ensure the research belongs to the requesting researcher.
     * 
     * @param {string} researchId - The unique identifier of the research to delete.
     * @param {number} userId - The ID of the researcher requesting the deletion.
     * @returns {Promise<ResearcherServiceResult<boolean>>} A promise resolving to `success: true` 
     * if the deletion was successful, or an error object if it failed or is unauthorized.
     * 
     * @example
     * const result = await researcherService.deleteResearch("abc-123", 1);
     *      if (result.success) console.log("Research deleted successfully");
     */
    async deleteResearch(
        researchId: string,
        userId: number
    ): Promise<ResearcherServiceResult<boolean>> {
        try {
            // 1. Fetch record to verify ownership and retrieve the image key
            const existing = await prisma.research.findUnique({
                where: { id: researchId },
                select: { researcherId: true, imageUrl: true }
            });

            if (!existing) return { success: false, error: 'NOT_FOUND' };
            if (existing.researcherId !== userId) return { success: false, error: 'UNAUTHORIZED' };

            // Perform deletion within a transaction
            // We use a transaction to ensure that the database and file system
            // operations are synchronized as closely as possible.
            await prisma.$transaction(async (tx) => {
                await tx.research.delete({ where: { id: researchId } });
                
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
     * Retrieves a paginated list of research authored by a specific user.
     * 
     * @param {number} userId - The ID of the researcher.
     * @param {ResearchFilter} filter - Pagination, search, and sorting criteria.
     * @returns {Promise<ResearcherServiceResult<PaginatedResult<MyResearchSummary>>>} 
     * A result object containing the paginated data or an error state.
     * 
     * @example
     * const result = await researcherService.getMyResearches(1, { page: 1, limit: 10, sort: 'updatedAt' });
     * if (result.success) console.log(result.data.items);
     */
    async getMyResearches(
        userId: number,
        filter: ResearchFilter
    ): Promise<ResearcherServiceResult<PaginatedResult<MyResearchSummary>>> {
        try {
            const { search, limit, page, sort = 'updatedAt', order = 'desc' } = filter;
            const skip = (page - 1) * limit;

            const where = {
                researcherId: userId,
                ...(search && { title: { contains: search, mode: 'insensitive' as const } })
            };

            const [researches, total] = await prisma.$transaction([
                prisma.research.findMany({
                    where,
                    include: { page: true },
                    take: limit,
                    skip,
                    orderBy: { [sort]: order }
                }),
                prisma.research.count({ where })
            ]);

            const items: MyResearchSummary[] = researches.map(r => ({
                id: r.id,
                title: r.title,
                description: r.description,
                updatedAt: r.updatedAt,
                imageUrl: r.imageUrl,
                published: r.published,
                heartsCount: r.heartsCount,
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
            console.error("Fetch Researches Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    },


    /**
     * Retrieves the 3 most recently updated research for the dashboard.
     * Uses the MyResearchSummary type to return only the necessary fields.
     * @param {number} userId - The researcher's ID.
     * @returns {Promise<ResearcherServiceResult<MyResearchSummary[]>>}
     * @example const result = await researcherService.getMyRecentResearches(1);
     */
    async getMyRecentResearches(
        userId: number,
    ): Promise<ResearcherServiceResult<MyResearchSummary[]>> {
        try {
            const researches = await prisma.research.findMany({
                where: { researcherId: userId },
                take: 2,
                orderBy: {updatedAt: "desc"}
            })

            const items: MyResearchSummary[] = researches.map(r => ({
                id: r.id,
                title: r.title,
                description: r.description,
                updatedAt: r.updatedAt,
                imageUrl: r.imageUrl,
                published: r.published,
                heartsCount: r.heartsCount,
            }));

            return { 
                success: true, 
                data: items,
            };
        } catch (error) {
            console.error("Fetch Recent Researches Error:", error);
            return { success: false, error: 'INTERNAL_ERROR' };
        }
    }
};
