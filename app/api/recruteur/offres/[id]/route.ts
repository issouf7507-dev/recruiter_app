import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";
// import { cacheUtils, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await req.json();
    console.log("Received skills in API:", body.skills);
    const {
      title,
      description,
      company,
      location,
      type,
      experience,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod,
      skills,
      requirements,
      responsibilities,
      benefits,
      // recruteurId,
    } = body;

    // First, delete existing competences for this job offer
    await prisma.jobOfferCompetence.deleteMany({
      where: {
        jobOfferId: Number(id),
      },
    });

    const jobOffer = await prisma.jobOffer.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        description,
        company,
        location,
        type,
        experience,
        salaryMin: parseFloat(salaryMin),
        salaryMax: parseFloat(salaryMax),
        salaryCurrency,
        salaryPeriod,
        skills: "",
        requirements,
        responsibilities,
        benefits,
        jobOfferCompetences: {
          create: skills.map((skill: any) => ({
            competence: skill,
          })),
        },
      },
    });

    return NextResponse.json(
      { message: true, data: jobOffer },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (
      !authenticatedUser ||
      (authenticatedUser.type !== "RECRUTEUR" &&
        authenticatedUser.type !== "COLLABORATEUR")
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const offerId = (await params).id;
    // const cacheKey = CACHE_KEYS.KANBAN_BOARD(offerId);

    // Si pas en cache, récupérer depuis la base de données
    const offer = await prisma.jobOffer.findFirst({
      where: {
        id: Number(offerId),
        recruteurId: authenticatedUser.recruteurId,
      },
      include: {
        kanbanColumns: {
          orderBy: { order: "asc" },
        },
        applications: {
          include: {
            candidat: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                competencesList: true,
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
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 });
    }

    // Mettre en cache
    // await cacheUtils.set(cacheKey, [offer], CACHE_TTL.KANBAN_BOARD);

    return NextResponse.json({
      success: true,
      data: [offer],
      fromCache: false,
    });
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
