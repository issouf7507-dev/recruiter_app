import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";
// import { cacheUtils, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const authenticatedUser = await getAuthenticatedUser(req);
    const offerId = (await params).id;

    const session = await auth.api.getSession({ headers: req.headers });

    if (session?.user && session.user.id) {
      const candidat = await prisma.candidat.findUnique({
        where: { userId: session.user.id },
      });

      if (!candidat) {
        return NextResponse.json(
          { error: "Candidat non trouvé" },
          { status: 404 }
        );
      }

      const offer = await prisma.jobOffer.findFirst({
        where: {
          id: Number(offerId),
        },
        include: {
          kanbanColumns: { orderBy: { order: "asc" } },
          applications: {
            include: {
              candidat: {
                select: {
                  id: true,
                  nom: true,
                  prenom: true,
                  email: true,
                  candidatCompetences: true,
                  // competencesList : true,
                  cv: true,
                  letterm: true,
                  // statut: true,
                },
              },
              notes: { orderBy: { createdAt: "desc" } },
              checklist: { orderBy: { createdAt: "desc" } },
              files: { orderBy: { createdAt: "desc" } },
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
            orderBy: { createdAt: "desc" },
          },
          jobOfferCompetences: {
            select: { competence: true },
            orderBy: { competence: "asc" },
          },
        },
      });
      if (!offer) {
        return NextResponse.json(
          { error: "Offre non trouvée" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: [offer],
        fromCache: false,
      });
    } else {
      // Version publique (infos de base)
      const offer = await prisma.jobOffer.findFirst({
        where: { id: Number(offerId) },
        include: {
          jobOfferCompetences: {
            select: { competence: true },
            orderBy: { competence: "asc" },
          },
        },
      });
      if (!offer) {
        return NextResponse.json(
          { error: "Offre non trouvée" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: [offer] });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'offre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'offre" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    // Supprimer d'abord les colonnes du kanban associées
    await prisma.kanbanColumn.deleteMany({
      where: {
        jobOfferId: Number(id),
      },
    });

    // Supprimer l'offre
    const jobOffer = await prisma.jobOffer.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json(
      { success: true, data: jobOffer },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de la suppression",
      },
      { status: 500 }
    );
  }
}
