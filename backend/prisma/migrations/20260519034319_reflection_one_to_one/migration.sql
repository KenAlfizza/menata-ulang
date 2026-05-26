/*
  Warnings:

  - A unique constraint covering the columns `[reflectionId]` on the table `Podcast` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reflectionId]` on the table `Story` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Reflection" DROP CONSTRAINT "Reflection_podcastId_fkey";

-- DropForeignKey
ALTER TABLE "Reflection" DROP CONSTRAINT "Reflection_storyId_fkey";

-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "reflectionId" TEXT NOT NULL DEFAULT '0';

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "reflectionId" TEXT NOT NULL DEFAULT '0';

-- CreateIndex
CREATE UNIQUE INDEX "Podcast_reflectionId_key" ON "Podcast"("reflectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Story_reflectionId_key" ON "Story"("reflectionId");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_reflectionId_fkey" FOREIGN KEY ("reflectionId") REFERENCES "Reflection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Podcast" ADD CONSTRAINT "Podcast_reflectionId_fkey" FOREIGN KEY ("reflectionId") REFERENCES "Reflection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
