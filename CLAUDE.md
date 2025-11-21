# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack **Project Cost Management Application** built with NestJS (backend) and Angular 21 (frontend). The application manages project costs, tasks, team members, and provides comprehensive project tracking with a PostgreSQL database using Prisma ORM.

## Repository Structure

```
Project-Cost-Management-App/
├── backend/project-cost-api/    # NestJS API server
│   ├── src/
│   │   ├── prisma/              # Prisma services and utilities
│   │   ├── app.module.ts        # Root application module
│   │   └── main.ts              # Application entry point
│   └── prisma/
│       └── schema.prisma        # Database schema
└── frontend/project-cost-client/ # Angular frontend
    ├── src/app/                 # Angular application
    └── angular.json             # Angular CLI configuration
```

## Backend (NestJS)

### Commands

```bash
# Navigate to backend directory
cd backend/project-cost-api

# Install dependencies
npm install

# Database operations
npx prisma generate              # Generate Prisma Client
npx prisma migrate dev           # Run migrations in development
npx prisma migrate deploy        # Run migrations in production
npx prisma studio               # Open Prisma Studio (database GUI)

# Development
npm run start:dev               # Start with hot reload
npm run start:debug            # Start with debugging

# Build & Production
npm run build                  # Compile TypeScript
npm run start:prod            # Run production build

# Testing
npm run test                  # Run unit tests
npm run test:watch           # Run tests in watch mode
npm run test:cov            # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Linting & Formatting
npm run lint               # Run ESLint
npm run format            # Format code with Prettier
```

### Architecture

**Core Modules:**
- **PrismaModule**: Global module providing database access via PrismaService and ShadowPrismaService
- **ScheduleModule**: Handles scheduled tasks (archive jobs run daily at midnight)

**Database Architecture:**
- **Primary Database**: Main PostgreSQL database for active records
- **Shadow Database**: Archive database for soft-deleted records (user archiving strategy)
- **Prisma Client Output**: Custom location at `src/generated/prisma` (non-standard)

**Key Services:**
- `PrismaService`: Main database connection extending PrismaClient
- `ShadowPrismaService`: Archive database connection for deleted records
- `ArchiveTask`: Scheduled job (@Cron) that archives deleted users daily

**Database Models** (see schema.prisma for full details):
- User management (with soft delete via deletedAt)
- Projects with phases, tasks, and team members
- Cost tracking (categories, costs, templates)
- Time entries and task comments
- Notifications and audit logs
- Team ratings and discussions

**Important Design Patterns:**
- Soft delete pattern for Users (deletedAt timestamp)
- Dual database strategy (primary + shadow for archives)
- Comprehensive audit logging via AuditLog model
- Rich relationship mappings (cascading deletes, bidirectional relations)

### Known Issues & Important Notes

**Critical:** Review [PRISMA_NESTJS_ANALYSIS.md](PRISMA_NESTJS_ANALYSIS.md) before making Prisma-related changes. Key issues:
- PrismaService uses `PrismaPg` adapter unnecessarily (should use standard PrismaClient)
- Environment variables (DATABASE_URL, SHADOW_DATABASE_URL) lack validation
- ShadowPrismaService should be in PrismaModule, not directly in AppModule
- Consider using NestJS Logger instead of console.log

**Environment Variables Required:**
- `DATABASE_URL`: PostgreSQL connection string for main database
- `SHADOW_DATABASE_URL`: PostgreSQL connection string for archive database
- `NODE_ENV`: Environment (development/production)

## Frontend (Angular)

### Commands

```bash
# Navigate to frontend directory
cd frontend/project-cost-client

# Install dependencies
npm install

# Development
ng serve                    # Start dev server (http://localhost:4200)
npm start                  # Alias for ng serve

# Build
ng build                   # Build for production (outputs to dist/)
npm run watch             # Build in watch mode

# Testing
ng test                   # Run unit tests with Vitest
npm run test             # Alias for ng test

# Code Generation
ng generate component <name>    # Generate new component
ng generate service <name>      # Generate new service
ng generate --help              # See all generation options
```

### Architecture

**Framework:** Angular 21 with standalone components architecture

**Key Dependencies:**
- **Angular Material**: UI component library (@angular/material, @angular/cdk)
- **Chart.js + ng2-charts**: Data visualization
- **Angular SSR**: Server-side rendering support (@angular/ssr)

**Configuration:**
- Prettier configured (100 char width, single quotes, Angular HTML parser)
- Vitest for testing (replacing Karma/Jasmine)
- TypeScript 5.9.2

**Current State:** Basic Angular scaffolding with empty routes (routes: Routes = [])

## Development Workflow

### Starting Development

1. **Backend:**
   ```bash
   cd backend/project-cost-api
   npm install
   npx prisma generate
   npm run start:dev
   ```

2. **Frontend:**
   ```bash
   cd frontend/project-cost-client
   npm install
   npm start
   ```

### Working with Database

- Always run `npx prisma generate` after schema changes
- Use `npx prisma migrate dev --name <description>` for new migrations
- Access Prisma Studio with `npx prisma studio` for database inspection
- Schema location: `backend/project-cost-api/prisma/schema.prisma`

### Code Style

- **Backend**: ESLint + Prettier configured
- **Frontend**: Prettier configured with Angular-specific rules
- Use `npm run format` (backend) to auto-format code

## Testing Strategy

- **Backend**: Jest for unit and e2e tests
- **Frontend**: Vitest for unit tests
- Both projects support test coverage reporting

## Architecture Decis)ions

1. **Dual Database Strategy**: Implements data archiving with primary + shadow databases
2. **Scheduled Jobs**: NestJS @nestjs/schedule for automated archiving (daily at midnight)
3. **Soft Deletes**: User records use deletedAt timestamp before archiving
4. **Custom Prisma Output**: Client generated to `src/generated/prisma` (consider moving to standard location)
5. **Standalone Angular**: Uses Angular 21's standalone components (no NgModules)
can provide commit message without mention claude
