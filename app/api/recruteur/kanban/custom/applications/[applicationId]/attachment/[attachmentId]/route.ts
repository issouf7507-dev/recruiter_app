import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// DELETE - Supprimer un attachment spécifique
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ applicationId: string; attachmentId: string }> }
) {
  try {
    const { applicationId, attachmentId } = await params;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'attachment existe et appartient à l'application
    const existingAttachment = await prisma.applicationFileCustom.findFirst({
      where: {
        id: attachmentId,
        applicationId: applicationId,
      },
      include: {
        application: true,
      },
    });

    if (!existingAttachment) {
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    // TODO: Ajouter la vérification que l'application appartient au recruteur

    // Supprimer l'attachment
    await prisma.applicationFileCustom.delete({
      where: {
        id: attachmentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Fichier supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'attachment:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// GET - Récupérer un attachment spécifique
export async function GET(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ applicationId: string; attachmentId: string }> }
) {
  try {
    const { applicationId, attachmentId } = await params;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'attachment
    const attachment = await prisma.applicationFileCustom.findFirst({
      where: {
        id: attachmentId,
        applicationId: applicationId,
      },
      include: {
        application: true,
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    // TODO: Ajouter la vérification que l'application appartient au recruteur

    return NextResponse.json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'attachment:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
