/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Podcast` table. All the data in the column will be lost.
  - You are about to drop the column `listener` on the `Podcast` table. All the data in the column will be lost.
  - Added the required column `slug` to the `Podcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transcript` to the `Podcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Podcast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Podcast" DROP COLUMN "deletedAt",
DROP COLUMN "listener",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "transcript" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
