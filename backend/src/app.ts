
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { getMedia, uploadMedia } from './controllers/media.controller';
import { getBots, updateBot, toggleBot, runSimulation } from './controllers/bots.controller';
import { getPosts, createPost } from './controllers/posts.controller';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Media Routes
app.get('/api/media', getMedia);
app.post('/api/media/upload', upload.single('file'), uploadMedia);

// Bot Routes
app.get('/api/bots', getBots);
app.patch('/api/bots/:id/config', updateBot);
app.patch('/api/bots/:id/toggle', toggleBot);
app.post('/api/simulation/run', runSimulation);

// Post Routes
app.get('/api/posts', getPosts);
app.post('/api/posts', createPost);

export default app;
