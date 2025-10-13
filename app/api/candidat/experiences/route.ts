import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

// GET /api/candidat/experiences
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("candidat")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (!decoded) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le candidat avec son ID
    const candidat = await prisma.candidat.findUnique({
      where: {
        userId: decoded.userId,
      },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    const experiences = await prisma.experience.findMany({
      where: {
        candidatId: candidat.id,
      },
      orderBy: {
        dateDebut: "desc",
      },
      include: {
        experienceCompetences: true,
      },
    });

    return NextResponse.json({ success: true, data: experiences });
  } catch (error) {
    console.error("Erreur lors de la récupération des expériences:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des expériences" },
      { status: 500 }
    );
  }
}

// POST /api/candidat/experiences
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("candidat")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (!decoded) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const {
      poste,
      entreprise,
      localisation,
      typeContrat,
      dateDebut,
      dateFin,
      description,
      competences,
    } = body;

    // Récupérer le candidat avec son ID
    const candidat = await prisma.candidat.findUnique({
      where: {
        userId: decoded.userId,
      },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    console.log("body", {
      poste: poste,
      entreprise: entreprise,
      localisation: localisation,
      typeContrat: typeContrat,
      dateDebut: dateDebut,
      dateFin: dateFin,
      description: description,
      competences: competences,
    });

    const experience = await prisma.experience.create({
      data: {
        poste,
        entreprise,
        localisation,
        typeContrat,
        dateDebut: new Date(dateDebut),
        dateFin: dateFin ? new Date(dateFin) : null,
        description,
        experienceCompetences: {
          create: competences.map((competence: any) => ({
            competence: competence,
          })),
        },
        candidatId: candidat.id,
      },
    });

    return NextResponse.json({ success: true, data: experience });
  } catch (error) {
    console.error("Erreur lors de la création de l'expérience:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'expérience" },
      { status: 500 }
    );
  }
}
