import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { kanbanEvents } from "@/lib/socket";
// import { CACHE_KEYS, cacheUtils } from "@/lib/redis";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string; noteId: string }> }
) {
  try {
    const { applicationId, noteId } = await params;
    const body = await req.json();
    const { content } = body;

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

    if (!recruteur && !collaborateur) {
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
    if (
      application.jobOffer.recruteurId !== recruteur?.id ||
      collaborateur?.recruteur?.id
    ) {
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
    if (note.authorId !== recruteur?.id || collaborateur?.recruteur?.id) {
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

    // Invalider le cache avec l'ID du recruteur ET l'ID de l'offre pour être sûr
    // const cacheKeyRecruteur = CACHE_KEYS.KANBAN_BOARD(
    //   authenticatedUser.recruteurId
    // );
    // const cacheKeyOffre = CACHE_KEYS.KANBAN_BOARD(
    //   application.jobOffer.id.toString()
    // );

    try {
      // await cacheUtils.del(cacheKeyRecruteur);
      // await cacheUtils.del(cacheKeyOffre);
      // console.log("Cache invalidé pour recruteur:", cacheKeyRecruteur);
      // console.log("Cache invalidé pour offre:", cacheKeyOffre);
      console.log("Cache invalidé");
    } catch (cacheError) {
      console.warn(
        "Erreur lors de l'invalidation du cache (normal en local):",
        (cacheError as Error).message
      );
    }
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
