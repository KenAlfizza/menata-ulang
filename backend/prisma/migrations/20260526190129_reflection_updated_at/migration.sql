/*
  Warnings:

  - You are about to drop the column `editedAt` on the `Reflection` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Reflection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reflection" DROP COLUMN "editedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
