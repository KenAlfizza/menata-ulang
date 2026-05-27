/*
  Warnings:

  - Added the required column `editedAt` to the `Reflection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reflection" ADD COLUMN     "editedAt" TIMESTAMP(3) NOT NULL;
