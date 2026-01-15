# Prisma Seeding Guide

## Overview
This guide explains how to seed your Prisma database using `prisma/volunteerSeedTest.ts`.

## Prerequisites

1. **Database is set up and migrations are applied:**
   ```bash
   # Make sure your DATABASE_URL is set in .env
   # Run migrations first
   npx prisma migrate dev
   ```

2. **Prisma Client is generated:**
   ```bash
   npx prisma generate
   ```

## Seeding Methods

### Method 1: Using npm script (Recommended)

```bash
npm run seed
```

This runs the seed file using `ts-node` to execute TypeScript directly.

### Method 2: Using Prisma's built-in seed command

```bash
npx prisma db seed
```

This uses the `prisma.seed` configuration in `package.json`.

### Method 3: Direct execution with ts-node

```bash
npx ts-node prisma/volunteerSeedTest.ts
```

### Method 4: Reset database and seed (Use with caution!)

```bash
npm run seed:reset
```

**⚠️ WARNING**: This will:
- Drop the entire database
- Recreate it
- Run all migrations
- Run the seed script

**Only use this in development!**

## What the Seed File Creates

The `volunteerSeedTest.ts` file creates:

1. **Users** (2 users)
   - John Doe (john@example.com)
   - Jane Smith (jane@example.com)
   - Password hash: 'test123' (⚠️ Not properly hashed - fix this!)

2. **Volunteer Projects** (2 projects)
   - Community Outreach Program
   - Food Distribution Drive

3. **Project Positions** (3 positions)
   - Volunteer Coordinator
   - Logistics Assistant
   - Food Packing Volunteer

4. **Sessions** (3 sessions)
   - Orientation Session
   - Distribution Day
   - Food Packing Day

5. **Volunteer Applications** (2 applications)
   - User1 → Position1 (status: reviewing)
   - User2 → Position2 (status: approved)

6. **Volunteer Sessions** (2 volunteer-session links)
   - User1 → Session1
   - User2 → Session2 (approved)

## Important Notes

### ⚠️ Security Warning
The seed file currently stores plain text passwords:
```typescript
passwordHash:'test123'  // ❌ This should be hashed!
```

**Fix this by hashing passwords:**
```typescript
import { hashPassword } from '../src/utils/password';

const user1 = await prisma.user.create({
  data: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    passwordHash: await hashPassword('test123'), // ✅ Properly hashed
  },
});
```

### Database State
- **Seeding is NOT idempotent** - running it multiple times will create duplicate records
- Use `npm run seed:reset` to start fresh, or manually delete data first
- Check for existing records before creating to avoid duplicates

### Environment Variables
Make sure your `.env` file has the correct `DATABASE_URL`:
```env
DATABASE_URL="postgresql://username@localhost:5432/dbname?schema=public"
```

## Troubleshooting

### Error: "Cannot find module '../src/prisma/client'"
- Make sure you're running from the project root directory
- Verify the path in the seed file matches your project structure

### Error: "Table does not exist"
- Run migrations first: `npx prisma migrate dev`
- Make sure your database is set up correctly

### Error: "Unique constraint violation"
- The seed file tried to create duplicate records
- Use `npm run seed:reset` to start fresh, or modify the seed file to check for existing records

### Error: "PrismaClientKnownRequestError"
- Check your database connection
- Verify DATABASE_URL in .env
- Ensure the database exists and is accessible

## Best Practices

1. **Make seed idempotent** - Check if records exist before creating:
   ```typescript
   const existingUser = await prisma.user.findUnique({
     where: { email: 'john@example.com' }
   });
   
   if (!existingUser) {
     await prisma.user.create({ ... });
   }
   ```

2. **Use transactions** for related data:
   ```typescript
   await prisma.$transaction(async (tx) => {
     const user = await tx.user.create({ ... });
     await tx.partner.create({ data: { userId: user.id, ... } });
   });
   ```

3. **Hash passwords properly** - Never store plain text passwords

4. **Add error handling** - The seed file already has basic error handling, but you can enhance it

5. **Use environment-specific seeds** - Consider different seed files for dev/staging/prod

## Example: Enhanced Seed File Structure

```typescript
async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional, for development only)
  // await prisma.volunteerSession.deleteMany();
  // await prisma.volunteerProjectPosition.deleteMany();
  // await prisma.session.deleteMany();
  // await prisma.projectPosition.deleteMany();
  // await prisma.volunteerProject.deleteMany();
  // await prisma.user.deleteMany();

  // Create users with proper password hashing
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      passwordHash: await hashPassword('test123'),
    },
  });

  // ... rest of seeding
}
```

## Running Seeds in CI/CD

For automated testing, you might want to seed test data:

```yaml
# .github/workflows/ci-cd.yml
- name: Seed test database
  run: npm run seed
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

