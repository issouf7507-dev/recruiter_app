import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

// GET - Récupérer les candidats disponibles pour une offre d'emploi
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

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

    const { searchParams } = new URL(request.url);
    const jobOfferId = searchParams.get("jobOfferId");

    if (!jobOfferId) {
      return NextResponse.json(
        { error: "jobOfferId est requis" },
        { status: 400 }
      );
    }

    // Récupérer le recruteur
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: decoded.userId },
    });

    if (!recruteur) {
      return NextResponse.json(
        { error: "Recruteur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'offre appartient au recruteur
    const jobOffer = await prisma.jobOffer.findFirst({
      where: {
        id: parseInt(jobOfferId),
        recruteurId: recruteur.id,
      },
    });

    if (!jobOffer) {
      return NextResponse.json(
        { error: "Offre non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    // Récupérer tous les candidats qui ont postulé à cette offre
    const applications = await prisma.application.findMany({
      where: {
        jobOfferId: parseInt(jobOfferId),
      },
      include: {
        candidat: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            image: true,
            telephone: true,
            ville: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Formater les données
    const candidats = applications.map((app) => ({
      id: app.candidat.id,
      name: `${app.candidat.prenom || ""} ${app.candidat.nom || ""}`.trim(),
      email: app.candidat.email,
      telephone: app.candidat.telephone,
      ville: app.candidat.ville,
      avatar: app.candidat.image,
      applicationId: app.id,
      applicationDate: app.createdAt,
    }));

    return NextResponse.json(candidats);
  } catch (error) {
    console.error("Erreur lors de la récupération des candidats:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
