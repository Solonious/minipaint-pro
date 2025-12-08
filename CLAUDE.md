# MiniPaint Pro — Claude Code Project Instructions

## Project Overview

MiniPaint Pro is a miniature painting companion app for Warhammer 40K hobbyists. It helps painters track their "Pile of Shame" (unpainted miniatures), manage paint collections, follow recipes, and stay motivated through gamification.

**Key Value Proposition:** First app to connect "what paints needed" → "what's painted" → "ready to play" → "staying motivated"

## Tech Stack

- **Monorepo:** Nx
- **Frontend:** Angular 20 (standalone components, signals)
- **Backend:** NestJS (Phase 2, optional for MVP)
- **UI Library:** PrimeNG (latest)
- **Styling:** SCSS with CSS custom properties
- **State:** Angular Signals + localStorage (Phase 1), API + database (Phase 2)
- **Database:** PostgreSQL with Prisma (Phase 2)
- **Hosting:** Vercel (frontend), Railway/Render (backend)

## Repository Structure

```
minipaint-pro/
├── CLAUDE.md                       # This file — project instructions
├── README.md                       # Project documentation
├── nx.json                         # Nx workspace configuration
├── package.json                    # Root dependencies
├── tsconfig.base.json              # Base TypeScript config
├── .gitignore
├── .env.example                    # Environment variables template
│
├── apps/
│   ├── web/                        # Angular 20 frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/           # Singleton services, guards, interceptors
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── storage.service.ts
│   │   │   │   │   │   ├── miniature.service.ts
│   │   │   │   │   │   ├── army.service.ts
│   │   │   │   │   │   ├── paint.service.ts
│   │   │   │   │   │   ├── recipe.service.ts
│   │   │   │   │   │   └── progress.service.ts
│   │   │   │   │   └── guards/
│   │   │   │   │
│   │   │   │   ├── shared/         # Reusable components, pipes, directives
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── mini-card/
│   │   │   │   │   │   ├── paint-card/
│   │   │   │   │   │   ├── progress-ring/
│   │   │   │   │   │   ├── achievement-badge/
│   │   │   │   │   │   ├── goal-progress/
│   │   │   │   │   │   ├── status-badge/
│   │   │   │   │   │   └── points-badge/
│   │   │   │   │   ├── pipes/
│   │   │   │   │   └── directives/
│   │   │   │   │
│   │   │   │   ├── features/       # Feature modules (lazy loaded)
│   │   │   │   │   ├── pile-of-shame/
│   │   │   │   │   ├── army-dashboard/
│   │   │   │   │   ├── paint-collection/
│   │   │   │   │   ├── recipes/
│   │   │   │   │   └── progress/
│   │   │   │   │
│   │   │   │   ├── layout/
│   │   │   │   │   ├── shell/
│   │   │   │   │   ├── sidebar/
│   │   │   │   │   └── bottom-nav/
│   │   │   │   │
│   │   │   │   ├── app.component.ts
│   │   │   │   ├── app.config.ts
│   │   │   │   └── app.routes.ts
│   │   │   │
│   │   │   ├── styles/
│   │   │   │   ├── _tokens.scss
│   │   │   │   ├── _typography.scss
│   │   │   │   ├── _primeng-theme.scss
│   │   │   │   ├── _utilities.scss
│   │   │   │   └── styles.scss
│   │   │   │
│   │   │   ├── assets/
│   │   │   ├── environments/
│   │   │   ├── index.html
│   │   │   └── main.ts
│   │   │
│   │   ├── project.json
│   │   └── tsconfig.app.json
│   │
│   └── api/                        # NestJS backend (Phase 2)
│       └── ...
│
├── libs/
│   └── shared/
│       └── types/                  # Shared TypeScript interfaces
│           └── src/
│               ├── index.ts
│               ├── miniature.model.ts
│               ├── army.model.ts
│               ├── paint.model.ts
│               ├── recipe.model.ts
│               └── progress.model.ts
│
└── tools/
```

## Design System

### Color Tokens

```scss
// Core backgrounds
--bg-void: #0a0a0f;
--bg-panel: #12121a;
--bg-card: #1a1a25;
--bg-elevated: #222230;

// Borders
--border-dim: #2a2a3a;
--border-glow: #3a3a50;

// Accent (Gold Imperial)
--gold: #c9a227;
--gold-bright: #e6c84a;

// Status colors
--status-unbuilt: #4a4a55;
--status-assembled: #6b5b3d;
--status-primed: #3d5a6b;
--status-wip: #6b3d5a;
--status-painted: #3d6b4f;
--status-complete: #c9a227;

// Semantic
--success: #5fa67a;
--error: #d93d5c;
--info: #3a7bd5;

// Text
--text-primary: #e8e6e3;
--text-secondary: #9a9890;
--text-dim: #5a584f;
```

### Typography

- **Display/Headings:** Cinzel (Google Fonts)
- **Body/UI:** Rajdhani (Google Fonts)
- **Numbers:** JetBrains Mono (Google Fonts)

### Spacing: 4, 8, 16, 24, 32, 48px

### Radius: 4, 8, 12, 16px

## Data Models

```typescript
// Miniature
interface Miniature {
  id: string;
  name: string;
  faction: string;
  armyId?: string;
  points: number;
  modelCount: number;
  status: 'unbuilt' | 'assembled' | 'primed' | 'wip' | 'painted' | 'complete';
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

// Army
interface Army {
  id: string;
  name: string;
  faction: string;
  gameSystem: '40k' | 'aos' | 'killteam' | 'other';
  targetPoints: number;
  iconEmoji?: string;
}

// Paint
interface Paint {
  id: string;
  name: string;
  brand: 'citadel' | 'vallejo' | 'army_painter' | 'scale75' | 'other';
  type: 'base' | 'layer' | 'shade' | 'contrast' | 'technical' | 'dry';
  colorHex: string;
  owned: boolean;
}

// Recipe
interface Recipe {
  id: string;
  name: string;
  authorName: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeMinutes: number;
  rating: number;
  steps: RecipeStep[];
  paintIds: string[];
  previewColorHex: string;
  saved: boolean;
}

// Progress
interface UserProgress {
  currentStreak: number;
  bestStreak: number;
  lastPaintedDate: string | null;
  achievements: { achievementId: string; unlockedAt: string }[];
  weeklyGoals: Goal[];
}
```

## Application Screens

1. **Pile of Shame** (`/pile`) — Kanban board with 6 status columns
2. **Army Dashboard** (`/armies`) — Army cards with progress rings
3. **Paint Collection** (`/paints`) — Grid of paint swatches
4. **Recipes** (`/recipes`) — Recipe cards with detail view
5. **Progress** (`/progress`) — Streaks, goals, achievements

## Commands

```bash
# Frontend
nx serve web                    # Start Angular dev server (port 4200)
nx build web                    # Production build
nx test web                     # Run tests
nx g @nx/angular:component name --project=web --standalone

# Backend
nx serve api                    # Start NestJS dev server (port 3000)
nx build api                    # Production build
nx test api                     # Run tests

# Database
npx prisma generate             # Generate Prisma client
npx prisma migrate dev          # Run migrations
npx prisma db seed              # Seed database
npx prisma studio               # Open Prisma Studio

# Both
nx run-many -t serve -p web api # Start both servers
```

## Backend Structure

See `CLAUDE-API.md` for complete backend documentation including:

- NestJS project structure
- Prisma schema with all models
- API endpoints for all features
- Environment configuration

```
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/                 # Filters, guards, interceptors
│   ├── config/                 # Environment config
│   ├── prisma/                 # Database service
│   └── modules/
│       ├── miniatures/
│       ├── armies/
│       ├── paints/
│       ├── recipes/
│       ├── progress/
│       └── users/              # Auth (Phase 2)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── .env
```

## Implementation Order

1. Project setup (Nx + Angular + PrimeNG)
2. Design tokens + PrimeNG theme
3. Layout shell + routing
4. Shared components
5. Services (localStorage)
6. Pile of Shame screen
7. Army Dashboard screen
8. Paint Collection screen
9. Progress screen
10. Recipes screen

## Notes

- Use Angular 20 standalone components
- Use Angular Signals for state
- Mobile-first responsive design
- Dark theme only
- Offline-first (localStorage)

## PrimeNG Component Guidelines

- **Dropdown/Select in Modals:** All PrimeNG dropdown components (`p-select`, `p-dropdown`, `p-multiselect`, etc.) inside dialogs/modals MUST use `appendTo="body"` to ensure the dropdown overlay renders outside the modal and doesn't get clipped

---

## Future Features Research

### Miniature Library Feature

The miniature library allows users to manage a comprehensive collection of miniatures with rich media content, paint schemes, and tutorial videos.

#### Feature Requirements

1. **Miniature Detail Page** (`/miniatures/:id`)
   - Multiple screenshots/images (gallery)
   - Paint schema (color scheme with paints used)
   - Available paints list
   - Optional YouTube video tutorials

2. **Library Scope**
   - Common miniatures not dependent on army type
   - Each unit has its own dedicated page
   - Shared across the platform (not user-specific)

---

### Multiple Images (Gallery System)

#### Recommended: Separate MiniatureImage Table

```prisma
model MiniatureImage {
  id           String   @id @default(uuid())
  miniatureId  String
  filename     String
  originalName String
  mimeType     String
  size         Int
  caption      String?
  imageType    MiniatureImageType
  order        Int      @default(0)
  createdAt    DateTime @default(now())

  miniature    Miniature @relation(fields: [miniatureId], references: [id])

  @@map("miniature_images")
}

enum MiniatureImageType {
  REFERENCE    // Official/inspiration images
  WIP          // Work in progress shots
  COMPLETED    // Final painted result
  DETAIL       // Close-up details
}
```

**Benefits:**
- Unlimited images per miniature
- Image categorization (WIP, completed, etc.)
- Reorderable gallery
- Caption support for each image

**Alternative:** JSON array field (`images: Json?`) - simpler but less queryable

---

### Paint Schema (Color Scheme)

#### Option A: Link to Existing Recipe System (Simpler)

```prisma
model Miniature {
  // ... existing fields
  paintSchemeId  String?
  paintScheme    Recipe?  @relation(fields: [paintSchemeId], references: [id])
}
```

Leverages existing Recipe model with steps, paints, difficulty, and time estimates.

#### Option B: Dedicated ColorScheme Model (More Flexible)

```prisma
model ColorScheme {
  id           String   @id @default(uuid())
  miniatureId  String   @unique
  name         String
  sections     ColorSchemeSection[]

  miniature    Miniature @relation(fields: [miniatureId], references: [id])
}

model ColorSchemeSection {
  id            String   @id @default(uuid())
  schemeId      String
  areaName      String   // "Armor", "Cloak", "Weapon", "Base"
  paints        SectionPaint[]

  scheme        ColorScheme @relation(fields: [schemeId], references: [id])
}

model SectionPaint {
  id          String   @id @default(uuid())
  sectionId   String
  paintId     String
  order       Int
  technique   String?  // "Base coat", "Layer", "Wash", "Edge highlight"

  section     ColorSchemeSection @relation(fields: [sectionId], references: [id])
  paint       Paint @relation(fields: [paintId], references: [id])
}
```

---

### YouTube Video Integration

#### Option A: Simple URL Field (MVP)

```prisma
model Miniature {
  // ... existing fields
  tutorialVideoUrl  String?  // YouTube URL
}
```

Frontend helper to extract video ID:
```typescript
getYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
```

#### Option B: Multiple Videos with Metadata

```prisma
model MiniatureTutorial {
  id           String   @id @default(uuid())
  miniatureId  String
  title        String
  videoUrl     String
  platform     VideoPlatform  // YOUTUBE, VIMEO, CUSTOM
  duration     Int?           // seconds
  author       String?
  order        Int     @default(0)

  miniature    Miniature @relation(fields: [miniatureId], references: [id])
}

enum VideoPlatform {
  YOUTUBE
  VIMEO
  CUSTOM
}
```

#### External API Option

YouTube Data API v3 for auto-fetching tutorials:
- Rate limit: 10,000 units/day free
- Search query: `"how to paint {unit_name} {faction}"`

---

### Miniature Detail Page Structure

```
/miniatures/:id
├── Header
│   ├── Miniature name & faction
│   ├── Status badge
│   └── Points & model count
│
├── Image Gallery (PrimeNG Galleria)
│   ├── Primary image (large)
│   ├── Thumbnail strip
│   └── Lightbox on click
│
├── Paint Scheme Section
│   ├── Color swatches overview
│   ├── Area-by-area breakdown
│   └── "Add to shopping list" button
│
├── Tutorial Videos
│   ├── Embedded YouTube player
│   └── Additional video links
│
├── Notes Section
│   └── User's personal notes
│
└── Actions
    ├── Edit button
    ├── Update status
    └── Link to army
```

---

### Media Storage Architecture

#### Current State (Development Only)

Files stored at: `apps/api/uploads/units/` (local filesystem)

**Problems:**
- Lost on deployment/container restart
- Doesn't scale across multiple servers
- Limited storage capacity

#### Recommended: Cloud Object Storage

Use S3-compatible storage (AWS S3, Cloudflare R2, DigitalOcean Spaces, Supabase Storage).

**Unified MediaFile Model:**

```prisma
model MediaFile {
  id           String      @id @default(uuid())

  // Storage info
  storageKey   String      @unique  // "miniatures/abc/img1.jpg"
  provider     StorageProvider @default(CLOUDFLARE_R2)
  bucketName   String      @default("minipaint-media")

  // File metadata
  filename     String
  originalName String
  mimeType     String
  size         Int
  width        Int?        // For images
  height       Int?        // For images
  duration     Int?        // For videos (seconds)

  // URLs
  publicUrl    String      // CDN URL for display

  // Relations (polymorphic)
  entityType   EntityType  // MINIATURE, UNIT, RECIPE_STEP
  entityId     String
  mediaType    MediaType   // IMAGE, VIDEO, THUMBNAIL
  order        Int         @default(0)
  caption      String?

  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([entityType, entityId])
  @@map("media_files")
}

enum StorageProvider {
  LOCAL           // Development only
  CLOUDFLARE_R2
  AWS_S3
  SUPABASE
  CLOUDINARY
}

enum EntityType {
  MINIATURE
  UNIT
  RECIPE_STEP
  USER_AVATAR
}

enum MediaType {
  IMAGE
  VIDEO
  THUMBNAIL
}
```

#### Storage Provider Comparison

| Provider | Pros | Cons | Cost |
|----------|------|------|------|
| **Cloudflare R2** | Free egress, S3-compatible | Newer service | $0.015/GB storage |
| **Supabase Storage** | Integrates with auth | Limited free tier | 1GB free, then $0.021/GB |
| **AWS S3** | Industry standard, reliable | Egress fees | $0.023/GB + egress |
| **Cloudinary** | Image optimization, video processing | Expensive at scale | 25GB free |

**Recommendation:** Cloudflare R2 for cost-effectiveness (free egress)

#### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Angular)                   │
│  - Presigned URL upload (direct to storage)             │
│  - Display via CDN URLs                                  │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                     Backend (NestJS)                     │
│  - Generate presigned upload URLs                        │
│  - Store metadata in PostgreSQL                          │
│  - Validate file types/sizes                             │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────────┐    ┌─────────────────────┐
│    PostgreSQL     │    │   Cloud Storage     │
│  - MediaFile      │    │  (S3/R2/Supabase)   │
│  - metadata only  │    │  - actual files     │
│  - relations      │    │  - CDN delivery     │
└───────────────────┘    └─────────────────────┘
```

---

### Implementation Priority

| Priority | Feature | Complexity | Dependencies |
|----------|---------|------------|--------------|
| 1 | Miniature detail page route | Low | None |
| 2 | Cloud storage integration | Medium | Provider account |
| 3 | MediaFile model + API | Medium | Prisma migration |
| 4 | Multiple images gallery | Medium | PrimeNG Galleria |
| 5 | YouTube URL field | Low | Model update |
| 6 | Video embed component | Low | None |
| 7 | Paint scheme linking | Medium | Recipe system |
| 8 | Paint scheme UI | High | Paint collection |

---

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
