import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Récupérer le token depuis les cookies
    const token = req.cookies.get("candidat")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier le token
    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    // Récupérer l'utilisateur avec les compétences du candidat
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        candidat: {
          include: {
            candidatCompetences: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Transformer les données pour inclure les compétences dans le bon format
    if (user.candidat) {
      const competences = user.candidat.candidatCompetences.map(
        (comp) => comp.competence
      );

      // Créer un nouvel objet candidat avec les compétences
      const candidatWithCompetences = {
        ...user.candidat,
        competences: competences,
      };

      // Remplacer le candidat dans l'objet user
      user.candidat = candidatWithCompetences as any;
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Erreur dans /api/auth/me-cd:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des informations" },
      { status: 500 }
    );
  }
}
