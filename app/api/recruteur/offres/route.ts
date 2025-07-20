import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
// import { CACHE_KEYS, CACHE_TTL, cacheUtils } from "@/lib/redis";

const DISABLE_CACHE_LOCAL = true; // Force la désactivation

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
      education,
      // template,
      recruteurId,
    } = body;

    const recruteur = await prisma.recruteur.findFirst({
      where: {
        userId: recruteurId,
      },
    });

    if (!recruteur) {
      return NextResponse.json(
        { success: false, message: "Ce recruteur n'existe pas" },
        { status: 400 }
      );
    }

    const jobOffer = await prisma.jobOffer.create({
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
        // education,
        // templateId: template,
        recruteurId: recruteur.id,
        jobOfferCompetences: {
          create: skills.map((skill: any) => ({
            competence: skill,
          })),
        },
      },
    });

    const defaultColumns = [
      { name: "Nouvelles", color: "bg-blue-300/30", order: 1, isDefault: true },
      {
        name: "En cours",
        color: "bg-yellow-300/30",
        order: 2,
        isDefault: true,
      },
      {
        name: "Finalisées",
        color: "bg-green-300/30",
        order: 3,
        isDefault: true,
      },
    ];

    await Promise.all(
      defaultColumns.map((col, id) =>
        prisma.kanbanColumn.create({
          data: {
            ...col,
            jobOfferId: jobOffer.id,
          },
        })
      )
    );

    // Invalider le cache après création d'une nouvelle offre
    // const cacheKey = CACHE_KEYS.KANBAN_BOARD(recruteur.id);
    // await cacheUtils.del(cacheKey);
    // console.log("Cache invalidé après création d'offre:", cacheKey);

    return NextResponse.json(
      { success: true, data: jobOffer },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erreur lors de la création de l'offre:", err);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le recruteur
    const recruteur = await prisma.recruteur.findFirst({
      where: {
        userId: decoded.userId,
      },
    });

    if (!recruteur) {
      return NextResponse.json(
        { error: "Recruteur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer toutes les offres du recruteur
    const offres = await prisma.jobOffer.findMany({
      where: {
        recruteurId: recruteur.id,
        etat: "active",
      },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        description: true,
        type: true,
        experience: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        salaryPeriod: true,
        skills: true,
        requirements: true,
        responsibilities: true,
        benefits: true,

        jobOfferCompetences: {
          select: {
            competence: true,
          },
        },

        createdAt: true,
        updatedAt: true,
        etat: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: offres,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur lors de la récupération des offres:", err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des offres" },
      { status: 500 }
    );
  }
}
