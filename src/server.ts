import express, { Application } from 'express';
import dotenv from 'dotenv';
import { logger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import rootRoutes from './routes';
import cors from 'cors';
import { validateSmtpConfig } from './utils/email';
// Load environment variables
dotenv.config();

class Server {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Body parser middleware
    const allowedOrigins = process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3001']; // fallback for development
    
    this.app.use(
      cors({
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true, 
      })
    );


    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Custom logger middleware
    this.app.use(logger);
  }

  private initializeRoutes(): void {
    // Root routes
    this.app.use('/api/v1', rootRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Validate SMTP configuration before starting server
      await validateSmtpConfig();
      
      this.app.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

// Create and start server
const server = new Server();
server.start();

export default server;
