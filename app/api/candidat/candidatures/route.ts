import { NextResponse, NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // const token = req.cookies.get("candidat")?.value;
    // if (!token) {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    // }

    // const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
    //   userId: string;
    //   type: string;
    // };

    // if (decoded.type !== "CANDIDAT") {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    // }

    // // Récupérer le candidat
    // const candidat = await prisma.candidat.findFirst({
    //   where: {
    //     userId: decoded.userId,
    //   },
    // });

    // if (!candidat) {
    //   return NextResponse.json(
    //     { error: "Candidat non trouvé" },
    //     { status: 404 }
    //   );
    // }

    const session = await auth.api.getSession({ headers: req.headers });
    const candidat = await prisma.candidat.findUnique({
      where: { userId: session?.user.id },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer toutes les candidatures du candidat avec les détails des offres et colonnes
    const candidatures = await prisma.application.findMany({
      where: {
        candidatId: candidat.id,
      },
      include: {
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            type: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            salaryPeriod: true,
            description: true,
            createdAt: true,
            kanbanColumns: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
        column: {
          select: {
            id: true,
            name: true,
            order: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transformer les données pour inclure les étapes du processus
    const candidaturesAvecEtapes = candidatures.map((candidature) => {
      const colonnes = candidature.jobOffer.kanbanColumns;
      const colonneActuelle = candidature.column;

      // Créer les étapes basées sur les colonnes kanban
      const etapes = colonnes.map((colonne) => {
        let statut = "pending";
        let date = "À venir";

        if (colonne.order < colonneActuelle.order) {
          statut = "complete";
          date = "Terminé";
        } else if (colonne.order === colonneActuelle.order) {
          statut = "current";
          date = "En cours";
        }

        return {
          nom: colonne.name,
          date: date,
          statut: statut,
          colonneId: colonne.id,
        };
      });

      return {
        id: candidature.id,
        titre: candidature.jobOffer.title,
        entreprise: candidature.jobOffer.company,
        localisation: candidature.jobOffer.location,
        type: candidature.jobOffer.type,
        salaire: `${candidature?.jobOffer.salaryMin?.toLocaleString()} - ${candidature?.jobOffer.salaryMax?.toLocaleString()} ${
          candidature.jobOffer.salaryCurrency
        }/${candidature.jobOffer.salaryPeriod}`,
        description: candidature.jobOffer.description,
        dateCandidature: candidature.createdAt.toLocaleDateString("fr-FR"),
        status: colonneActuelle.name.toLowerCase().replace(/\s+/g, "_"),
        etapes: etapes,
        message: candidature.message,
        colonneActuelle: colonneActuelle,
        jobOfferId: candidature.jobOffer.id,
      };
    });

    return NextResponse.json({
      success: true,
      data: candidaturesAvecEtapes,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des candidatures:", err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des candidatures" },
      { status: 500 }
    );
  }
}
