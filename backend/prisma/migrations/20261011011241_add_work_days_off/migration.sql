-- AlterTable
ALTER TABLE "work_schedules" ADD COLUMN     "daysOff" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
