import { NextResponse, NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

// GET /api/candidat/formations
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

    const formations = await prisma.formation.findMany({
      where: {
        candidatId: candidat.id,
      },
      orderBy: {
        dateDebut: "desc",
      },
    });

    return NextResponse.json({ success: true, data: formations });
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des formations" },
      { status: 500 }
    );
  }
}

// POST /api/candidat/formations
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
    const { diplome, etablissement, domaine, dateDebut, dateFin, description } =
      body;

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

    const formation = await prisma.formation.create({
      data: {
        diplome,
        etablissement,
        domaine,
        dateDebut: new Date(dateDebut),
        dateFin: dateFin ? new Date(dateFin) : null,
        description,
        candidatId: candidat.id,
      },
    });

    return NextResponse.json({ success: true, data: formation });
  } catch (error) {
    console.error("Erreur lors de la création de la formation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la formation" },
      { status: 500 }
    );
  }
}
