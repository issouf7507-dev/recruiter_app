import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Initialiser les colonnes par défaut pour un recruteur
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

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

    // Vérifier si des colonnes existent déjà
    const existingColumns = await prisma.kanbanColumnCustom.findMany({
      where: {
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      },
    });

    if (existingColumns.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Colonnes déjà initialisées",
          data: existingColumns,
        },
        { status: 200 }
      );
    }

    // Créer les colonnes par défaut
    const defaultColumns = [
      {
        name: "Nouveau",
        color: "bg-blue-300/30",
        order: 1,
      },
      {
        name: "En cours",
        color: "bg-yellow-300/30",
        order: 2,
      },
      {
        name: "Finalisé",
        color: "bg-green-300/30",
        order: 3,
      },
    ];

    const createdColumns = [];
    for (const columnData of defaultColumns) {
      const column = await prisma.kanbanColumnCustom.create({
        data: {
          name: columnData.name,
          color: columnData.color,
          order: columnData.order,
          jobOfferId: 1, // Valeur par défaut
          recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
          applicationsCustomid: `default_${Date.now()}_${columnData.order}`,
        },
      });
      createdColumns.push(column);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Colonnes par défaut créées",
        data: createdColumns,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
