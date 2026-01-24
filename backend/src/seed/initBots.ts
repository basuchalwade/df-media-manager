import { prisma } from "../lib/prisma";

export async function seedDefaultBots() {
  const count = await prisma.bot.count();

  if (count > 0) {
    console.log("✅ Bots already seeded");
    return;
  }

  const bots = ["Creator", "Engagement", "Finder", "Growth"];

  for (const type of bots) {
    await prisma.bot.create({
      data: {
        type: type as any,
        enabled: false,
        configJson: {},
      },
    });
  }

  console.log("✅ Default bots seeded");
}

