import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

// GET /api/alertes - Récupérer toutes les alertes d'un candidat
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
    const alertes = await prisma.alerteEmploi.findMany({
      where: { candidatId: candidat.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(alertes);
  } catch (error) {
    console.error("[ALERTES_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

// POST /api/alertes - Créer une nouvelle alerte
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const {
      titre,
      motsCles,
      localisation,
      typeContrat,
      salaireMin,
      salaireMax,
      experience,
      frequence,
    } = body;

    if (!titre || !localisation || !typeContrat || !experience) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    const candidat = await prisma.candidat.findFirst({
      where: { userId: decoded.userId },
    });

    if (!candidat) {
      return new NextResponse("Candidat non trouvé", { status: 404 });
    }

    const alerte = await prisma.alerteEmploi.create({
      data: {
        titre,
        motsCles: motsCles || [],
        localisation,
        typeContrat,
        salaireMin,
        salaireMax,
        experience,
        frequence: frequence || "Quotidienne",
        candidatId: candidat.id,
        active: true,
      },
    });

    return NextResponse.json(alerte);
  } catch (error) {
    console.error("[ALERTES_POST]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
