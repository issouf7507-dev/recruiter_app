import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// PUT - Mettre à jour un élément de la checklist
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string; itemId: string }> }
) {
  try {
    const { applicationId, itemId } = await params;
    const body = await req.json();
    const { title, description, isCompleted } = body;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'élément appartient à une application du recruteur
    const checklistItem = await prisma.checklistItemCustom.findFirst({
      where: {
        id: itemId,
        applicationId,
        application: {
          // TODO: Ajouter la vérification du recruteur via les relations
        },
      },
    });

    if (!checklistItem) {
      return NextResponse.json(
        { error: "Élément de checklist non trouvé" },
        { status: 404 }
      );
    }

    const updatedData: any = {};
    if (title !== undefined) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    if (isCompleted !== undefined) updatedData.isCompleted = isCompleted;

    const updatedItem = await prisma.checklistItemCustom.update({
      where: { id: itemId },
      data: updatedData,
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'élément checklist:",
      error
    );
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un élément de la checklist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string; itemId: string }> }
) {
  try {
    const { applicationId, itemId } = await params;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'élément appartient à une application du recruteur
    const checklistItem = await prisma.checklistItemCustom.findFirst({
      where: {
        id: itemId,
        applicationId,
        application: {
          // TODO: Ajouter la vérification du recruteur via les relations
        },
      },
    });

    if (!checklistItem) {
      return NextResponse.json(
        { error: "Élément de checklist non trouvé" },
        { status: 404 }
      );
    }

    await prisma.checklistItemCustom.delete({
      where: { id: itemId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Élément supprimé avec succès",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'élément checklist:",
      error
    );
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
