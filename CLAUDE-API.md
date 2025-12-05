# MiniPaint Pro API — Backend Instructions

## Overview

NestJS backend for MiniPaint Pro. Provides REST API for all data operations with PostgreSQL database.

## Tech Stack

- **Framework:** NestJS 10+
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Auth:** JWT (Phase 2)
- **Validation:** class-validator + class-transformer
- **Documentation:** Swagger/OpenAPI

## Project Structure

```
apps/api/
├── src/
│   ├── main.ts                     # Application entry point
│   ├── app.module.ts               # Root module
│   │
│   ├── common/                     # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   └── pipes/
│   │
│   ├── config/                     # Configuration
│   │   ├── config.module.ts
│   │   └── config.service.ts
│   │
│   ├── prisma/                     # Database
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── migrations/
│   │
│   └── modules/                    # Feature modules
│       ├── miniatures/
│       │   ├── miniatures.module.ts
│       │   ├── miniatures.controller.ts
│       │   ├── miniatures.service.ts
│       │   ├── dto/
│       │   │   ├── create-miniature.dto.ts
│       │   │   └── update-miniature.dto.ts
│       │   └── entities/
│       │       └── miniature.entity.ts
│       │
│       ├── armies/
│       │   ├── armies.module.ts
│       │   ├── armies.controller.ts
│       │   ├── armies.service.ts
│       │   └── dto/
│       │
│       ├── paints/
│       │   ├── paints.module.ts
│       │   ├── paints.controller.ts
│       │   ├── paints.service.ts
│       │   └── dto/
│       │
│       ├── recipes/
│       │   ├── recipes.module.ts
│       │   ├── recipes.controller.ts
│       │   ├── recipes.service.ts
│       │   └── dto/
│       │
│       ├── progress/
│       │   ├── progress.module.ts
│       │   ├── progress.controller.ts
│       │   ├── progress.service.ts
│       │   └── dto/
│       │
│       └── users/                  # Phase 2 - Auth
│           ├── users.module.ts
│           ├── users.controller.ts
│           ├── users.service.ts
│           ├── auth.controller.ts
│           ├── auth.service.ts
│           └── dto/
│
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Seed data
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── project.json                    # Nx project config
├── tsconfig.app.json
└── .env.example
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// User (Phase 2)
// ============================================
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  displayName   String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  armies        Army[]
  miniatures    Miniature[]
  paints        UserPaint[]
  recipes       Recipe[]
  savedRecipes  SavedRecipe[]
  progress      UserProgress?

  @@map("users")
}

// ============================================
// Army
// ============================================
model Army {
  id           String     @id @default(uuid())
  userId       String?
  name         String
  faction      String
  gameSystem   GameSystem @default(WARHAMMER_40K)
  targetPoints Int
  iconEmoji    String?
  colorHex     String?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  user         User?       @relation(fields: [userId], references: [id], onDelete: Cascade)
  miniatures   Miniature[]

  @@map("armies")
}

enum GameSystem {
  WARHAMMER_40K
  AGE_OF_SIGMAR
  KILL_TEAM
  NECROMUNDA
  HORUS_HERESY
  OTHER
}

// ============================================
// Miniature
// ============================================
model Miniature {
  id         String           @id @default(uuid())
  userId     String?
  armyId     String?
  name       String
  faction    String
  points     Int
  modelCount Int              @default(1)
  status     MiniatureStatus  @default(UNBUILT)
  cost       Decimal?         @db.Decimal(10, 2)
  notes      String?
  imageUrl   String?
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  user       User?  @relation(fields: [userId], references: [id], onDelete: Cascade)
  army       Army?  @relation(fields: [armyId], references: [id], onDelete: SetNull)

  @@map("miniatures")
}

enum MiniatureStatus {
  UNBUILT
  ASSEMBLED
  PRIMED
  WIP
  PAINTED
  COMPLETE
}

// ============================================
// Paint
// ============================================
model Paint {
  id           String     @id @default(uuid())
  name         String
  brand        PaintBrand
  type         PaintType
  colorHex     String
  isOfficial   Boolean    @default(true)
  createdAt    DateTime   @default(now())

  userPaints   UserPaint[]
  recipeSteps  RecipeStep[]
  equivalentTo PaintEquivalent[] @relation("EquivalentTo")
  equivalents  PaintEquivalent[] @relation("EquivalentFrom")

  @@unique([name, brand])
  @@map("paints")
}

model UserPaint {
  id        String   @id @default(uuid())
  userId    String
  paintId   String
  owned     Boolean  @default(false)
  wishlist  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  paint     Paint @relation(fields: [paintId], references: [id], onDelete: Cascade)

  @@unique([userId, paintId])
  @@map("user_paints")
}

model PaintEquivalent {
  id            String @id @default(uuid())
  paintId       String
  equivalentId  String

  paint         Paint @relation("EquivalentFrom", fields: [paintId], references: [id], onDelete: Cascade)
  equivalent    Paint @relation("EquivalentTo", fields: [equivalentId], references: [id], onDelete: Cascade)

  @@unique([paintId, equivalentId])
  @@map("paint_equivalents")
}

enum PaintBrand {
  CITADEL
  VALLEJO
  ARMY_PAINTER
  SCALE75
  AK_INTERACTIVE
  TURBO_DORK
  OTHER
}

enum PaintType {
  BASE
  LAYER
  SHADE
  CONTRAST
  TECHNICAL
  DRY
  AIR
  METALLIC
}

// ============================================
// Recipe
// ============================================
model Recipe {
  id              String           @id @default(uuid())
  userId          String?
  authorName      String
  name            String
  difficulty      RecipeDifficulty
  timeMinutes     Int
  previewColorHex String
  rating          Decimal          @default(0) @db.Decimal(2, 1)
  ratingCount     Int              @default(0)
  tags            String[]
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  user            User?         @relation(fields: [userId], references: [id], onDelete: SetNull)
  steps           RecipeStep[]
  savedBy         SavedRecipe[]

  @@map("recipes")
}

model RecipeStep {
  id          String  @id @default(uuid())
  recipeId    String
  order       Int
  instruction String
  paintId     String?
  technique   String?
  imageUrl    String?

  recipe      Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  paint       Paint? @relation(fields: [paintId], references: [id], onDelete: SetNull)

  @@map("recipe_steps")
}

model SavedRecipe {
  id        String   @id @default(uuid())
  userId    String
  recipeId  String
  savedAt   DateTime @default(now())

  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  recipe    Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@unique([userId, recipeId])
  @@map("saved_recipes")
}

enum RecipeDifficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

// ============================================
// Progress & Gamification
// ============================================
model UserProgress {
  id                  String   @id @default(uuid())
  userId              String   @unique
  currentStreak       Int      @default(0)
  bestStreak          Int      @default(0)
  lastPaintedDate     DateTime?
  totalModelsPainted  Int      @default(0)
  totalHoursPainted   Decimal  @default(0) @db.Decimal(10, 2)
  updatedAt           DateTime @updatedAt

  user                User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievements        UserAchievement[]
  goals               UserGoal[]
  events              UserEvent[]

  @@map("user_progress")
}

model Achievement {
  id              String @id @default(uuid())
  emoji           String
  name            String @unique
  description     String
  requirementType String
  requirementValue Int

  userAchievements UserAchievement[]

  @@map("achievements")
}

model UserAchievement {
  id            String   @id @default(uuid())
  progressId    String
  achievementId String
  unlockedAt    DateTime @default(now())

  progress      UserProgress @relation(fields: [progressId], references: [id], onDelete: Cascade)
  achievement   Achievement  @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@unique([progressId, achievementId])
  @@map("user_achievements")
}

model UserGoal {
  id           String   @id @default(uuid())
  progressId   String
  name         String
  type         GoalType
  targetValue  Int
  currentValue Int      @default(0)
  weekStart    DateTime
  weekEnd      DateTime

  progress     UserProgress @relation(fields: [progressId], references: [id], onDelete: Cascade)

  @@map("user_goals")
}

enum GoalType {
  MODELS
  HOURS
  CHARACTERS
  VEHICLES
}

model UserEvent {
  id           String   @id @default(uuid())
  progressId   String
  name         String
  eventDate    DateTime
  targetPoints Int
  armyId       String?
  notes        String?
  createdAt    DateTime @default(now())

  progress     UserProgress @relation(fields: [progressId], references: [id], onDelete: Cascade)

  @@map("user_events")
}
```

## API Endpoints

### Miniatures

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/miniatures` | List all miniatures |
| GET | `/api/miniatures/:id` | Get single miniature |
| POST | `/api/miniatures` | Create miniature |
| PATCH | `/api/miniatures/:id` | Update miniature |
| PATCH | `/api/miniatures/:id/status` | Update status only |
| DELETE | `/api/miniatures/:id` | Delete miniature |

### Armies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/armies` | List all armies |
| GET | `/api/armies/:id` | Get army with stats |
| POST | `/api/armies` | Create army |
| PATCH | `/api/armies/:id` | Update army |
| DELETE | `/api/armies/:id` | Delete army |

### Paints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/paints` | List all paints |
| GET | `/api/paints/user` | Get user's paint collection |
| POST | `/api/paints` | Add custom paint |
| PATCH | `/api/paints/:id/owned` | Toggle owned status |
| PATCH | `/api/paints/:id/wishlist` | Toggle wishlist |

### Recipes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipes` | List all recipes |
| GET | `/api/recipes/:id` | Get recipe with steps |
| POST | `/api/recipes` | Create recipe |
| PATCH | `/api/recipes/:id` | Update recipe |
| DELETE | `/api/recipes/:id` | Delete recipe |
| POST | `/api/recipes/:id/save` | Save recipe |
| DELETE | `/api/recipes/:id/save` | Unsave recipe |

### Progress

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress` | Get user progress |
| POST | `/api/progress/session` | Log painting session |
| GET | `/api/progress/achievements` | List achievements |
| GET | `/api/progress/goals` | Get weekly goals |
| PATCH | `/api/progress/goals/:id` | Update goal progress |

### Auth (Phase 2)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login, get JWT |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Get current user |

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minipaint_pro?schema=public"

# API
PORT=3000
API_PREFIX=api
NODE_ENV=development

# Auth (Phase 2)
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:4200
```

## Commands

```bash
# Development
nx serve api                     # Start API dev server (port 3000)

# Database
npx prisma generate              # Generate Prisma client
npx prisma migrate dev           # Run migrations
npx prisma migrate deploy        # Deploy migrations (production)
npx prisma db seed               # Seed database
npx prisma studio                # Open Prisma Studio GUI

# Building
nx build api                     # Build for production

# Testing
nx test api                      # Run unit tests
nx e2e api-e2e                   # Run e2e tests
```

## Implementation Notes

1. **Start without auth** — For MVP, all endpoints work without authentication
2. **Add userId later** — When auth is added, filter all queries by userId
3. **Use DTOs** — Always validate input with class-validator
4. **Return consistent responses** — Use interceptor to wrap all responses
5. **Handle errors** — Use exception filter for consistent error format
6. **Seed paint database** — Include all Citadel paints in seed file
