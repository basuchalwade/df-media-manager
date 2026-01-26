import express from 'express';
import cors from 'cors';
import routes from './routes';
import { authMiddleware } from './middleware/auth.middleware';

const app = express();

// Middleware
app.use(cors() as any);
app.use(express.json() as any);

// Latency Simulation
app.use((req, res, next) => {
  const latency = Math.floor(Math.random() * 300) + 300; // 300-600ms
  setTimeout(() => next(), latency);
});

// Request Logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', authMiddleware, routes);

export default app;