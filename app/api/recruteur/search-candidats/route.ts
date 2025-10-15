import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const competences = searchParams.get("competences");
    const ville = searchParams.get("ville");
    const pays = searchParams.get("pays");
    const competencesm = searchParams.get("competencesm");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Construire la requête de base
    let whereClause: any = {
      user: {
        type: "CANDIDAT",
      },
    };

    // Filtrer par ville si spécifiée
    if (ville) {
      whereClause.ville = {
        contains: ville,
      };
    }

    // Filtrer par pays si spécifié
    if (pays) {
      whereClause.pays = pays;
    }

    // console.log(competencesm?.split(","));

    if (competencesm) {
      const competencesArray = competencesm.split(",").map((c) => c.trim());
      whereClause.candidatCompetences = {
        some: {
          competence: {
            in: competencesArray,
          },
        },
      };
    }

    // console.log(competencesm?.split(","));

    // Filtrer par compétences si spécifiées
    if (competences) {
      const competencesArray = competences.split(",").map((c) => c.trim());
      whereClause.candidatCompetences = {
        some: {
          competence: {
            in: competencesArray,
          },
        },
      };
    }

    console.log(whereClause);

    // Récupérer les candidats avec pagination
    const candidats = await prisma.candidat.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            image: true,
          },
        },
        candidatCompetences: true,
        experiences: {
          take: 3,
          orderBy: {
            dateDebut: "desc",
          },
        },
        formations: {
          take: 3,
          orderBy: {
            dateDebut: "desc",
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        id: "desc",
      },
    });

    // Compter le total pour la pagination
    const total = await prisma.candidat.count({
      where: whereClause,
    });

    // Calculer les statistiques de correspondance par compétence
    const stats = await prisma.candidatCompetence.groupBy({
      by: ["competence"],
      where: competences
        ? {
            competence: {
              in: competences.split(",").map((c) => c.trim()),
            },
          }
        : undefined,
      _count: {
        competence: true,
      },
      orderBy: {
        _count: {
          competence: "desc",
        },
      },
    });

    return NextResponse.json({
      success: true,
      candidats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche de candidats:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche de candidats" },
      { status: 500 }
    );
  }
}
