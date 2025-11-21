# Prisma Quick Reference Guide

## 🚀 Quick Start

### Using PrismaService in Your Services

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class YourService {
  constructor(private prisma: PrismaService) {}

  // Your methods here
}
```

---

## 📝 Common Operations

### Create
```typescript
const user = await this.prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: 'hashedPassword',
  },
});
```

### Read (Find One)
```typescript
const user = await this.prisma.user.findUnique({
  where: { id: 'user-id' },
});
```

### Read (Find Many)
```typescript
const users = await this.prisma.user.findMany({
  where: { isActive: true },
  orderBy: { createdAt: 'desc' },
});
```

### Update
```typescript
const user = await this.prisma.user.update({
  where: { id: 'user-id' },
  data: { name: 'Jane Doe' },
});
```

### Delete (Soft Delete)
```typescript
const user = await this.prisma.user.update({
  where: { id: 'user-id' },
  data: { deletedAt: new Date() },
});
```

### Delete (Hard Delete)
```typescript
await this.prisma.user.delete({
  where: { id: 'user-id' },
});
```

---

## 🔗 Relations

### Include Relations
```typescript
const user = await this.prisma.user.findUnique({
  where: { id: 'user-id' },
  include: {
    projects: true,
    profile: true,
  },
});
```

### Select Specific Fields
```typescript
const user = await this.prisma.user.findUnique({
  where: { id: 'user-id' },
  select: {
    id: true,
    email: true,
    name: true,
    projects: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});
```

---

## 🔍 Filtering

### Basic Filters
```typescript
const users = await this.prisma.user.findMany({
  where: {
    isActive: true,
    role: 'USER',
    deletedAt: null,
  },
});
```

### Advanced Filters
```typescript
const users = await this.prisma.user.findMany({
  where: {
    email: { contains: '@example.com' },
    createdAt: { gte: new Date('2024-01-01') },
    OR: [
      { role: 'ADMIN' },
      { role: 'MANAGER' },
    ],
  },
});
```

---

## 📄 Pagination

```typescript
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;

const users = await this.prisma.user.findMany({
  skip,
  take: limit,
  orderBy: { createdAt: 'desc' },
});

const total = await this.prisma.user.count();
```

---

## 💾 Transactions

```typescript
const result = await this.prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'user@example.com' },
  });

  await tx.project.create({
    data: {
      userId: user.id,
      name: 'My Project',
    },
  });

  return user;
});
```

---

## 🔧 Raw Queries

```typescript
const results = await this.prisma.$queryRaw`
  SELECT * FROM users 
  WHERE "isActive" = true 
  AND "deletedAt" IS NULL
`;
```

---

## ⚡ Performance Tips

### Use Select Instead of Include
```typescript
// ✅ Good - Only fetches needed fields
const user = await this.prisma.user.findUnique({
  where: { id },
  select: { email: true, name: true },
});

// ⚠️ Less efficient - Fetches all fields
const user = await this.prisma.user.findUnique({
  where: { id },
  include: { profile: true },
});
```

### Use Indexes
```typescript
// ✅ Uses index on [email, isActive]
const user = await this.prisma.user.findFirst({
  where: {
    email: 'user@example.com',
    isActive: true,
  },
});
```

---

## 🛡️ Error Handling

```typescript
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

try {
  const user = await this.prisma.user.create({ data });
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      throw new ConflictException('Email already exists');
    }
  }
  throw error;
}
```

---

## 🔍 Common Prisma Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| P2002 | Unique constraint violation | Check for duplicate values |
| P2025 | Record not found | Verify the record exists |
| P2003 | Foreign key constraint | Check related records exist |
| P2014 | Required relation missing | Provide required relations |

---

## 📊 Health Check

```typescript
const isHealthy = await this.prisma.isHealthy();
// Returns: true if database is connected, false otherwise
```

---

## 🔄 Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

---

## 📚 Type Safety

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

---

## 🎯 Best Practices Checklist

- [ ] Always use PrismaService through service classes
- [ ] Filter out soft-deleted records (`deletedAt: null`)
- [ ] Use `select` instead of `include` when possible
- [ ] Handle Prisma errors appropriately
- [ ] Use transactions for multi-step operations
- [ ] Leverage indexes for frequently queried fields
- [ ] Use pagination for large datasets
- [ ] Validate input data before database operations

---

## 📖 Full Documentation

For complete documentation, see:
- [Prisma Database Integration Guide](./PRISMA_DATABASE_INTEGRATION.md)
- [Integration Verification Report](./INTEGRATION_VERIFICATION.md)

