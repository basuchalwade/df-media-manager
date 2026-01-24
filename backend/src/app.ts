
import express from 'express';
import cors from 'cors';
import v1Routes from './routes/v1';

const app = express();

app.use(cors());
app.use(express.json() as any);

// Mount Version 1 API
app.use('/api/v1', v1Routes);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

export default app;
