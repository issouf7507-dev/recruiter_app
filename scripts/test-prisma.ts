import prisma from "../lib/prisma.js";

async function testPrisma() {
  try {
    console.log("🔍 Testing Prisma connection...");

    // Test de connexion
    await prisma.$connect();
    console.log("✅ Prisma connected successfully");

    // Test de récupération des templates
    const templates = await prisma.cVTemplate.findMany();
    console.log(
      `✅ Found ${templates.length} CV templates:`,
      templates.map((t) => t.name)
    );

    // Test de récupération des candidats
    const candidats = await prisma.candidat.findMany({
      take: 1,
    });
    console.log(`✅ Found ${candidats.length} candidats`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
    console.log("👋 Disconnected from Prisma");
  }
}

testPrisma();
