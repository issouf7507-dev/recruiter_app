import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { auth } from "@/lib/auth";

// PUT - Réorganiser l'ordre des colonnes
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { columns } = body;

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
    if (!Array.isArray(columns)) {
      return NextResponse.json(
        { error: "Format de données invalide" },
        { status: 400 }
      );
    }

    // Vérifier que toutes les colonnes appartiennent au recruteur
    const columnIds = columns.map((col: any) => col.id);
    const existingColumns = await prisma.kanbanColumnCustom.findMany({
      where: {
        id: { in: columnIds },
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      },
    });

    if (existingColumns.length !== columnIds.length) {
      return NextResponse.json(
        {
          error: "Une ou plusieurs colonnes n'appartiennent pas à ce recruteur",
        },
        { status: 403 }
      );
    }

    // Mettre à jour l'ordre de chaque colonne
    const updatePromises = columns.map((column: any, index: number) =>
      prisma.kanbanColumnCustom.update({
        where: { id: column.id },
        data: { order: index + 1 },
      })
    );

    const updatedColumns = await Promise.all(updatePromises);

    return NextResponse.json(
      {
        success: true,
        message: "Ordre des colonnes mis à jour",
        data: updatedColumns,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'ordre des colonnes:",
      error
    );
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
