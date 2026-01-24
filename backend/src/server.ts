import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import { seedDatabase } from "./seed/seed";

<<<<<<< HEAD
import express from 'express';
import cors from 'cors';
import * as Prisma from '@prisma/client';
import { seedDefaultBots } from './seed/initBots';

// Import Infrastructure
import { botWorker } from './workers/bot.worker'; // Importing starts the worker listener
import { botScheduler } from './scheduler/bot.scheduler';

const { PrismaClient } = Prisma as any;
const prisma = new PrismaClient();
=======
dotenv.config();

>>>>>>> a61ade6 (Phase P2 complete: DB, seed, bots, stable API)
const app = express();
app.use(cors());
app.use(express.json());

/* ---------------- HEALTH ---------------- */

app.get("/health", async (_req, res) => {
  const tenants = await prisma.tenant.count();
  const bots = await prisma.bot.count();
  res.json({ status: "ok", tenants, bots });
});

/* ---------------- BOTS ---------------- */

app.get("/bots", async (_req, res) => {
  const bots = await prisma.bot.findMany();
  res.json(bots);
});

app.post("/bots/:id/run", async (req, res) => {
  const { id } = req.params;

  const bot = await prisma.bot.findUnique({ where: { id } });
  if (!bot) return res.status(404).json({ error: "Bot not found" });

  // Governance audit
  await prisma.decisionAudit.create({
    data: {
      source: "RULE_ENGINE",
      reasoning: "Manual bot run requested via API",
      snapshot: { botId: id },
      tenantId: bot.tenantId,
    },
  });

  // Bot log
  await prisma.botLog.create({
    data: {
      botId: id,
      level: "INFO",
      message: "Bot execution manually triggered",
    },
  });

  res.json({ status: "queued", botId: id });
});

/* ---------------- CAMPAIGNS ---------------- */

app.get("/campaigns", async (_req, res) => {
  const campaigns = await prisma.campaign.findMany();
  res.json(campaigns);
});

/* ---------------- START ---------------- */

const PORT = process.env.PORT || 8000;

<<<<<<< HEAD
app.use(cors());
app.use(express.json() as any);

// --- Routes ---

// 1. Posts
app.get('/api/posts', async (req, res) => {
  const posts = await prisma.post.findMany({ orderBy: { scheduledFor: 'desc' } });
  res.json(posts);
});

app.post('/api/posts', async (req, res) => {
  const post = await prisma.post.create({
    data: {
      ...req.body,
      status: req.body.status || 'Draft',
    }
  });
  // Note: Post scheduling queue logic would go here in P4
  res.json(post);
});

// 2. Bots Config
import { getBots, updateBot, toggleBot, runSimulation } from './controllers/bots.controller';

const mockAuth = (req: any, res: any, next: any) => {
  req.organizationId = 'system-tenant';
  next();
};

app.get('/api/bots', mockAuth, getBots);
app.get('/api/bots/:type/activity', async (req, res) => {
  const { type } = req.params;
  const { limit = 100 } = req.query;
  const activities = await prisma.botActivity.findMany({
    where: { botType: type },
    orderBy: { createdAt: 'desc' },
    take: Number(limit)
  });
  res.json(activities);
});
app.post('/api/bots/:type/simulate', mockAuth, runSimulation);
app.post('/api/bots/:type/toggle', mockAuth, toggleBot);
app.put('/api/bots/:id', mockAuth, updateBot);

// 5. Global Activity
app.get('/api/activity/recent', async (req, res) => {
  const activities = await prisma.botActivity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json(activities);
});

// Initialize and Start
async function startServer() {
  try {
    await seedDefaultBots(prisma);
  } catch (e) {
    console.error("Startup seed failed, continuing...", e);
  }

  // START BACKGROUND SERVICES
  console.log('🚀 Starting Background Services...');
  
  if (botWorker) {
    console.log('✅ Bot Worker: Listening for jobs');
  }
  
  if (botScheduler) {
    botScheduler.start();
    console.log('✅ Scheduler: Active');
  }
=======
async function start() {
  await seedDatabase();
>>>>>>> a61ade6 (Phase P2 complete: DB, seed, bots, stable API)

  app.listen(PORT, () => {
    console.log(`✅ API Server running on port ${PORT}`);
  });
}

start();

