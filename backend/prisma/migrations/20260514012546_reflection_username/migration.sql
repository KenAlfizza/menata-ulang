/*
  Warnings:

  - Added the required column `userName` to the `Reflection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reflection" DROP CONSTRAINT "Reflection_userId_fkey";

-- AlterTable
ALTER TABLE "Reflection" ADD COLUMN     "userName" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
