import prisma from "../lib/prisma.js";

async function seedCVTemplates() {
  console.log("🌱 Seeding CV templates...");

  const templates = [
    {
      id: "template_modern",
      name: "Moderne",
      description: "Design épuré et contemporain",
      layout: "modern",
      colors: {
        primary: "#3B82F6",
        secondary: "#64748B",
        accent: "#F1F5F9",
      },
      fonts: {
        heading: "Inter",
        body: "Inter",
      },
    },
    {
      id: "template_classic",
      name: "Classique",
      description: "Style traditionnel et professionnel",
      layout: "classic",
      colors: {
        primary: "#1F2937",
        secondary: "#6B7280",
        accent: "#F9FAFB",
      },
      fonts: {
        heading: "Times New Roman",
        body: "Times New Roman",
      },
    },
    {
      id: "template_creative",
      name: "Créatif",
      description: "Design original et coloré",
      layout: "creative",
      colors: {
        primary: "#7C3AED",
        secondary: "#A78BFA",
        accent: "#F3F4F6",
      },
      fonts: {
        heading: "Poppins",
        body: "Poppins",
      },
    },
    {
      id: "template_minimal",
      name: "Minimaliste",
      description: "Simplicité et élégance",
      layout: "minimal",
      colors: {
        primary: "#059669",
        secondary: "#10B981",
        accent: "#ECFDF5",
      },
      fonts: {
        heading: "Helvetica",
        body: "Helvetica",
      },
    },
  ];

  try {
    for (const template of templates) {
      const existing = await prisma.cVTemplate.findUnique({
        where: { id: template.id },
      });

      if (!existing) {
        await prisma.cVTemplate.create({
          data: template,
        });
        console.log(`✅ Created template: ${template.name}`);
      } else {
        console.log(`⚠️  Template already exists: ${template.name}`);
      }
    }

    console.log("🎉 CV templates seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding CV templates:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCVTemplates();
