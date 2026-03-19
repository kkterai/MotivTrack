/*
  Warnings:

  - You are about to drop the column `pointCost` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `pointsCost` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "pointCost",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "needsScheduling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pointsCost" INTEGER NOT NULL,
ADD COLUMN     "shoppingLink" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "icon" TEXT;
