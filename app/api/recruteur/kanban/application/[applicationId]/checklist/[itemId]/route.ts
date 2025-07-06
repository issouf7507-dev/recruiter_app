import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string; itemId: string }> }
) {
  try {
    const body = await req.json();
    const { isCompleted, title, description } = body;
    const { applicationId, itemId } = await params;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'application appartient au recruteur
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          recruteurId: authenticatedUser.recruteurId,
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application non trouvée" },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const checklistItem = await prisma.checklistItem.update({
      where: {
        id: itemId,
        applicationId: applicationId,
      },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: checklistItem });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'élément de la checklist:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour de l'élément" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ applicationId: string; itemId: string }> }
) {
  try {
    const { applicationId, itemId } = await params;

    // Vérifier l'authentification
    const authenticatedUser = await getAuthenticatedUser(
      request as NextRequest
    );
    if (!authenticatedUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'application appartient au recruteur
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          recruteurId: authenticatedUser.recruteurId,
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application non trouvée" },
        { status: 404 }
      );
    }

    await prisma.checklistItem.delete({
      where: {
        id: itemId,
        applicationId: applicationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'élément de la checklist:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression de l'élément" },
      { status: 500 }
    );
  }
}
