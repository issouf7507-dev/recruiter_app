import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { withAuthRecruteurOrCollaborateurNoId } from "@/lib/withAuthRecruteurOrCollaborateur";

export async function GET(req: NextRequest) {
  try {
    return withAuthRecruteurOrCollaborateurNoId(
      req,
      async ({ session, recruteur, isCollaborateur, collaborateur }) => {
        // Récupérer toutes les candidatures de toutes les offres du recruteur
        const candidatures = await prisma.application.findMany({
          where: {
            jobOffer: {
              recruteurId: recruteur.id,
            },
          },
          include: {
            candidat: true,
            column: true,
            jobOffer: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return NextResponse.json(
          {
            success: true,
            data: candidatures,
            userType: isCollaborateur ? "collaborateur" : "recruteur",
            collaborateur: isCollaborateur
              ? {
                  id: collaborateur?.id,
                  role: collaborateur?.role,
                  nom: collaborateur?.nom,
                  prenom: collaborateur?.prenom,
                }
              : null,
          },
          { status: 200 }
        );
      }
    );
  } catch (err) {
    console.error("Erreur lors de la récupération des candidatures:", err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des candidatures" },
      { status: 500 }
    );
  }
}
