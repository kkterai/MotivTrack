-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin_parent', 'delivery_parent', 'child', 'teacher');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('kitchen', 'bathroom', 'bedroom', 'laundry', 'outdoor', 'general');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('done', 'extra_well_done');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('pending', 'verified', 'redo_requested');

-- CreateEnum
CREATE TYPE "PointSource" AS ENUM ('task_claim', 'school_behavior', 'streak_bonus', 'daily_bonus', 'weekly_bonus', 'welcome_bonus');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('task_claim_pending', 'verification_reminder', 'points_awarded', 'reward_redeemed', 'reward_delivery_reminder', 'teacher_reminder', 'streak_milestone', 'annual_survey');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('sent', 'opened', 'dismissed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT,
    "schoolName" TEXT,
    "schoolDomain" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminParentId" TEXT NOT NULL,
    "deliveryParentId" TEXT,

    CONSTRAINT "ChildProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "doneStandard" TEXT NOT NULL,
    "extraWellDoneStandard" TEXT NOT NULL,
    "tips" TEXT NOT NULL,
    "suggestedPointsDone" INTEGER NOT NULL,
    "suggestedPointsExtraWellDone" INTEGER NOT NULL,
    "category" "TaskCategory" NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "doneStandard" TEXT NOT NULL,
    "extraWellDoneStandard" TEXT NOT NULL,
    "tips" TEXT NOT NULL,
    "pointsDone" INTEGER NOT NULL,
    "pointsExtraWellDone" INTEGER NOT NULL,
    "isFromLibrary" BOOLEAN NOT NULL DEFAULT false,
    "libraryTaskId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskClaim" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "claimType" "ClaimType" NOT NULL,
    "status" "ClaimStatus" NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "redoNote" TEXT,

    CONSTRAINT "TaskClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" "PointSource" NOT NULL,
    "referenceTaskClaimId" TEXT,
    "referenceBehaviorRatingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointCost" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRetired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardRedemption" (
    "id" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "deliveredBy" TEXT,

    CONSTRAINT "RewardRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardPreference" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "schoolYear" TEXT NOT NULL,
    "preferences" TEXT[],
    "freeText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreakRecord" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "currentDailyStreak" INTEGER NOT NULL DEFAULT 0,
    "currentWeeklyStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastCompletedDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreakRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "payload" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),
    "status" "NotificationStatus" NOT NULL,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolExpectation" (
    "id" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolExpectation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAssignment" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "schoolDomain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "TeacherAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BehaviorRating" (
    "id" TEXT NOT NULL,
    "teacherAssignmentId" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "expectationId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BehaviorRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "ChildProfile_adminParentId_idx" ON "ChildProfile"("adminParentId");

-- CreateIndex
CREATE INDEX "ChildProfile_deliveryParentId_idx" ON "ChildProfile"("deliveryParentId");

-- CreateIndex
CREATE INDEX "ChildProfile_isArchived_idx" ON "ChildProfile"("isArchived");

-- CreateIndex
CREATE INDEX "LibraryTask_category_idx" ON "LibraryTask"("category");

-- CreateIndex
CREATE INDEX "LibraryTask_isArchived_idx" ON "LibraryTask"("isArchived");

-- CreateIndex
CREATE INDEX "Task_childProfileId_idx" ON "Task"("childProfileId");

-- CreateIndex
CREATE INDEX "Task_libraryTaskId_idx" ON "Task"("libraryTaskId");

-- CreateIndex
CREATE INDEX "Task_isArchived_idx" ON "Task"("isArchived");

-- CreateIndex
CREATE INDEX "TaskClaim_taskId_idx" ON "TaskClaim"("taskId");

-- CreateIndex
CREATE INDEX "TaskClaim_childId_idx" ON "TaskClaim"("childId");

-- CreateIndex
CREATE INDEX "TaskClaim_childProfileId_idx" ON "TaskClaim"("childProfileId");

-- CreateIndex
CREATE INDEX "TaskClaim_status_idx" ON "TaskClaim"("status");

-- CreateIndex
CREATE INDEX "TaskClaim_claimedAt_idx" ON "TaskClaim"("claimedAt");

-- CreateIndex
CREATE INDEX "PointTransaction_childProfileId_idx" ON "PointTransaction"("childProfileId");

-- CreateIndex
CREATE INDEX "PointTransaction_source_idx" ON "PointTransaction"("source");

-- CreateIndex
CREATE INDEX "PointTransaction_createdAt_idx" ON "PointTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "Reward_childProfileId_idx" ON "Reward"("childProfileId");

-- CreateIndex
CREATE INDEX "Reward_isActive_idx" ON "Reward"("isActive");

-- CreateIndex
CREATE INDEX "Reward_isRetired_idx" ON "Reward"("isRetired");

-- CreateIndex
CREATE INDEX "RewardRedemption_rewardId_idx" ON "RewardRedemption"("rewardId");

-- CreateIndex
CREATE INDEX "RewardRedemption_childProfileId_idx" ON "RewardRedemption"("childProfileId");

-- CreateIndex
CREATE INDEX "RewardRedemption_redeemedAt_idx" ON "RewardRedemption"("redeemedAt");

-- CreateIndex
CREATE INDEX "RewardPreference_childProfileId_idx" ON "RewardPreference"("childProfileId");

-- CreateIndex
CREATE INDEX "RewardPreference_schoolYear_idx" ON "RewardPreference"("schoolYear");

-- CreateIndex
CREATE UNIQUE INDEX "StreakRecord_childProfileId_key" ON "StreakRecord"("childProfileId");

-- CreateIndex
CREATE INDEX "StreakRecord_childProfileId_idx" ON "StreakRecord"("childProfileId");

-- CreateIndex
CREATE INDEX "NotificationLog_userId_idx" ON "NotificationLog"("userId");

-- CreateIndex
CREATE INDEX "NotificationLog_type_idx" ON "NotificationLog"("type");

-- CreateIndex
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");

-- CreateIndex
CREATE INDEX "NotificationLog_sentAt_idx" ON "NotificationLog"("sentAt");

-- CreateIndex
CREATE INDEX "SchoolExpectation_childProfileId_idx" ON "SchoolExpectation"("childProfileId");

-- CreateIndex
CREATE INDEX "SchoolExpectation_isActive_idx" ON "SchoolExpectation"("isActive");

-- CreateIndex
CREATE INDEX "TeacherAssignment_teacherId_idx" ON "TeacherAssignment"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherAssignment_childProfileId_idx" ON "TeacherAssignment"("childProfileId");

-- CreateIndex
CREATE INDEX "TeacherAssignment_schoolDomain_idx" ON "TeacherAssignment"("schoolDomain");

-- CreateIndex
CREATE INDEX "TeacherAssignment_isActive_idx" ON "TeacherAssignment"("isActive");

-- CreateIndex
CREATE INDEX "BehaviorRating_teacherAssignmentId_idx" ON "BehaviorRating"("teacherAssignmentId");

-- CreateIndex
CREATE INDEX "BehaviorRating_childProfileId_idx" ON "BehaviorRating"("childProfileId");

-- CreateIndex
CREATE INDEX "BehaviorRating_expectationId_idx" ON "BehaviorRating"("expectationId");

-- CreateIndex
CREATE INDEX "BehaviorRating_submittedAt_idx" ON "BehaviorRating"("submittedAt");

-- AddForeignKey
ALTER TABLE "ChildProfile" ADD CONSTRAINT "ChildProfile_adminParentId_fkey" FOREIGN KEY ("adminParentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildProfile" ADD CONSTRAINT "ChildProfile_deliveryParentId_fkey" FOREIGN KEY ("deliveryParentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_libraryTaskId_fkey" FOREIGN KEY ("libraryTaskId") REFERENCES "LibraryTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskClaim" ADD CONSTRAINT "TaskClaim_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskClaim" ADD CONSTRAINT "TaskClaim_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskClaim" ADD CONSTRAINT "TaskClaim_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskClaim" ADD CONSTRAINT "TaskClaim_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardPreference" ADD CONSTRAINT "RewardPreference_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreakRecord" ADD CONSTRAINT "StreakRecord_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolExpectation" ADD CONSTRAINT "SchoolExpectation_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehaviorRating" ADD CONSTRAINT "BehaviorRating_teacherAssignmentId_fkey" FOREIGN KEY ("teacherAssignmentId") REFERENCES "TeacherAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehaviorRating" ADD CONSTRAINT "BehaviorRating_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehaviorRating" ADD CONSTRAINT "BehaviorRating_expectationId_fkey" FOREIGN KEY ("expectationId") REFERENCES "SchoolExpectation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
