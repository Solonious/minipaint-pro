-- CreateEnum
CREATE TYPE "GameSystem" AS ENUM ('WARHAMMER_40K', 'AGE_OF_SIGMAR', 'KILL_TEAM', 'NECROMUNDA', 'HORUS_HERESY', 'OTHER');

-- CreateEnum
CREATE TYPE "MiniatureStatus" AS ENUM ('UNBUILT', 'ASSEMBLED', 'PRIMED', 'WIP', 'PAINTED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "PaintBrand" AS ENUM ('CITADEL', 'VALLEJO', 'ARMY_PAINTER', 'SCALE75', 'AK_INTERACTIVE', 'TURBO_DORK', 'OTHER');

-- CreateEnum
CREATE TYPE "PaintType" AS ENUM ('BASE', 'LAYER', 'SHADE', 'CONTRAST', 'TECHNICAL', 'DRY', 'AIR', 'METALLIC');

-- CreateEnum
CREATE TYPE "RecipeDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('MODELS', 'HOURS', 'CHARACTERS', 'VEHICLES');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "armies" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "faction" TEXT NOT NULL,
    "gameSystem" "GameSystem" NOT NULL DEFAULT 'WARHAMMER_40K',
    "targetPoints" INTEGER NOT NULL,
    "iconEmoji" TEXT,
    "colorHex" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "armies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "miniatures" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "armyId" TEXT,
    "name" TEXT NOT NULL,
    "faction" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "modelCount" INTEGER NOT NULL DEFAULT 1,
    "status" "MiniatureStatus" NOT NULL DEFAULT 'UNBUILT',
    "cost" DECIMAL(10,2),
    "notes" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "miniatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paints" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" "PaintBrand" NOT NULL,
    "type" "PaintType" NOT NULL,
    "colorHex" TEXT NOT NULL,
    "isOfficial" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_paints" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paintId" TEXT NOT NULL,
    "owned" BOOLEAN NOT NULL DEFAULT false,
    "wishlist" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_paints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paint_equivalents" (
    "id" TEXT NOT NULL,
    "paintId" TEXT NOT NULL,
    "equivalentId" TEXT NOT NULL,

    CONSTRAINT "paint_equivalents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "difficulty" "RecipeDifficulty" NOT NULL,
    "timeMinutes" INTEGER NOT NULL,
    "previewColorHex" TEXT NOT NULL,
    "rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_steps" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "instruction" TEXT NOT NULL,
    "paintId" TEXT,
    "technique" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "recipe_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_recipes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastPaintedDate" TIMESTAMP(3),
    "totalModelsPainted" INTEGER NOT NULL DEFAULT 0,
    "totalHoursPainted" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirementType" TEXT NOT NULL,
    "requirementValue" INTEGER NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_goals" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GoalType" NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_events" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "targetPoints" INTEGER NOT NULL,
    "armyId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "paints_name_brand_key" ON "paints"("name", "brand");

-- CreateIndex
CREATE UNIQUE INDEX "user_paints_userId_paintId_key" ON "user_paints"("userId", "paintId");

-- CreateIndex
CREATE UNIQUE INDEX "paint_equivalents_paintId_equivalentId_key" ON "paint_equivalents"("paintId", "equivalentId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_recipes_userId_recipeId_key" ON "saved_recipes"("userId", "recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_key" ON "user_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_name_key" ON "achievements"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_progressId_achievementId_key" ON "user_achievements"("progressId", "achievementId");

-- AddForeignKey
ALTER TABLE "armies" ADD CONSTRAINT "armies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "miniatures" ADD CONSTRAINT "miniatures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "miniatures" ADD CONSTRAINT "miniatures_armyId_fkey" FOREIGN KEY ("armyId") REFERENCES "armies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_paints" ADD CONSTRAINT "user_paints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_paints" ADD CONSTRAINT "user_paints_paintId_fkey" FOREIGN KEY ("paintId") REFERENCES "paints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paint_equivalents" ADD CONSTRAINT "paint_equivalents_paintId_fkey" FOREIGN KEY ("paintId") REFERENCES "paints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paint_equivalents" ADD CONSTRAINT "paint_equivalents_equivalentId_fkey" FOREIGN KEY ("equivalentId") REFERENCES "paints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_paintId_fkey" FOREIGN KEY ("paintId") REFERENCES "paints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_recipes" ADD CONSTRAINT "saved_recipes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_recipes" ADD CONSTRAINT "saved_recipes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "user_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "user_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "user_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
