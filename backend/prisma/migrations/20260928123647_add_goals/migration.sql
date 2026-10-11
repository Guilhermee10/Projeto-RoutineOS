-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('ESTUDO_HORAS', 'TREINO_QUANTIDADE', 'SONO_HORAS', 'PERSONALIZADA');

-- CreateEnum
CREATE TYPE "GoalPeriod" AS ENUM ('SEMANAL', 'MENSAL');

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GoalType" NOT NULL,
    "subject" TEXT,
    "targetValue" INTEGER NOT NULL,
    "period" "GoalPeriod" NOT NULL DEFAULT 'SEMANAL',
    "manualProgress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
