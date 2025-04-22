import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { columns } = await req.json();

    // Vérifier que nous avons des colonnes à mettre à jour
    if (!columns || !Array.isArray(columns)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    // Mettre à jour l'ordre de chaque colonne
    const updatePromises = columns.map((column) =>
      prisma.kanbanColumn.update({
        where: { id: column.id },
        data: { order: column.order },
      })
    );

    // Exécuter toutes les mises à jour en parallèle
    await Promise.all(updatePromises);

    return NextResponse.json(
      { success: true, message: "Ordre mis à jour avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'ordre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'ordre" },
      { status: 500 }
    );
  }
}
