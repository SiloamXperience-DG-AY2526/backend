# Express TypeScript Backend

A comprehensive Express.js backend built with TypeScript, featuring modern tooling, testing, and CI/CD pipeline.

## 🚀 Features

- **Express.js** with TypeScript
- **Environment Configuration** with dotenv
- **Request Logging** middleware
- **ESLint** for code linting
- **Jest** for testing with coverage
- **GitHub Actions** CI/CD pipeline
- **Structured Architecture** with routes, controllers, and middlewares

## 🛠️ Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration, including DATABASE_URL for PostgreSQL
   ```

4. **Set up the database:**

   ````bash
   # Install PostgreSQL (if not installed)
   brew install postgresql
   brew services start postgresql

   # Verify installation
   psql --version

   # Create database
   psql postgres -c "CREATE DATABASE <db_name>;"

   # Construct DATABASE_URL and add to .env
   # Format: postgresql://<username>@localhost:5432/<db_name>?schema=public
   # <username>: Run 'whoami' in terminal
   # <db_name>: Your database name (e.g., siloamxperience)
   # Example: DATABASE_URL="postgresql://johndoe@localhost:5432/siloamxperience?schema=public"

   # Test connection
   psql "postgresql://<username>@localhost:5432/<db_name>"

   # Run Prisma migrations
   npx prisma migrate dev --name init
   # Populate demo seed data (re-running may insert additional records for some entities)
   npm run seed
   # Reset DB and re-seed demo data (destructive)
   npm run seed:reset
   npx prisma generate
   
   ```

## 🏃‍♂️ Development

### Start development server

```bash
npm run dev
```

The server will start on `http://localhost:3000` with hot reloading enabled.

### Available Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start development server with hot reload |
| `npm run build`         | Compile TypeScript to JavaScript         |
| `npm run start`         | Start production server                  |
| `npm run test`          | Run tests                                |
| `npm run test:watch`    | Run tests in watch mode                  |
| `npm run test:coverage` | Run tests with coverage report           |
| `npm run lint`          | Run ESLint                               |
| `npm run lint:fix`      | Run ESLint with auto-fix                 |
| `npm run clean`         | Remove build and coverage directories    |
| `npm run seed`          | Seed demo data                           |
| `npm run seed:reset`    | Reset DB and re-seed demo data           |

## 🧪 Testing

### Run all tests

```bash
npm test
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Run tests in watch mode (for development)

```bash
npm run test:watch
```

## 🏗️ Building

### Build for production

```bash
npm run build
```

This will compile TypeScript files to JavaScript in the `dist/` directory.

### Start production server

```bash
npm start
```

## 📋 API Endpoints

| Method | Endpoint  | Description                   |
| ------ | --------- | ----------------------------- |
| GET    | `/`       | Welcome message with API info |
| GET    | `/health` | Health check endpoint         |

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
NODE_ENV=development
```

### TypeScript Configuration

The project uses `tsconfig.json` with strict mode enabled and the following key settings:

- Target: ES2020
- Module: CommonJS
- Strict type checking
- Source maps enabled
- Declaration files generated

### ESLint Configuration

ESLint is configured with:

- TypeScript support
- Recommended rules
- Custom formatting rules (2-space indentation, single quotes, semicolons)

## 🚀 CI/CD Pipeline

The GitHub Actions workflow includes:

### On Push/PR to main/develop:

1. **Test Job:**

   - Tests on Node.js 18.x and 20.x
   - Install dependencies
   - Run linting
   - Run tests with coverage
   - Upload coverage to Codecov

2. **Build Job:**

   - Compile TypeScript
   - Upload build artifacts

3. **Deploy Job:** _(main branch only)_
   - Download build artifacts
   - Deploy to production (placeholder)

### Workflow file: `.github/workflows/ci-cd.yml`

## 📦 Dependencies

### Production Dependencies

- **express**: Web framework
- **dotenv**: Environment variable management

### Development Dependencies

- **typescript**: TypeScript compiler
- **@types/node**: Node.js type definitions
- **@types/express**: Express.js type definitions
- **ts-node**: TypeScript execution for development
- **nodemon**: Development server with hot reload
- **eslint**: Code linting
- **jest**: Testing framework
- **supertest**: HTTP testing

## 🔍 Code Quality

We prioritize clean, maintainable code through automated tools and best practices:

- **TypeScript**: Provides strict typing to catch errors early and improve code reliability.
- **ESLint**: Enforces consistent code style and detects potential issues (configured for 2-space indentation and single quotes).
- **Jest**: Runs unit tests with coverage reporting to ensure functionality and prevent regressions.
- **Prettier**: (Optional) Can be added for automatic code formatting to maintain consistency across the team.

## 🔍 Database Workflow (Prisma)

This guide ensures safe, version-controlled database changes using Prisma. Follow these steps to keep the team in sync.

#### Best Practices

- ⚙️ **Use migrations only** — Never change the database manually.
- 💾 **Commit migrations** — Always commit migration files to Git.
- 🧪 **Test locally first** — Verify changes on your local DB before sharing.
- 🚫 **Avoid `db push`** — Use migrations for shared/production environments.
- 🔄 **Generate client after changes** — Run `npx prisma generate` to update the Prisma Client.

### For Developers Making Changes

```bash
# 1. Update content in prisma/schema.prisma
# 2. Create Migration
npx prisma migrate dev --name <change_name>  # e.g., add_user_role

# 3. Test Changes: Use Prisma Studio to inspect the DB
npx prisma studio

# 4. Commit & Push: Commit schema.prisma and new prisma/migrations/ files to Git
```

### For Teammates Applying Changes

```bash
# 1. Pull Updates: Get the latest code from Git
# 2. Apply all Migrations
npx prisma migrate dev

# 3. Generate Client
npx prisma generate
```

### Quick Commands

```bash
# New Migration
npx prisma migrate dev --name <name>

# Apply Migrations
npx prisma migrate dev

# Generate Client
npx prisma generate

# View DB
npx prisma studio
```

### Troubleshooting

```bash
# Conflicts: Pull latest, resolve schema issues, then run
npx prisma migrate dev

# Reset DB (use cautiously)
npx prisma migrate reset

# Env Issues: Check DATABASE_URL in .env
```
