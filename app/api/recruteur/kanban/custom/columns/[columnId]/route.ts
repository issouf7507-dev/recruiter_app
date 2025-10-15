import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// DELETE - Supprimer une colonne custom
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ columnId: string }> }
) {
  try {
    const { columnId } = await params;

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

    // Vérifier que la colonne appartient au recruteur
    const column = await prisma.kanbanColumnCustom.findFirst({
      where: {
        id: columnId,
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
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
