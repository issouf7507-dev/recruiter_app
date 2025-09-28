import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";

// GET - Récupérer les candidats disponibles pour une offre d'emploi
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session.user.id },
    });
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session.user.id },
      include: {
        recruteur: true,
      },
    });
    if (!recruteur && !collaborateur) {
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

    // Vérifier que l'offre appartient au recruteur
    const jobOffer = await prisma.jobOffer.findFirst({
      where: {
        id: parseInt(jobOfferId),
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
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
