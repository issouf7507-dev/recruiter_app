import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le candidat avec ses compétences
    const candidat = await prisma.candidat.findUnique({
      where: { userId: session.user.id },
      include: {
        candidatCompetences: {
          select: {
            competence: true,
          },
        },
        user: {
          select: {
            email: true,
            image: true,
          },
        },
      },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Profil candidat non trouvé" },
        { status: 404 }
      );
    }

    // Transformer les compétences en tableau de strings
    const competences = candidat.candidatCompetences.map(
      (comp) => comp.competence
    );

    // Formater les données pour le frontend
    const { candidatCompetences, user, ...candidatData } = candidat;
    const profileData = {
      ...candidatData,
      competences,
      email: user.email,
      image: candidat.image || user.image,
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}
