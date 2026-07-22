/*
  Warnings:

  - The primary key for the `stories` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Heart" DROP CONSTRAINT "Heart_storyId_fkey";

-- DropForeignKey
ALTER TABLE "Research" DROP CONSTRAINT "Research_storyId_fkey";

-- DropForeignKey
ALTER TABLE "story_pages" DROP CONSTRAINT "story_pages_storyId_fkey";

-- AlterTable
ALTER TABLE "Heart" ALTER COLUMN "storyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Research" ALTER COLUMN "storyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "stories" DROP CONSTRAINT "stories_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "stories_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "stories_id_seq";

-- AlterTable
ALTER TABLE "story_pages" ALTER COLUMN "storyId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "story_pages" ADD CONSTRAINT "story_pages_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Heart" ADD CONSTRAINT "Heart_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
