import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

// GET /api/objectifs - Récupérer tous les objectifs d'un candidat
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("candidat")?.value;
    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "CANDIDAT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le candidat
    const candidat = await prisma.candidat.findFirst({
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

    const objectifs = await prisma.objectifCarriere.findMany({
      where: { candidatId: candidat.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ status: 200, data: objectifs });
  } catch (error) {
    console.error("[OBJECTIFS_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

// POST /api/objectifs - Créer un nouvel objectif
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("candidat")?.value;

    const body = await req.json();
    const { titre, description, categorie, dateLimite, etapes } = body;

    if (!titre || !description || !categorie || !dateLimite) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "CANDIDAT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le candidat
    const candidat = await prisma.candidat.findFirst({
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

    if (!candidat) {
      return new NextResponse("Candidat non trouvé", { status: 404 });
    }

    const objectif = await prisma.objectifCarriere.create({
      data: {
        titre,
        description,
        categorie,
        dateLimite: new Date(dateLimite),
        objectifEtapes: {
          create: etapes.map((etape: any) => ({
            titre: etape.titre,
            description: etape.description,
          })),
        },
        candidatId: candidat.id,
      },
    });

    return NextResponse.json(objectif);
  } catch (error) {
    console.error("[OBJECTIFS_POST]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
