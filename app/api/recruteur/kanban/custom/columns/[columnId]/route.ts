import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// DELETE - Supprimer une colonne custom
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ columnId: string }> }
) {
  try {
    const { columnId } = await params;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que la colonne appartient au recruteur
    const column = await prisma.kanbanColumnCustom.findFirst({
      where: {
        id: columnId,
        recruteurId: authenticatedUser.recruteurId,
      },
    });

    if (!column) {
      return NextResponse.json(
        { error: "Colonne non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer d'abord les applications dans cette colonne
    await prisma.applicationCustom.deleteMany({
      where: {
        kanbanColumnCustomid: columnId,
      },
    });

    // Supprimer la colonne
    await prisma.kanbanColumnCustom.delete({
      where: { id: columnId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Colonne supprimée avec succès",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de la colonne:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
