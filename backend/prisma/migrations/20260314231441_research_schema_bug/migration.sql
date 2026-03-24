/*
  Warnings:

  - You are about to drop the `Reseach` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Reseach";

-- CreateTable
CREATE TABLE "Research" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Research_pkey" PRIMARY KEY ("id")
);
