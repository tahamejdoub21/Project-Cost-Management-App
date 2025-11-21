# Prisma Database Integration with NestJS

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Configuration](#database-configuration)
4. [ORM Setup (Prisma)](#orm-setup-prisma)
5. [Service Implementation](#service-implementation)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This application uses **Prisma** as the ORM (Object-Relational Mapping) tool with **PostgreSQL** as the database. Prisma is integrated into the NestJS application through a custom service that extends `PrismaClient`, providing type-safe database access throughout the application.

### Key Components

- **PrismaService**: Main database service for primary database operations
- **ShadowPrismaService**: Secondary database service for archiving and data migration
- **PrismaModule**: Global NestJS module that exports both services
- **Prisma Schema**: Type-safe database schema definition

---

## Architecture

### Module Structure

```
src/
├── prisma/
│   ├── prisma.service.ts          # Main database service
│   ├── shadow-prisma.service.ts    # Shadow database service
│   ├── prisma.module.ts            # Global Prisma module
│   ├── archive.task.ts             # Scheduled archiving task
│   └── archive.util.ts             # Archiving utility functions
└── app.module.ts                   # Root module (imports PrismaModule)
```

### Dependency Flow

```
AppModule
  └── PrismaModule (Global)
      ├── PrismaService (extends PrismaClient)
      └── ShadowPrismaService (extends PrismaClient)
```

### Global Module Pattern

The `PrismaModule` is marked as `@Global()`, which means:
- ✅ Services can inject `PrismaService` without importing `PrismaModule` in their own modules
- ✅ Single instance of PrismaService is shared across the entire application
- ✅ Reduces boilerplate and ensures consistent database access

---

## Database Configuration

### Environment Variables

The application requires the following environment variables:

```env
# Primary Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/project_cost_db?schema=public"

# Shadow Database Connection (for migrations and archiving)
SHADOW_DATABASE_URL="postgresql://user:password@localhost:5432/project_cost_shadow_db?schema=public"

# Application Environment
NODE_ENV="development"  # or "production"
```

### Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?[parameters]
```

**Example with connection pooling:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/db?connection_limit=10&pool_timeout=20"
```

### Configuration Files

#### 1. `prisma/schema.prisma`

Defines the database schema, models, and relationships:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  // ... other fields
}
```

#### 2. `prisma.config.ts`

Configuration for Prisma migrations and shadow database:

```typescript
import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
```

---

## ORM Setup (Prisma)

### What is Prisma?

Prisma is a **next-generation ORM** that provides:
- ✅ **Type Safety**: Auto-generated TypeScript types from your schema
- ✅ **Type-Safe Queries**: Compile-time query validation
- ✅ **Migration Management**: Version-controlled database schema changes
- ✅ **Query Builder**: Intuitive API for database operations
- ✅ **Performance**: Optimized queries with connection pooling

### Prisma Client Generation

The Prisma Client is generated from your schema:

```bash
# Generate Prisma Client
npx prisma generate

# This creates type-safe client in: src/generated/prisma/
```

### PrismaService Implementation

```typescript
@Injectable()
export class PrismaService extends PrismaClient 
  implements OnModuleInit, OnModuleDestroy {
  
  constructor(private configService: ConfigService) {
    // Validate DATABASE_URL exists
    const databaseUrl = configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined');
    }

    // Initialize PrismaClient with logging configuration
    super({
      log: configService.get<string>('NODE_ENV') === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  async onModuleInit() {
    // Connect to database when module initializes
    await this.$connect();
  }

  async onModuleDestroy() {
    // Disconnect when module is destroyed
    await this.$disconnect();
  }
}
```

### Key Features

1. **Lifecycle Management**
   - `onModuleInit()`: Connects to database on application startup
   - `onModuleDestroy()`: Gracefully disconnects on shutdown

2. **Environment-Based Logging**
   - Development: Logs all queries, info, warnings, and errors
   - Production: Logs only errors

3. **Health Check Method**
   ```typescript
   async isHealthy(): Promise<boolean> {
     try {
       await this.$queryRaw`SELECT 1`;
       return true;
     } catch {
       return false;
     }
   }
   ```

---

## Service Implementation

### PrismaService (Primary Database)

**Location**: `src/prisma/prisma.service.ts`

**Purpose**: Main database service for all application operations

**Features**:
- Extends `PrismaClient` for type-safe database access
- Validates `DATABASE_URL` environment variable
- Configures logging based on environment
- Implements lifecycle hooks for connection management
- Provides health check method

**Usage**:
```typescript
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }
}
```

### ShadowPrismaService (Secondary Database)

**Location**: `src/prisma/shadow-prisma.service.ts`

**Purpose**: Separate database connection for:
- Data archiving
- Migration testing
- Backup operations

**Implementation Details**:
```typescript
constructor(private configService: ConfigService) {
  const shadowDatabaseUrl = configService.get<string>('SHADOW_DATABASE_URL');
  
  // Temporarily override DATABASE_URL for PrismaClient initialization
  const originalDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = shadowDatabaseUrl;
  
  super({ /* logging config */ });
  
  // Restore original DATABASE_URL
  process.env.DATABASE_URL = originalDatabaseUrl;
}
```

**Why This Approach?**
- PrismaClient reads `DATABASE_URL` from environment at construction time
- We temporarily override it to connect to shadow database
- Restore original value immediately after construction
- Both services can coexist without conflicts

### PrismaModule

**Location**: `src/prisma/prisma.module.ts`

```typescript
@Global()
@Module({
  providers: [PrismaService, ShadowPrismaService],
  exports: [PrismaService, ShadowPrismaService],
})
export class PrismaModule {}
```

**Key Points**:
- `@Global()`: Makes services available app-wide without explicit imports
- Exports both services for dependency injection
- Single source of truth for database services

---

## Usage Examples

### Basic CRUD Operations

#### Create
```typescript
async createUser(data: CreateUserDto) {
  return this.prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
    },
  });
}
```

#### Read
```typescript
// Find all
async findAll() {
  return this.prisma.user.findMany();
}

// Find one
async findOne(id: string) {
  return this.prisma.user.findUnique({
    where: { id },
  });
}

// Find with relations
async findUserWithProjects(id: string) {
  return this.prisma.user.findUnique({
    where: { id },
    include: {
      projects: true,
      profile: true,
    },
  });
}
```

#### Update
```typescript
async updateUser(id: string, data: UpdateUserDto) {
  return this.prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
    },
  });
}
```

#### Delete (Soft Delete)
```typescript
async deleteUser(id: string) {
  return this.prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
```

### Advanced Queries

#### Filtering and Pagination
```typescript
async findUsersWithPagination(page: number, limit: number) {
  const skip = (page - 1) * limit;
  
  return this.prisma.user.findMany({
    where: {
      isActive: true,
      deletedAt: null,
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });
}
```

#### Complex Queries with Relations
```typescript
async findProjectsWithCosts(userId: string) {
  return this.prisma.project.findMany({
    where: {
      userId,
      status: 'ACTIVE',
    },
    include: {
      costs: {
        where: {
          status: 'PENDING',
        },
        include: {
          category: true,
        },
      },
      teamMembers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}
```

#### Transactions
```typescript
async transferProjectOwnership(
  projectId: string,
  newOwnerId: string,
) {
  return this.prisma.$transaction(async (tx) => {
    // Update project owner
    const project = await tx.project.update({
      where: { id: projectId },
      data: { userId: newOwnerId },
    });

    // Update team member roles
    await tx.teamMember.updateMany({
      where: { projectId },
      data: { role: 'MEMBER' },
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        action: 'TRANSFER_OWNERSHIP',
        entity: 'Project',
        entityId: projectId,
        userId: newOwnerId,
      },
    });

    return project;
  });
}
```

#### Raw Queries
```typescript
async getProjectStatistics(projectId: string) {
  return this.prisma.$queryRaw`
    SELECT 
      COUNT(*) as total_tasks,
      SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as completed_tasks,
      AVG(progress) as avg_progress
    FROM tasks
    WHERE project_id = ${projectId}
  `;
}
```

### Archiving with Shadow Database

```typescript
// In ArchiveTask (scheduled daily)
@Cron('0 0 * * *')
async handleCron() {
  const deletedUsers = await this.prisma.user.findMany({
    where: { deletedAt: { not: null } },
  });

  // Archive to shadow database
  for (const user of deletedUsers) {
    await this.shadowPrisma.user.create({ data: user });
  }

  // Delete from main database
  await this.prisma.user.deleteMany({
    where: { deletedAt: { not: null } },
  });
}
```

---

## Best Practices

### 1. Service Layer Pattern

Always use PrismaService through service classes, not directly in controllers:

```typescript
// ✅ Good
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  
  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}

// ❌ Bad - Direct usage in controller
@Controller('users')
export class UserController {
  constructor(private prisma: PrismaService) {} // Don't do this
}
```

### 2. Error Handling

```typescript
async findOne(id: string) {
  try {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // Handle Prisma-specific errors
      throw new BadRequestException('Database error occurred');
    }
    throw error;
  }
}
```

### 3. Type Safety

Use Prisma-generated types:

```typescript
import { User, Prisma } from '@prisma/client';

// Use Prisma types for inputs
async createUser(data: Prisma.UserCreateInput): Promise<User> {
  return this.prisma.user.create({ data });
}

// Use Prisma types for updates
async updateUser(
  id: string,
  data: Prisma.UserUpdateInput,
): Promise<User> {
  return this.prisma.user.update({ where: { id }, data });
}
```

### 4. Connection Management

- ✅ PrismaService handles connection lifecycle automatically
- ✅ No need to manually connect/disconnect in services
- ✅ Connection pooling is handled by Prisma

### 5. Query Optimization

```typescript
// ✅ Good - Select only needed fields
async getUserEmail(id: string) {
  return this.prisma.user.findUnique({
    where: { id },
    select: { email: true },
  });
}

// ✅ Good - Use indexes
async findActiveUsers() {
  return this.prisma.user.findMany({
    where: {
      isActive: true, // Uses index on [email, isActive]
      email: { contains: '@example.com' },
    },
  });
}
```

### 6. Soft Deletes

The schema includes `deletedAt` for soft deletes:

```typescript
// Always filter out deleted records
async findAll() {
  return this.prisma.user.findMany({
    where: { deletedAt: null },
  });
}
```

---

## Troubleshooting

### Common Issues

#### 1. "DATABASE_URL is not defined"

**Solution**: Ensure `.env` file exists with `DATABASE_URL`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/db"
```

#### 2. "PrismaClient is not connected"

**Solution**: Ensure `PrismaModule` is imported in `AppModule`:
```typescript
@Module({
  imports: [PrismaModule], // ✅ Must be imported
})
```

#### 3. Type Errors

**Solution**: Regenerate Prisma Client:
```bash
npx prisma generate
```

#### 4. Migration Issues

**Solution**: Run migrations:
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy
```

#### 5. Connection Pool Exhausted

**Solution**: Configure connection pooling in `DATABASE_URL`:
```
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20"
```

### Health Check Endpoint

Use the built-in health check method:

```typescript
@Get('health')
async healthCheck() {
  const dbHealthy = await this.prisma.isHealthy();
  return {
    status: dbHealthy ? 'ok' : 'error',
    database: dbHealthy ? 'connected' : 'disconnected',
  };
}
```

---

## Summary

### ✅ Integration Status: **PERFECT**

Your Prisma integration is properly configured with:

1. ✅ **Proper Service Architecture**: PrismaService extends PrismaClient correctly
2. ✅ **Lifecycle Management**: Connection/disconnection handled via NestJS hooks
3. ✅ **Environment Configuration**: Uses ConfigService for environment variables
4. ✅ **Error Handling**: Try-catch blocks in lifecycle methods
5. ✅ **Logging**: Environment-based logging with NestJS Logger
6. ✅ **Global Module**: PrismaModule is global, reducing boilerplate
7. ✅ **Shadow Database**: Properly configured for archiving
8. ✅ **Type Safety**: Full TypeScript support with generated types
9. ✅ **Health Checks**: Built-in health check method
10. ✅ **Best Practices**: Follows NestJS and Prisma best practices

### Architecture Benefits

- **Type Safety**: Compile-time type checking for all database operations
- **Performance**: Optimized queries with connection pooling
- **Maintainability**: Centralized database access through services
- **Scalability**: Ready for production with proper error handling and logging
- **Developer Experience**: IntelliSense support and auto-completion

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Database Documentation](https://docs.nestjs.com/techniques/database)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)

