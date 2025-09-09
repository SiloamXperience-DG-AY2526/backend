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

## 📁 Project Structure

```
├── src/
│   ├── controllers/         # Route handlers
│   ├── middlewares/         # Custom middleware
│   ├── routes/             # Route definitions
│   ├── __tests__/          # Test files
│   └── server.ts           # Application entry point
├── .github/
│   └── workflows/          # GitHub Actions workflows
├── dist/                   # Compiled JavaScript (generated)
├── coverage/              # Test coverage reports (generated)
├── .env.example           # Environment variables template
├── .eslintrc.json         # ESLint configuration
├── .gitignore            # Git ignore rules
├── jest.config.js        # Jest configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

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
   # Edit .env with your configuration
   ```

## 🏃‍♂️ Development

### Start development server
```bash
npm run dev
```
The server will start on `http://localhost:3000` with hot reloading enabled.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Start production server |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run clean` | Remove build and coverage directories |

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message with API info |
| GET | `/health` | Health check endpoint |

### Example Responses

**GET /**
```json
{
  "message": "Welcome to the Express TypeScript Backend API",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "success",
  "version": "1.0.0"
}
```

**GET /health**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

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

3. **Deploy Job:** *(main branch only)*
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

- **TypeScript**: Strict typing for better code quality
- **ESLint**: Consistent code style and error detection
- **Jest**: Comprehensive testing with coverage reporting
- **Prettier**: Code formatting (can be added if needed)

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Run linting and fix any issues
7. Submit a pull request

## 📄 License

This project is licensed under the ISC License.