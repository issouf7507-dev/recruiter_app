import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { kanbanEvents } from "@/lib/socket";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const body = await req.json();
    const { notes, duedate } = body;
    const idapp = (await params).applicationId;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser) {
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

    if (application.jobOffer.recruteurId !== authenticatedUser.recruteurId) {
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
          authorId: authenticatedUser.userId,
          authorType: authenticatedUser.type,
          authorName: authenticatedUser.name,
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
