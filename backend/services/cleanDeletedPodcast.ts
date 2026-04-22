import { StorageProvider } from "./storageInterface.ts";
import { prisma } from "../lib/prisma.ts";

/**
 * Cleans up soft-deleted podcasts by deleting their associated files and database records
 * Intended to be run as a background job to handle any podcasts where file deletion failed
 * 
 * @param storage The storage provider used to delete podcast files
 * 
 * Behaviour: Fetches all soft-deleted podcasts (deletedAt is not null),
 * deletes their audio and image files from storage,
 * then hard deletes the database record if file deletion succeeds
 * 
 * Returns: void
 */
export const cleanDeletedPodcasts = async (storage: StorageProvider) => {
    const deleted = await prisma.podcast.findMany({
        where: { deletedAt: { not: null } }
    });

    await Promise.allSettled(
        deleted.map(async (podcast) => {
            try {
                await storage.delete(podcast.audioUrl);
                await storage.delete(podcast.imageUrl);
                await prisma.podcast.delete({ where: { id: podcast.id } });
            } catch (error) {
                console.error(`Failed cleaning podcast ${podcast.id}`, error);
            }
        })
    );
}