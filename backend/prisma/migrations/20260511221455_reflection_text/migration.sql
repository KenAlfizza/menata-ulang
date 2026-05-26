/*
  Warnings:

  - You are about to drop the column `content` on the `Reflection` table. All the data in the column will be lost.
  - Added the required column `text` to the `Reflection` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Reflection_reflectionId_id_idx";

-- AlterTable
ALTER TABLE "Reflection" DROP COLUMN "content",
ADD COLUMN     "text" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Reflection_reflectionId_parentId_id_idx" ON "Reflection"("reflectionId", "parentId", "id");
