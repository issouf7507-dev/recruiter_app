import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const body = await req.json();
    const { favorite } = body;
    const session = await auth.api.getSession({ headers: req.headers });
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session?.user.id },
    });

    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session?.user.id },
      include: {
        recruteur: true,
      },
    });
    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (typeof favorite !== "boolean") {
      return NextResponse.json(
        { error: "Le paramètre favorite doit être un booléen" },
        { status: 400 }
      );
    }

    // Vérifier que l'application appartient bien au recruteur

    // Vérifier que l'application existe et appartient à une offre du recruteur
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Candidature non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    // Mettre à jour le statut favori de la candidature
    const updatedApplication = await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        favorite: favorite,
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
    });

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: favorite
        ? "Candidature ajoutée aux favoris"
        : "Candidature retirée des favoris",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du favori:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du favori" },
      { status: 500 }
    );
  }
}
