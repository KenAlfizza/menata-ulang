/*
  Warnings:

  - You are about to drop the column `lastActiveAt` on the `Token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "lastActiveAt",
ADD COLUMN     "lastAccessTokenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
