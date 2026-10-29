import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import recipeRoutes from './routes/recipeRoutes.js';

// Load .env from cwd or parent directory
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use('/api', recipeRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Path '${req.originalUrl}' not found on SAMACHIFY API` });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SAMACHIFY Server Error]:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err?.message || 'Unknown error occurred',
  });
});

export default app;
