# How to Get User UUIDs

After seeding your database, you'll need user UUIDs to test API endpoints. Here are several methods:

## Method 1: Using Prisma Studio (Easiest - Visual)

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can:
1. Navigate to the `users` table
2. View all users with their UUIDs
3. Copy the UUIDs directly

## Method 2: Using psql (PostgreSQL CLI)

```bash
# Connect to your database
psql $DATABASE_URL

# Or if DATABASE_URL is not set:
psql "postgresql://username@localhost:5432/dbname?schema=public"

# Query users table
SELECT id, email, "firstName", "lastName" FROM users;

# Or just get IDs
SELECT id FROM users;

# Exit psql
\q
```

## Method 3: Using Node.js Script

Create a simple script to print user UUIDs:

```typescript
// get-user-ids.ts
import { prisma } from './src/prisma/client';

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });

  console.log('\n📋 User UUIDs:');
  console.log('='.repeat(60));
  users.forEach((user) => {
    console.log(`${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`  UUID: ${user.id}`);
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
npx ts-node get-user-ids.ts
```

## Method 4: Using curl with your API (if you have a users endpoint)

If you have an endpoint to list users:
```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Method 5: Modify Seed File to Print UUIDs

Add this to the end of your `volunteerSeedTest.ts`:

```typescript
// At the end of main() function, before closing
console.log('\n📋 Created User UUIDs:');
console.log('='.repeat(60));
console.log(`User 1 (John Doe): ${user1.id}`);
console.log(`User 2 (Jane Smith): ${user2.id}`);
console.log('='.repeat(60));
```

## Method 6: Quick One-Liner with psql

```bash
psql $DATABASE_URL -c "SELECT id, email, \"firstName\", \"lastName\" FROM users;"
```

## Method 7: Using Prisma Client in Node REPL

```bash
node
```

Then in the Node REPL:
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.user.findMany({
  select: { id: true, email: true, firstName: true, lastName: true }
}).then(users => {
  console.log(users);
  prisma.$disconnect();
});
```

## Example Output

After running any method, you should see something like:

```
📋 User UUIDs:
============================================================
John Doe (john@example.com)
  UUID: 123e4567-e89b-12d3-a456-426614174000

Jane Smith (jane@example.com)
  UUID: 987fcdeb-51a2-43d7-b890-123456789abc
============================================================
```

## Quick Reference for Testing

Once you have the UUIDs, you can use them to test your API:

```bash
# Test partner info route
curl -X GET http://localhost:3000/api/v1/profile/USER_UUID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test matching volunteer to project
curl -X POST http://localhost:3000/api/v1/volunteer-applications/match \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "volunteerId": "USER_UUID_HERE",
    "projectId": "PROJECT_UUID_HERE"
  }'
```

