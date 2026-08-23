# SiloamXperience Partner Management System — Backend

Express 5 and TypeScript API for the SiloamXperience partner, volunteer, and donation management system. PostgreSQL is accessed through Prisma.

The matching web application is in the [frontend repository](https://github.com/SiloamXperience-DG-AY2526/frontend). For the implementation and handover tracker, see [February 2026 feature status](docs/FEB_2026_FEATURE_STATUS.md).

## What this service provides

- Partner sign-up, onboarding, login, profile, and password recovery
- Staff roles and permissions: super admin, sub-admin, general manager, and finance manager
- Staff account creation, activation, and deactivation
- Volunteer projects, proposals, applications, approval states, duplication, and feedback
- Donation projects, donation intentions, donor views, project duplication, and receipt status
- General-manager email campaigns
- Finance-manager thank-you, follow-up, and receipt email templates

The API is served under `/api/v1`. Except for the health, authentication, and root endpoints, requests require an `Authorization: Bearer <token>` header.

## Prerequisites

- Node.js 20
- npm
- PostgreSQL
- SMTP credentials if password-reset or finance email flows will be tested

## Local setup

1. Clone and enter the repository.

   ```bash
   git clone https://github.com/SiloamXperience-DG-AY2526/backend.git
   cd backend
   ```

2. Install the exact dependencies from `package-lock.json`.

   ```bash
   npm ci
   ```

3. Create the local environment file.

   ```bash
   cp .env.example .env
   ```

4. Create a PostgreSQL database and update `DATABASE_URL` and `DIRECT_URL` in `.env`.

   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/siloamxperience?schema=public
   DIRECT_URL=postgresql://USER:PASSWORD@localhost:5432/siloamxperience?schema=public
   ```

5. Apply migrations, generate the Prisma client, and optionally load demo data.

   ```bash
   npx prisma migrate dev
   npx prisma generate
   npm run seed
   ```

6. Start the API.

   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000/api/v1`. Check it with:

```bash
curl http://localhost:3000/api/v1/health
```

Run the frontend on port `3001` so it does not conflict with this service.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `3000` |
| `NODE_ENV` | No | `development`, `test`, or `production` |
| `DATABASE_URL` | Yes | Prisma PostgreSQL connection URL |
| `DIRECT_URL` | Yes | Direct PostgreSQL URL used by Prisma migrations |
| `FRONTEND_URL` | Yes for email links | Frontend origin; local default is `http://localhost:3001` |
| `JWT_SECRET` | Yes | Secret used to sign access and password-reset tokens |
| `SMTP_HOST` | Yes for email | SMTP server hostname |
| `SMTP_PORT` | Yes for email | SMTP server port, normally `587` |
| `SMTP_USER` | Yes for email | SMTP username |
| `SMTP_PASS` | Yes for email | SMTP password or app password |
| `SMTP_FROM` | Yes for email | Sender address |

Do not commit `.env` or real credentials.

## Common commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with reload on file changes |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Run the compiled server |
| `npm test` | Run the Jest test suite |
| `npm run test:coverage` | Run tests and create a coverage report |
| `npm run lint` | Check TypeScript with ESLint |
| `npm run lint:fix` | Apply safe ESLint fixes |
| `npm run seed` | Load the main demo dataset |
| `npm run seed:users` | Load the user-focused seed dataset |
| `npm run seed:volunteers` | Load volunteer test data |
| `npm run seed:donor` | Load donor test data |
| `npm run seed:reset` | **Delete local database data**, reapply migrations, and reseed |

## Database workflow

Prisma reads the split schema files from `prisma/models/` through `prisma.config.ts`.

When changing the database:

```bash
# 1. Edit the relevant file in prisma/models/
# 2. Create and apply a migration locally
npx prisma migrate dev --name describe_the_change

# 3. Regenerate the client and run checks
npx prisma generate
npm run lint
npm test
npm run build
```

Commit both the model change and the new directory under `prisma/migrations/`. Do not use `prisma db push` for shared or production databases. In production, apply committed migrations with `npx prisma migrate deploy`.

## API areas

| Prefix | Main responsibility |
| --- | --- |
| `/api/v1/auth` | Sign-up, onboarding, login, forgot/reset password |
| `/api/v1/profile` | Current user and partner profiles |
| `/api/v1/staff` | Staff list, creation, activation, deactivation |
| `/api/v1/partners` | Partner list and deactivation |
| `/api/v1/volunteer-projects` | Volunteer projects, proposals, duplication, feedback |
| `/api/v1/volunteer-applications` | Volunteer applications and approval status |
| `/api/v1/donation-projects` | Donation project management and duplication |
| `/api/v1/donations` | Donation intentions, history, homepage data, receipt status |
| `/api/v1/donors` | Donor list, details, and updates |
| `/api/v1/email-campaigns` | Campaigns and finance email templates/actions |

`api/openapi.yaml` is useful as a reference, but routes and schemas in `src/` remain the source of truth when they differ.

## Project structure

```text
src/
  authorisation/   role and permission configuration
  controllers/     HTTP request and response handling
  middlewares/     authentication, validation, logging, errors
  models/          Prisma queries and projections
  routes/          Express route definitions
  schemas/         Zod request schemas
  services/        business logic
  utils/           JWT, password, email, and shared helpers
prisma/
  models/          split Prisma schema
  migrations/      versioned database migrations
  demoSeed.ts      main demo seed
api/openapi.yaml   API reference
docs/              schema and handover documentation
```

## Before opening a pull request

```bash
npx prisma generate
npm run lint
npm test
npm run build
```

Create or reference a GitHub issue in the PR description using `Fixes #<issue-number>` when merging should close the issue.

## Current handover note

Partner data import is not on `main`. It is being developed in [backend PR #145](https://github.com/SiloamXperience-DG-AY2526/backend/pull/145) and is linked from [backend issue #88](https://github.com/SiloamXperience-DG-AY2526/backend/issues/88). Review the unresolved password-import decision before merging it.
