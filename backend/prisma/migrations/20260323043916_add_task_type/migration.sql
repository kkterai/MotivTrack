-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('INDIVIDUAL', 'SHARED');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "taskType" "TaskType" NOT NULL DEFAULT 'INDIVIDUAL';
