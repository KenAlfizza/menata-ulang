/*
  Warnings:

  - Added the required column `storyId` to the `Research` table without a default value. This is not possible if the table is not empty.
  - Added the required column `researchId` to the `Story` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Research" ADD COLUMN     "storyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "researchId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
