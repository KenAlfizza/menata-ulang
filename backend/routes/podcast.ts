import { Hono } from "hono";
import type { AppVariables } from "../types.ts";

// Library imports
import { Prisma, prisma } from "../lib/prisma.ts";
import { authMiddleware } from "../middleware/auth.ts";

// Validators
import { validate } from "../lib/validators/index.ts";
import { 
    podcastPostSchema, 
    podcastGetListSchema, 
    podcastGetByIdSchema,
    podcastPatchParamSchema,
    podcastPatchFormSchema,
    podcastDeleteParamSchema
} from "../lib/validators/podcast.ts";

// Storage service
import { StorageDisk } from "../services/storageDisk.ts";
import { StorageProvider } from "../services/storageInterface.ts";
// Storage library
import { silentDelete } from "../lib/storage.ts";

// Media service
import { getAudioDuration } from "../services/audio.ts";


const isProduction = Deno.env.get("DENO_ENV") === "production" || 
                     Deno.env.get("DENO_REGION") !== undefined;

const storage: StorageProvider = isProduction
  ? new StorageDisk() // Change this to AWS A3 or Clouldflare R2
  : new StorageDisk();

const podcast = new Hono<{ Variables: AppVariables}>();

/**
 * GET / - List podcast
 *
 * Returns an array of podcast
 *
 * Middleware: `validate("form", podcastGetByIdSchema)`.
 * Behavior: returns list podcast given the query
 * Query:
 * - page   : page number
 * - limit  : entry limit
 * - search : search keyword
 * 
 * Responses:
 * - 200: podcast list
 * - 500: internal server error
 */
podcast.get("/", validate("query", podcastGetListSchema), async (c) => {
    try {
        const q = c.req.valid("query");
        const page = q.page ?? 1;
        const limit = q.limit ?? 10;
        const search = q.search?.trim();

        const where: Prisma.PodcastWhereInput = {
            ...(search && {
                AND: {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ],
                },
            }),
        };

        const [total, podcasts] = await prisma.$transaction([
        // The count of total published stories (for pagination)
        prisma.podcast.count({ where }),
        // The stories with pagination and author details
        prisma.podcast.findMany({
            where,
            select: {
                id: true,
                title: true,
                description: true,
                imageUrl: true,
                audioUrl: true,
                createdAt: true,
                host: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        ]);
        return c.json({ data: podcasts, meta: { page, limit, total } });
    } catch {
        return c.json({ error: "Internal server error"}, 500);
    }
});

/**
 * GET /:id - Fetch a single podcast
 *
 * Middleware: `validate("form", podcastGetByIdSchema)`.
 * 
 * Behavior: returns the podcast (including host.name) only if it exists
 * Param:
 * - id : podcast id
 * 
 * Responses:
 * - 200: podcast payload
 * - 404: podcast not found
 * - 500: internal server error
 */
podcast.get("/:id", validate("param", podcastGetByIdSchema), async (c) => {
    // The the podcast id
    const { id } = c.req.valid("param");

    // Fetch podcast and other details from database
    try {
        const storedPodcast = await prisma.podcast.findUnique({ 
            where: { id },
            include: { host: true }
        });
        if (!storedPodcast) return c.json({ error: "Podcast is not found" }, 404)
        
        const host = storedPodcast.host;
        const podcast = {
            title: storedPodcast.title,
            host: host.name,
            description: storedPodcast.description,
            imageUrl: storedPodcast.imageUrl,
            audioUrl: storedPodcast.audioUrl,
        }
        return c.json({ message: "Podcast fetched", ok:true, podcast});

    } catch {
        return c.json({ error: "Internal server error" }, 500);
    }
});

/**
 * POST / - Upload a new podcast
 * 
 * Middleware: `authMiddleware`, `validate("form", podcastPostSchema)`.
 * Autorization: users with role `HOST` or `SUPERUSER` may upload a podcast
 * 
 * Form:
 * - title      : podcast title
 * - description: podcast description
 * - file       : podcast audio file
 * - image      : podcast cover file
 * 
 * Behavior: 
 * - uploads the provided file and image
 * - create the podcast with the current user as host
 * - if the database creation failed, delete the uploaded files
 * 
 * Responses:
 * - 200: podcast payload
 * - 403: forbidden
 * - 500: internal server error
 */
podcast.post("/",
    authMiddleware,
    validate("form", podcastPostSchema),
    async (c) => {
        // Validate current user permission
        const user = c.get("user");
        if (!["HOST", "SUPERUSER"].includes(user.role)) {
            return c.json({ error: "Forbidden" }, 403);
        }

        // Get the podcast elements
        const { title, description, audio, image } = c.req.valid("form");

        // Track uploaded files for rollback and cleanup
        const toRollback: string[] = [];

        // Store to database
        try {
            // Upload audio
            const audioUrl = await storage.save(audio, "podcasts/audio");
            const duration = await getAudioDuration(audioUrl);
            toRollback.push(audioUrl);

            // Upload image
            const imageUrl = await storage.save(image, "podcasts/images");
            toRollback.push(imageUrl);
            
            // Database create
            const podcast = await prisma.podcast.create({
                data: {
                    title,
                    description,
                    duration,
                    audioUrl,
                    imageUrl,
                    host: {connect: {id: user.id}},
                }
            });
            return c.json({ message: "Podcast created", ok: true, podcast});
        } catch {
            // Database failure, delete uploaded audio and image to prevent orphaned files
            await Promise.allSettled(toRollback.map(url => silentDelete(storage, url, "uploaded file")))
            return c.json({ error: "Internal server error"}, 500);
        }
    }
);

/**
 * PATCH / - Update a podcast
 * 
 * Middleware: `authMiddleware`, `validate("param", podcastDeleteParamSchema)`.
 * Authorization: users with role `HOST` who own the podcast, or `SUPERUSER` may patch a podcast
 * 
 * Form:
 * - title      : podcast title
 * - description: podcast description
 * - audio      : podcast audio file
 * - image      : podcast cover file
 * 
 * Behavior: 
 * - uploads the provided audio and image (if provided)
 * - update the podcast title, description, audio, image (if provided)
 * - if the database update fail, delete the uploaded files, rollback any changes
 * - if the databse update success, clean up the old files
 * Responses:
 * - 200: podcast payload
 * - 403: forbidden
 * - 500: internal server error
 * 
 */
podcast.patch("/:id",
    authMiddleware,
    validate("param", podcastPatchParamSchema),
    validate("form", podcastPatchFormSchema),
    async (c) => {
        // Validate current user permission
        const user = c.get("user");
        if (!["HOST", "SUPERUSER"].includes(user.role)) {
            return c.json({ error: "Forbidden" }, 403);
        }

        // Get the podcast elements
        const { id } = c.req.valid("param");
        const { title, description, audio, image } = c.req.valid("form");

        // Update data payload
        const data: Record<string, unknown> = {};

        // Track uploaded files for rollback and cleanup
        const toRollback: string[] = [];
        const toCleanup: string[] = [];

        try {
            // Check podcast exists
            const storedPodcast = await prisma.podcast.findUnique({ 
                where: { id }, 
                include: { host: true } 
            });

            if (!storedPodcast) return c.json({ error: "Podcast does not exist" }, 404);
            
            // Validate ownership 
            const isOwner = storedPodcast.hostId === user.id;
            const isSuperUser = user.role === "SUPERUSER";
            if (!isOwner && !isSuperUser) { 
                return c.json({ error: "Forbidden" }, 403); 
            }

            // Build update data payload
            if (title !== undefined) data.title = title;
            if (description !== undefined) data.description = description;

            // Upload phase
            // Any exeption triggers catch, then rollbacks via toRollback
            if (audio !== undefined) {
                // Upload audio
                const audioUrl = await storage.save(audio, "podcasts/audio");
                toRollback.push(audioUrl);
                toCleanup.push(storedPodcast.audioUrl);

                data.audioUrl= audioUrl;
                data.duration= await getAudioDuration(audioUrl);
            }
            if (image !== undefined) {
                // Upload image
                const imageUrl = await storage.save(image, "podcasts/images");
                toRollback.push(imageUrl);
                toCleanup.push(storedPodcast.imageUrl);
                
                data.imageUrl= imageUrl;
            }

            // Database update
            // If there is an exception, catch delete everything in toRollback
            const updatedPodcast = await prisma.podcast.update({ 
                where: { id }, data
            });

            // Cleanup existing image and audio
            await Promise.allSettled(toCleanup.map(url => silentDelete(storage, url, "old file")));

            return c.json({ message: "Podcast updated", ok: true, podcast: updatedPodcast });

        } catch {
            // Rollback every file uploaded before failure
            await Promise.allSettled(toRollback.map(url => silentDelete(storage, url, "uploaded file")))

            return c.json({ error: "Internal server error"}, 500);
        }
    }
);

/**
 * DELETE /:id - Delete a podcast
 * 
 * Middleware: `authMiddleware`, `validate("param", podcastDeleteParamSchema)`.
 * Authorization: users with role `HOST` who own the podcast, or `SUPERUSER` may delete a podcast
 * 
 * Param:
 * - id: podcast id
 * 
 * Behavior: 
 * - soft deletes the podcast, marking it as invisible to users
 * - deletes the associated audio and image files from storage
 * - hard deletes the database record if all files were successfully deleted
 * - if file deletion fails, the record is left soft-deleted for the background job to retry
 * 
 * Responses:
 * - 200: podcast deleted
 * - 403: forbidden
 * - 404: podcast not found
 * - 500: internal server error
 * 
 */
podcast.delete("/:id",
    authMiddleware,
    validate("param", podcastDeleteParamSchema),
    async (c) => {
        // Validate current user permission
        const user = c.get("user");
        if (!["HOST", "SUPERUSER"].includes(user.role)) {
            return c.json({ error: "Forbidden" }, 403);
        }

        // Get podcast id
        const { id } = c.req.valid("param");

        try {
            // Get stored podcast
            const storedPodcast = await prisma.podcast.findUnique({ where: { id } });
            if (!storedPodcast) return c.json({ error: "Podcast does not exist" }, 404);

            // Validate ownership
            const isOwner = storedPodcast.hostId === user.id;
            const isSuperUser = user.role === "SUPERUSER";
            if (!isOwner && !isSuperUser) {
                return c.json({ error: "Forbidden" }, 403);
            }

            // Soft delete podcast audio and image files
            // Mark as deleted, podcast is now invisible to users
            await prisma.podcast.update({
                where: { id },
                data: { deletedAt: new Date() }
            });

            // Delete files
            const results = await Promise.allSettled([
                storage.delete(storedPodcast.audioUrl),
                storage.delete(storedPodcast.imageUrl),
            ]);

            const allDeleted = results.every(r => r.status === "fulfilled");

            // Hard delete if all files removed, otherwise leave for background job
            if (allDeleted) {
                await prisma.podcast.delete({ where: { id } });
            } else {
                console.error("Failed deleting files for podcast", id);
            }

            return c.json({ message: "Podcast deleted", ok: true });
        } catch {
            return c.json({ error: "Internal server error" }, 500);
        }
    }
);

export default podcast;