/*
  Warnings:

  - A unique constraint covering the columns `[plaidId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "pending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "plaidId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_plaidId_key" ON "Transaction"("plaidId");
