/*
  Warnings:

  - The primary key for the `Podcast` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Heart" DROP CONSTRAINT "Heart_podcastId_fkey";

-- AlterTable
ALTER TABLE "Heart" ALTER COLUMN "podcastId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Podcast" DROP CONSTRAINT "Podcast_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Podcast_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Podcast_id_seq";

-- AddForeignKey
ALTER TABLE "Heart" ADD CONSTRAINT "Heart_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;
