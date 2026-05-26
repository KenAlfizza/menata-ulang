/*
  Warnings:

  - A unique constraint covering the columns `[storyId]` on the table `Reflection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[podcastId]` on the table `Reflection` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reflection" ADD COLUMN     "podcastId" INTEGER,
ADD COLUMN     "storyId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Reflection_storyId_key" ON "Reflection"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "Reflection_podcastId_key" ON "Reflection"("podcastId");

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;
