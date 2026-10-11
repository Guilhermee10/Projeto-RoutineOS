-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "goalId" TEXT;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
