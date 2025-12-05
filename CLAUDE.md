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
