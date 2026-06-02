/*
  Warnings:

  - You are about to drop the column `userId` on the `Feedback` table. All the data in the column will be lost.
  - Added the required column `userName` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Feedback` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_userId_fkey";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "userId",
ADD COLUMN     "userName" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL;
