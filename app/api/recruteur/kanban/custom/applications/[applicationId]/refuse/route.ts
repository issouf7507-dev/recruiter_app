import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// POST - Refuser une candidature
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const body = await req.json();
    const { reason } = body;
    const { applicationId } = await params;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'application existe et appartient au recruteur
    const existingApplication = await prisma.applicationCustom.findFirst({
      where: {
        id: applicationId,
        // TODO: Ajouter la vérification du recruteur via les relations
      },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: "Candidature non trouvée" },
        { status: 404 }
      );
    }

    // Marquer la candidature comme refusée
    const updatedApplication = await prisma.applicationCustom.update({
      where: { id: applicationId },
      data: {
        etat: "refused",
      },
    });

    // Optionnel: Créer une note automatique
    await prisma.applicationNoteCustom.create({
      data: {
        id: `note_refuse_${applicationId}_${Date.now()}`,
        content: `Candidature refusée. Raison: ${reason || "Non spécifiée"}`,
        authorId: authenticatedUser.userId,
        authorName: authenticatedUser.name || "Recruteur",
        authorType: "RECRUTEUR",
        applicationId: applicationId,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Candidature refusée avec succès",
        data: updatedApplication,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du refus de la candidature:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
