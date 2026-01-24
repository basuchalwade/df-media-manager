import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import { seedDatabase } from "./seed/seed";

dotenv.config();

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

const PORT = Number(process.env.PORT) || 8000;

async function start() {
  try {
    console.log("🌱 Running production seed...");
    await seedDatabase();
    console.log("🌱 Seed completed.");

    app.listen(PORT, () => {
      console.log(`✅ API Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();

