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
        id: id as string,
      },
      include: {
        jobOfferCompetences: true,
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
              not: id as string, // Exclure l'offre actuelle
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
                jobOfferCompetences: {
                  some: {
                    competence: {
                      in: currentOffer.jobOfferCompetences.map(
                        (competence) => competence.competence
                      ),
                    },
                  },
                },
              },
              ...(currentOffer.salaryMin !== null &&
              currentOffer.salaryMax !== null
                ? [
                    {
                      AND: [
                        {
                          salaryMin: {
                            lte: currentOffer.salaryMax,
                          },
                        },
                        {
                          salaryMax: {
                            gte: currentOffer.salaryMin,
                          },
                        },
                      ],
                    },
                  ]
                : []),
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
