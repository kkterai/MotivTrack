/*
  Warnings:

  - A unique constraint covering the columns `[childUserId]` on the table `ChildProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ChildProfile" ADD COLUMN     "childUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ChildProfile_childUserId_key" ON "ChildProfile"("childUserId");

-- CreateIndex
CREATE INDEX "ChildProfile_childUserId_idx" ON "ChildProfile"("childUserId");

-- AddForeignKey
ALTER TABLE "ChildProfile" ADD CONSTRAINT "ChildProfile_childUserId_fkey" FOREIGN KEY ("childUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
