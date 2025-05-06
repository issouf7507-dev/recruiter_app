import { NextResponse, NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

// GET /api/candidat/competences
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

    const competences = await prisma.competence.findMany({
      where: {
        candidatId: candidat.id,
      },
      orderBy: {
        categorie: "asc",
      },
    });

    return NextResponse.json({ success: true, data: competences });
  } catch (error) {
    console.error("Erreur lors de la récupération des compétences:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des compétences" },
      { status: 500 }
    );
  }
}

// POST /api/candidat/competences
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
    const { categorie, nom, niveau } = body;

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

    const competence = await prisma.competence.create({
      data: {
        categorie,
        nom,
        niveau,
        candidatId: candidat.id,
      },
    });

    return NextResponse.json({ success: true, data: competence });
  } catch (error) {
    console.error("Erreur lors de la création de la compétence:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la compétence" },
      { status: 500 }
    );
  }
}
