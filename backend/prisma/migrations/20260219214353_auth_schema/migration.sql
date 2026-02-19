-- CreateTable
CREATE TABLE "AuthToken" (
    "id" SERIAL NOT NULL,
    "loginToken" TEXT,
    "resetToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_loginToken_key" ON "AuthToken"("loginToken");

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_resetToken_key" ON "AuthToken"("resetToken");
