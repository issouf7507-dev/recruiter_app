import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Récupérer toutes les colonnes et applications custom pour un recruteur
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session?.user.id },
    });
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session?.user.id },
      include: {
        recruteur: true,
      },
    });
    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const columns = await prisma.kanbanColumnCustom.findMany({
      where: {
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      },
      include: {
        applicationsCustom: {
          include: {
            candidatCustom: true,
            notes: {
              orderBy: { createdAt: "desc" },
            },
            checklist: {
              orderBy: { createdAt: "desc" },
            },
            files: {
              orderBy: { createdAt: "desc" },
            },
            collaborateurs: {
              include: {
                collaborateur: true,
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(
      {
        success: true,
        data: columns,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des données kanban:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle colonne custom
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, color, order } = body;

    const session = await auth.api.getSession({ headers: req.headers });
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session?.user.id },
    });
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session?.user.id },
      include: {
        recruteur: true,
      },
    });
    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const newColumn = await prisma.kanbanColumnCustom.create({
      data: {
        name,
        color,
        order: order || 1,
        jobOfferId: 1, // Valeur par défaut, peut être ajustée selon vos besoins
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
        applicationsCustomid: `custom_${Date.now()}`, // ID unique temporaire
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newColumn,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la colonne:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour l'ordre des colonnes
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { columns } = body;

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Mettre à jour l'ordre de chaque colonne
    const updatePromises = columns.map((column: any, index: number) =>
      prisma.kanbanColumnCustom.update({
        where: { id: column.id },
        data: { order: index + 1 },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json(
      {
        success: true,
        message: "Ordre des colonnes mis à jour",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'ordre:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
