import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import { withAuthRecruteurOrCollaborateur } from "@/lib/withAuthRecruteurOrCollaborateur";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    return withAuthRecruteurOrCollaborateur(
      req,
      resolvedParams,
      async ({ session, recruteur, isCollaborateur, collaborateur }) => {
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

        // Ajouter des métadonnées pour identifier le type d'utilisateur
        const response = {
          data: offres,
          userType: isCollaborateur ? "collaborateur" : "recruteur",
          collaborateur: isCollaborateur
            ? {
                id: collaborateur?.id,
                role: collaborateur?.role,
                nom: collaborateur?.nom,
                prenom: collaborateur?.prenom,
              }
            : null,
        };

        return NextResponse.json(response);
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
