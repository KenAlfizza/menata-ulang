/*
  Warnings:

  - You are about to drop the column `researchId` on the `Story` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storyId]` on the table `Research` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storyId` to the `Research` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Story" DROP CONSTRAINT "Story_researchId_fkey";

-- AlterTable
ALTER TABLE "Research" ADD COLUMN     "storyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Story" DROP COLUMN "researchId";

-- CreateIndex
CREATE UNIQUE INDEX "Research_storyId_key" ON "Research"("storyId");

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
