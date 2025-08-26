import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// PUT - Modifier une note
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string; noteId: string }> }
) {
  try {
    const body = await req.json();
    const { content } = body;
    const { applicationId, noteId } = await params;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Le contenu de la note est requis" },
        { status: 400 }
      );
    }

    // Vérifier que la note existe et appartient au recruteur
    const existingNote = await prisma.applicationNoteCustom.findFirst({
      where: {
        id: noteId,
        applicationId: applicationId,
        authorId: authenticatedUser.userId,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Note non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    // Mettre à jour la note
    const updatedNote = await prisma.applicationNoteCustom.update({
      where: { id: noteId },
      data: {
        content: content.trim(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedNote,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la modification de la note:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une note
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string; noteId: string }> }
) {
  try {
    const { applicationId, noteId } = await params;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que la note existe et appartient au recruteur
    const existingNote = await prisma.applicationNoteCustom.findFirst({
      where: {
        id: noteId,
        applicationId: applicationId,
        authorId: authenticatedUser.userId,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Note non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    // Supprimer la note
    await prisma.applicationNoteCustom.delete({
      where: { id: noteId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Note supprimée avec succès",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de la note:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
