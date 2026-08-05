/*
  Warnings:

  - You are about to drop the `Research` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResearchPage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Research" DROP CONSTRAINT "Research_storyId_fkey";

-- DropForeignKey
ALTER TABLE "ResearchPage" DROP CONSTRAINT "ResearchPage_researcherId_fkey";

-- AlterTable
ALTER TABLE "Heart" ADD COLUMN     "researchId" TEXT;

-- DropTable
DROP TABLE "Research";

-- DropTable
DROP TABLE "ResearchPage";

-- CreateTable
CREATE TABLE "researches" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "researcherId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "heartsCount" INTEGER NOT NULL DEFAULT 0,
    "threadId" TEXT NOT NULL,

    CONSTRAINT "researches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_pages" (
    "id" TEXT NOT NULL,
    "puckData" JSONB NOT NULL,
    "researchId" TEXT NOT NULL,

    CONSTRAINT "research_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "researches_slug_key" ON "researches"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "researches_threadId_key" ON "researches"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "research_pages_researchId_key" ON "research_pages"("researchId");

-- AddForeignKey
ALTER TABLE "researches" ADD CONSTRAINT "researches_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "researches" ADD CONSTRAINT "researches_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_pages" ADD CONSTRAINT "research_pages_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "researches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Heart" ADD CONSTRAINT "Heart_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "researches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
