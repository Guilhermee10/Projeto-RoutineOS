-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('SUGGESTED', 'CONFIRMED');

-- AlterTable
ALTER TABLE "flexible_goals" ADD COLUMN     "suitableForCommute" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "scheduled_slots" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'SUGGESTED',
    "duringCommute" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "flexibleGoalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "scheduled_slots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "scheduled_slots" ADD CONSTRAINT "scheduled_slots_flexibleGoalId_fkey" FOREIGN KEY ("flexibleGoalId") REFERENCES "flexible_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_slots" ADD CONSTRAINT "scheduled_slots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
