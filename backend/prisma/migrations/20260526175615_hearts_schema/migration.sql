/*
  Warnings:

  - You are about to drop the column `hearts` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `hearts` on the `Reflection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Podcast" DROP COLUMN "hearts",
ADD COLUMN     "heartsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Reflection" DROP COLUMN "hearts",
ADD COLUMN     "heartsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "heartsCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Heart" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "storyId" INTEGER,
    "podcastId" INTEGER,
    "reflectionId" TEXT,

    CONSTRAINT "Heart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Heart_userId_storyId_key" ON "Heart"("userId", "storyId");

-- CreateIndex
CREATE UNIQUE INDEX "Heart_userId_podcastId_key" ON "Heart"("userId", "podcastId");

-- CreateIndex
CREATE UNIQUE INDEX "Heart_userId_reflectionId_key" ON "Heart"("userId", "reflectionId");

-- AddForeignKey
ALTER TABLE "Heart" ADD CONSTRAINT "Heart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Heart" ADD CONSTRAINT "Heart_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Heart" ADD CONSTRAINT "Heart_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Heart" ADD CONSTRAINT "Heart_reflectionId_fkey" FOREIGN KEY ("reflectionId") REFERENCES "Reflection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
