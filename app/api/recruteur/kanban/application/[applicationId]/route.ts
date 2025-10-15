import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

import { kanbanEvents } from "@/lib/socket";
// import { CACHE_KEYS, cacheUtils } from "@/lib/redis";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const body = await req.json();
    const { notes, duedate } = body;
    const idapp = (await params).applicationId;

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

    // Vérifier que l'application appartient au recruteur de l'utilisateur connecté
    const application = await prisma.application.findUnique({
      where: { id: idapp },
      include: {
        jobOffer: {
          include: { recruteur: true },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application non trouvée" },
        { status: 404 }
      );
    }

    if (
      application.jobOffer.recruteurId !== recruteur?.id ||
      collaborateur?.recruteur?.id
    ) {
      return NextResponse.json(
        { error: "Accès non autorisé à cette application" },
        { status: 403 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (notes !== undefined) {
      updateData.notes = {
        create: {
          content: notes,
          authorId: recruteur?.id || collaborateur?.recruteur?.id || "",
          authorType: "RECRUTEUR",
          authorName:
            recruteur?.name || collaborateur?.recruteur?.name || "Utilisateur",
        },
      };
    }

    if (duedate !== undefined) {
      updateData.duedate = duedate ? new Date(duedate) : null;
    }

    // Mettre à jour l'application
    const updatedApplication = await prisma.application.update({
      where: { id: idapp },
      data: updateData,
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Émettre un événement WebSocket si une note a été ajoutée
    if (notes !== undefined) {
      const latestNote = updatedApplication.notes[0]; // La note la plus récente
      if (latestNote) {
        await kanbanEvents.noteAdded(
          idapp,
          latestNote,
          application.jobOffer.id.toString()
        );
      }
    }

    // Émettre un événement WebSocket si une date d'échéance a été mise à jour
    if (duedate !== undefined) {
      await kanbanEvents.duedateUpdated(
        idapp,
        duedate,
        application.jobOffer.id.toString()
      );
    }

    // Invalider le cache Redis pour forcer le rechargement des données
    // Invalider avec l'ID du recruteur ET l'ID de l'offre pour être sûr
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
        message: notes
          ? "Note ajoutée avec succès"
          : duedate
            ? "Date d'échéance mise à jour avec succès"
            : "Application mise à jour avec succès",
        application: updatedApplication,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  // Rediriger vers PUT pour éviter la duplication
  return PUT(req, { params });
}
