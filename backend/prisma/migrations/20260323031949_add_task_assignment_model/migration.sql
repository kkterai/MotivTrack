-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "assignedFor" TIMESTAMP(3) NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskAssignment_taskId_idx" ON "TaskAssignment"("taskId");

-- CreateIndex
CREATE INDEX "TaskAssignment_childProfileId_idx" ON "TaskAssignment"("childProfileId");

-- CreateIndex
CREATE INDEX "TaskAssignment_assignedFor_idx" ON "TaskAssignment"("assignedFor");

-- CreateIndex
CREATE INDEX "TaskAssignment_assignedBy_idx" ON "TaskAssignment"("assignedBy");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignment_taskId_assignedFor_key" ON "TaskAssignment"("taskId", "assignedFor");

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
