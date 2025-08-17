import { NextResponse, NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

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

    // Vérifier si le candidat existe
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

    // console.log(jobOfferId);

    // Vérifier si l'offre existe
    const jobOffer = await prisma.jobOffer.findUnique({
      where: {
        id: Number(jobOfferId),
      },
      include: {
        kanbanColumns: {
          orderBy: {
            order: "asc",
          },

          take: 1,
        },
      },
    });

    if (!jobOffer?.kanbanColumns?.[0]) {
      return NextResponse.json(
        { error: "Aucune colonne kanban trouvée pour cette offre" },
        { status: 400 }
      );
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        candidatId: candidat.id,
        jobOfferId: Number(jobOfferId),
        columnId: jobOffer.kanbanColumns[0].id,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Vous avez déjà postulé à cette offre" },
        { status: 400 }
      );
    }

    // Créer la candidature
    const application = await prisma.application.create({
      data: {
        message,
        candidatId: candidat.id,
        jobOfferId: Number(jobOfferId),
        columnId: jobOffer.kanbanColumns[0].id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: application,
      },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
