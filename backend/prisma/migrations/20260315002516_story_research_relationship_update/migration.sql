/*
  Warnings:

  - You are about to drop the column `storyId` on the `Research` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Research" DROP CONSTRAINT "Research_storyId_fkey";

-- AlterTable
ALTER TABLE "Research" DROP COLUMN "storyId";

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
