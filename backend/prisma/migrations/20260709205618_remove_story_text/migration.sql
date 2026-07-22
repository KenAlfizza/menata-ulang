/*
  Warnings:

  - You are about to drop the column `text` on the `stories` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `story_pages` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `story_pages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stories" DROP COLUMN "text";

-- AlterTable
ALTER TABLE "story_pages" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
