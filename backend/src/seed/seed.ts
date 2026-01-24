import { PrismaClient, BotType, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log("🌱 Running production seed...");

  // ----------------------------
  // 1. Tenant
  // ----------------------------
  let tenant = await prisma.tenant.findFirst();

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: "ContentCaster Default",
      },
    });
    console.log("✅ Tenant created:", tenant.id);
  } else {
    console.log("ℹ️ Tenant exists:", tenant.id);
  }

  // ----------------------------
  // 2. Admin User
  // ----------------------------
  const adminEmail = "admin@contentcaster.ai";

  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    const hashed = await bcrypt.hash("admin123", 10);

    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "System Admin",
        password: hashed,
        role: UserRole.ADMIN,
        tenantId: tenant.id,
      },
    });

    console.log("✅ Admin user created:", admin.email);
  } else {
    console.log("ℹ️ Admin user exists:", admin.email);
  }

  // ----------------------------
  // 3. Default Bots
  // ----------------------------
  const defaultBots: { name: string; type: BotType }[] = [
    { name: "Creator Bot", type: BotType.CREATOR },
    { name: "Engagement Bot", type: BotType.ENGAGEMENT },
    { name: "Finder Bot", type: BotType.FINDER },
    { name: "Growth Bot", type: BotType.GROWTH },
  ];

  for (const bot of defaultBots) {
    const exists = await prisma.bot.findFirst({
      where: {
        tenantId: tenant.id,
        type: bot.type,
      },
    });

    if (!exists) {
      await prisma.bot.create({
        data: {
          name: bot.name,
          type: bot.type,
          enabled: true,
          config: {},
          state: {},
          tenantId: tenant.id,
        },
      });

      console.log(`✅ Bot created: ${bot.type}`);
    } else {
      console.log(`ℹ️ Bot exists: ${bot.type}`);
    }
  }

  console.log("🌱 Seed completed.");
}

