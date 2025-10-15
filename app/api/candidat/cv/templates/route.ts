import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Récupérer tous les templates de CV disponibles
export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les templates actifs
    const templates = await prisma.cVTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    // Si aucun template n'existe, créer les templates par défaut
    if (templates.length === 0) {
      const defaultTemplates = [
        {
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

      // Créer les templates par défaut
      const createdTemplates = await Promise.all(
        defaultTemplates.map((template) =>
          prisma.cVTemplate.create({
            data: template,
          })
        )
      );

      return NextResponse.json(createdTemplates);
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Erreur lors de la récupération des templates:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau template (pour les admins)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, layout, colors, fonts } = body;

    if (!name || !layout) {
      return NextResponse.json(
        { error: "Le nom et le layout sont requis" },
        { status: 400 }
      );
    }

    const template = await prisma.cVTemplate.create({
      data: {
        name,
        description,
        layout,
        colors: colors || null,
        fonts: fonts || null,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du template:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
