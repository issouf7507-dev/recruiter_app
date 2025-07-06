import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { cacheUtils, CACHE_KEYS } from "@/lib/redis";
import { kanbanEvents } from "@/lib/socket";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, newColumnId, sourceColumnId } = body;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (
      !authenticatedUser ||
      (authenticatedUser.type !== "RECRUTEUR" &&
        authenticatedUser.type !== "COLLABORATEUR")
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier si l'application existe et appartient au recruteur
    const existingApplication = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          recruteurId: authenticatedUser.recruteurId,
        },
      },
      include: {
        jobOffer: {
          select: {
            id: true,
            recruteurId: true,
          },
        },
        candidat: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            competences: true,
            cv: true,
            letterm: true,
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
        checklist: {
          orderBy: { createdAt: "desc" },
        },
        files: {
          orderBy: { createdAt: "desc" },
        },
        collaborateurs: {
          include: {
            collaborateur: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: "Candidature non trouvée ou accès non autorisé" },
        { status: 404 }
      );
    }

    // Vérifier que la nouvelle colonne existe et appartient à la même offre
    const newColumn = await prisma.kanbanColumn.findFirst({
      where: {
        id: newColumnId,
        jobOfferId: existingApplication.jobOffer.id,
      },
    });

    if (!newColumn) {
      return NextResponse.json(
        { error: "Colonne de destination invalide" },
        { status: 400 }
      );
    }

    // Mettre à jour l'application
    const updatedApplication = await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        columnId: newColumnId,
      },
      include: {
        candidat: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            competences: true,
            cv: true,
            letterm: true,
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
        checklist: {
          orderBy: { createdAt: "desc" },
        },
        files: {
          orderBy: { createdAt: "desc" },
        },
        collaborateurs: {
          include: {
            collaborateur: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Publier l'événement WebSocket
    await kanbanEvents.applicationMoved(
      applicationId,
      newColumnId,
      existingApplication.jobOffer.id.toString(),
      updatedApplication
    );

    // Invalider le cache
    await cacheUtils.del(
      CACHE_KEYS.KANBAN_BOARD(existingApplication.jobOffer.id.toString())
    );

    return NextResponse.json(
      {
        success: true,
        application: updatedApplication,
        message: "Application déplacée avec succès",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du déplacement de l'application:", error);
    return NextResponse.json(
      { error: "Erreur lors du déplacement de l'application" },
      { status: 500 }
    );
  }
}
