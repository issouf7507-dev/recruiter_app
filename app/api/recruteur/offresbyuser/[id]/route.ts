import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import { withAuthRectruter } from "@/lib/withAuthRectruter";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    return withAuthRectruter(
      req,
      resolvedParams,
      async (session, recruteur) => {
        const offres = await prisma.jobOffer.findMany({
          where: { recruteurId: recruteur.id },
          include: {
            recruteur: true,
            applications: {
              include: {
                candidat: {
                  select: { id: true, nom: true, prenom: true, email: true },
                },
              },
            },
          },
        });

        return NextResponse.json(offres);
      }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des offres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des offres" },
      { status: 500 }
    );
  }
}
