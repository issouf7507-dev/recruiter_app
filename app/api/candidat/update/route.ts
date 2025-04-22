import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { verify } from "jsonwebtoken";

const updateSchema = z.object({
  nom: z.string().min(2).optional(),
  prenom: z.string().min(2).optional(),
  telephone: z.string().min(8).optional(),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  dateNaissance: z.string().optional(),
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
    // Récupérer le token depuis les cookies
    const token = req.cookies.get("candidat")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    // Vérifier le token
    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "CANDIDAT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const body = await req.json();
    const validatedData = updateSchema.parse(body);

    // Mettre à jour le profil du candidat
    const updatedCandidat = await prisma.candidat.update({
      where: { userId: decoded.userId },
      data: {
        ...validatedData,
        dateNaissance: validatedData.dateNaissance
          ? new Date(validatedData.dateNaissance)
          : undefined,
      },
    });

    return NextResponse.json({ success: true, candidat: updatedCandidat });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Erreur lors de la mise à jour du profil:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
