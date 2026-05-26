/*
  Warnings:

  - You are about to drop the column `reflectionId` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `podcastId` on the `Reflection` table. All the data in the column will be lost.
  - You are about to drop the column `reflectionId` on the `Reflection` table. All the data in the column will be lost.
  - You are about to drop the column `storyId` on the `Reflection` table. All the data in the column will be lost.
  - You are about to drop the column `reflectionId` on the `Story` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[threadId]` on the table `Podcast` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[threadId]` on the table `Story` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `threadId` to the `Podcast` table without a default value. This is not possible if the table is not empty.
  - The required column `threadId` was added to the `Reflection` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `threadId` to the `Story` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Podcast" DROP CONSTRAINT "Podcast_reflectionId_fkey";

-- DropForeignKey
ALTER TABLE "Reflection" DROP CONSTRAINT "Reflection_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Story" DROP CONSTRAINT "Story_reflectionId_fkey";

-- DropIndex
DROP INDEX "Podcast_reflectionId_key";

-- DropIndex
DROP INDEX "Reflection_podcastId_key";

-- DropIndex
DROP INDEX "Reflection_reflectionId_parentId_id_idx";

-- DropIndex
DROP INDEX "Reflection_storyId_key";

-- DropIndex
DROP INDEX "Story_reflectionId_key";

-- AlterTable
ALTER TABLE "Podcast" DROP COLUMN "reflectionId",
ADD COLUMN     "threadId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reflection" DROP COLUMN "podcastId",
DROP COLUMN "reflectionId",
DROP COLUMN "storyId",
ADD COLUMN     "threadId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Story" DROP COLUMN "reflectionId",
ADD COLUMN     "threadId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Podcast_threadId_key" ON "Podcast"("threadId");

-- CreateIndex
CREATE INDEX "Reflection_threadId_parentId_id_idx" ON "Reflection"("threadId", "parentId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Story_threadId_key" ON "Story"("threadId");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Reflection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Podcast" ADD CONSTRAINT "Podcast_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Reflection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Reflection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
