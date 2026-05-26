/*
  Warnings:

  - You are about to drop the column `chatId` on the `Reflection` table. All the data in the column will be lost.
  - Added the required column `reflectionId` to the `Reflection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Reflection` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Reflection_chatId_id_idx";

-- AlterTable
ALTER TABLE "Reflection" DROP COLUMN "chatId",
ADD COLUMN     "hearts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "reflectionId" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Reflection_reflectionId_id_idx" ON "Reflection"("reflectionId", "id");

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Reflection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
