import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { logger } from './middlewares/logger';
import rootRoutes from './routes';

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
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Custom logger middleware
    this.app.use(logger);
  }

  private initializeRoutes(): void {
    this.app.use('/', rootRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        status: 'error',
        message: 'Route not found',
        path: req.originalUrl
      });
    });

    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    });
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