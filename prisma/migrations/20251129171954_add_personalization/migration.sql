-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN     "customThemes" JSONB,
ADD COLUMN     "difficultyMultiplier" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "initialAssessmentScore" INTEGER,
ADD COLUMN     "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "levelScore" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "preferredThemes" TEXT[] DEFAULT ARRAY[]::TEXT[];
