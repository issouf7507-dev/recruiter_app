import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { kanbanEvents } from "@/lib/socket";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string; noteId: string }> }
) {
  try {
    const { applicationId, noteId } = await params;
    const body = await req.json();
    const { content } = body;

    // Vérifier que le contenu n'est pas vide
    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Le contenu de la note est requis" },
        { status: 400 }
      );
    }

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'application appartient au recruteur de l'utilisateur connecté
    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        jobOffer: {
          include: {
            recruteur: true,
          },
        },
      },
    });

    // console.log("application", application);

    if (!application) {
      return NextResponse.json(
        { error: "Application non trouvée" },
        { status: 404 }
      );
    }

    // console.log("application", application);

    // Vérifier que l'utilisateur a accès à cette application
    if (application.jobOffer.recruteurId !== authenticatedUser.recruteurId) {
      return NextResponse.json(
        { error: "Accès non autorisé à cette application" },
        { status: 403 }
      );
    }

    // console.log("noteId", noteId);

    // Vérifier que la note existe et appartient à l'utilisateur connecté
    const note = await prisma.applicationNote.findUnique({
      where: {
        id: noteId,
        applicationId: applicationId,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note non trouvée" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est l'auteur de la note
    if (note.authorId !== authenticatedUser.userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez modifier que vos propres notes" },
        { status: 403 }
      );
    }

    // Modifier la note
    const updatedNote = await prisma.applicationNote.update({
      where: {
        id: noteId,
      },
      data: {
        content: content.trim(),
        updatedAt: new Date(),
      },
    });

    // Émettre un événement WebSocket pour la modification de la note
    await kanbanEvents.noteUpdated(
      applicationId,
      updatedNote,
      application.jobOffer.id.toString()
    );

    return NextResponse.json(
      {
        success: true,
        message: "Note modifiée avec succès",
        note: updatedNote,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la modification de la note:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de la note" },
      { status: 500 }
    );
  }
}
