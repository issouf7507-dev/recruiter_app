import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  nom: z.string().min(2).optional(),
  prenom: z.string().min(2).optional(),
  telephone: z.string().min(8).optional(),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  dateNaissance: z
    .union([z.date(), z.string().datetime(), z.string().optional()])
    .optional(),
  nationalite: z.string().optional(),
  situationFamiliale: z.string().optional(),
  permisConduire: z.string().optional(),
  bio: z.string().optional(),
  cv: z.string().optional(),
  letterm: z.string().optional(),
  competences: z.array(z.string()).optional(),
  image: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    // Utiliser le nouveau système d'authentification
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const body = await req.json();
    const validatedData = updateSchema.parse(body);

    // Extraire les compétences du validatedData
    const { competences, dateNaissance, ...candidatData } = validatedData;

    // Préparer les données pour la mise à jour
    const updateData: any = { ...candidatData };

    // Gérer la date de naissance
    if (dateNaissance) {
      if (typeof dateNaissance === "string") {
        updateData.dateNaissance = new Date(dateNaissance);
      } else {
        updateData.dateNaissance = dateNaissance;
      }
    }

    // Mettre à jour le profil du candidat
    const updatedCandidat = await prisma.candidat.update({
      where: { userId: session.user.id },
      data: updateData,
    });

    // Si des compétences sont fournies, les mettre à jour
    if (competences !== undefined) {
      // Supprimer toutes les compétences existantes
      await prisma.candidatCompetence.deleteMany({
        where: { candidatId: updatedCandidat.id },
      });

      // Ajouter les nouvelles compétences si il y en a
      if (competences.length > 0) {
        await prisma.candidatCompetence.createMany({
          data: competences.map((competence: string) => ({
            candidatId: updatedCandidat.id,
            competence: competence,
          })),
        });
      }
    }

    // Récupérer le candidat avec ses compétences
    const candidatWithCompetences = await prisma.candidat.findUnique({
      where: { id: updatedCandidat.id },
      include: {
        candidatCompetences: true,
      },
    });

    return NextResponse.json({
      success: true,
      candidat: candidatWithCompetences,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Erreur de validation Zod:", error.errors);
      return NextResponse.json(
        {
          error: "Données invalides",
          details: error.errors,
          message: "Validation failed",
        },
        { status: 400 }
      );
    }
    console.error("Erreur lors de la mise à jour du profil:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la mise à jour du profil",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
