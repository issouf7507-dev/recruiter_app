import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    // Récupérer l'offre actuelle
    const currentOffer = await prisma.jobOffer.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!currentOffer) {
      return NextResponse.json(
        { success: false, message: "Offre non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les offres similaires
    const similarOffers = await prisma.jobOffer.findMany({
      where: {
        AND: [
          {
            id: {
              not: Number(id), // Exclure l'offre actuelle
            },
          },
          {
            OR: [
              {
                type: currentOffer.type, // Même type de contrat
              },
              {
                location: currentOffer.location, // Même localisation
              },
              {
                competences: {
                  hasSome: currentOffer.competences, // Compétences similaires
                },
              },
              {
                AND: [
                  {
                    salaryMin: {
                      lte: currentOffer.salaryMax, // Salaire minimum inférieur ou égal au salaire maximum de l'offre actuelle
                    },
                  },
                  {
                    salaryMax: {
                      gte: currentOffer.salaryMin, // Salaire maximum supérieur ou égal au salaire minimum de l'offre actuelle
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      take: 5, // Limiter à 5 offres similaires
      orderBy: {
        createdAt: "desc", // Les plus récentes d'abord
      },
    });

    return NextResponse.json(
      { success: true, data: similarOffers },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
