import { NextResponse, NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const token = req.cookies.get("token")?.value;
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

    const { applicationId } = await params;
    const body = await req.json();
    const { favorite } = body;

    if (typeof favorite !== "boolean") {
      return NextResponse.json(
        { error: "Le paramètre favorite doit être un booléen" },
        { status: 400 }
      );
    }

    // Vérifier que l'application appartient bien au recruteur
    const recruteur = await prisma.recruteur.findFirst({
      where: {
        userId: decoded.userId,
      },
    });

    if (!recruteur) {
      return NextResponse.json(
        { error: "Recruteur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'application existe et appartient à une offre du recruteur
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          recruteurId: recruteur.id,
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




