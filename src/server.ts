import express, { Application } from 'express';
import dotenv from 'dotenv';
import { logger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';
import rootRoutes from './routes';
import { notFoundHandler } from './middlewares/notFoundHandler';
import cors from 'cors';
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
    this.app.use(
      cors({
        origin: ['http://localhost:3001'], // frontend url
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

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server running on port ${this.port}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

// Create and start server
const server = new Server();
server.start();

export default server;
