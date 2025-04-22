import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

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

    if (decoded.type !== "CANDIDAT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { jobOfferId, message } = body;

    if (!jobOfferId) {
      return NextResponse.json(
        { error: "ID de l'offre requis" },
        { status: 400 }
      );
    }

    // Récupérer le candidat
    const candidat = await prisma.candidat.findUnique({
      where: { userId: decoded.userId },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer la colonne par défaut "Nouvelles"
    const defaultColumn = await prisma.kanbanColumn.findFirst({
      where: {
        jobOfferId: jobOfferId,
        isDefault: true,
      },
    });

    if (!defaultColumn) {
      return NextResponse.json(
        { error: "Colonne par défaut non trouvée" },
        { status: 404 }
      );
    }

    // Créer la candidature
    const application = await prisma.application.create({
      data: {
        candidatId: candidat.id,
        jobOfferId: jobOfferId,
        columnId: defaultColumn.id,
        message: message || null,
        cv: candidat.cv || null,
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Erreur lors de la candidature:", error);
    return NextResponse.json(
      { error: "Erreur lors de la candidature" },
      { status: 500 }
    );
  }
}
