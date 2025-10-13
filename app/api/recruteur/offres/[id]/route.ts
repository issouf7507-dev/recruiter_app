import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";
// import { cacheUtils, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await req.json();
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

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
      duedate,
      etat,
      // recruteurId,
    } = body;

    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session.user.id },
    });

    const collaborateur = await prisma.collaborateur.findFirst({
      where: { userId: session.user.id },
      include: {
        recruteur: true,
      },
    });
    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // First, delete existing competences for this job offer
    await prisma.jobOfferCompetence.deleteMany({
      where: {
        jobOfferId: id as string,
      },
    });

    const jobOffer = await prisma.jobOffer.update({
      where: {
        id: id as string,
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
        etat,
        duedate: new Date(duedate),
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
    // const authenticatedUser = await getAuthenticatedUser(req);
    const offerId = (await params).id;

    const session = await auth.api.getSession({ headers: req.headers });

    if (session?.user && session.user.id) {
      // Version privée (toutes les infos)

      const recruteurId = await prisma.recruteur.findUnique({
        where: { userId: session.user.id },
      });

      const collaborateur = await prisma.collaborateur.findFirst({
        where: { userId: session.user.id },
        include: {
          recruteur: true,
        },
      });

      const offer = await prisma.jobOffer.findFirst({
        where: {
          id: offerId as string,
          recruteurId: recruteurId?.id || collaborateur?.recruteur?.id || "",
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
        where: { id: offerId as string },
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

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const collaborateur = await prisma.collaborateur.findFirst({
      where: { userId: session.user.id },
      include: {
        recruteur: true,
      },
    });

    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session.user.id },
    });
    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Supprimer d'abord les colonnes du kanban associées
    await prisma.kanbanColumn.deleteMany({
      where: {
        jobOfferId: id as string,
      },
    });

    // Supprimer l'offre
    const jobOffer = await prisma.jobOffer.delete({
      where: {
        id: id as string,
      },
    });

    return NextResponse.json(
      { success: true, data: jobOffer },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue lors de la suppression",
      },
      { status: 500 }
    );
  }
}
