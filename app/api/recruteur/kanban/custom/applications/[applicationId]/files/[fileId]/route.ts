import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// DELETE - Supprimer un fichier
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string; fileId: string }> }
) {
  try {
    const { applicationId, fileId } = await params;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que le fichier appartient à une application du recruteur
    const file = await prisma.applicationFileCustom.findFirst({
      where: {
        id: fileId,
        applicationId,
        application: {
          // TODO: Ajouter la vérification du recruteur via les relations
        },
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    await prisma.applicationFileCustom.delete({
      where: { id: fileId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Fichier supprimé avec succès",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du fichier:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
