import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const candidatSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nom: z.string().min(2),
  prenom: z.string().min(2),
  telephone: z.string().min(8),
  pays: z.string().min(1),
  dateNaissance: z.string(),
  nationalite: z.string().min(1),
  situationFamiliale: z.string().min(1),
  permisConduire: z.string().min(1),
  type: z.literal("CANDIDAT"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = candidatSchema.parse(body);

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(validatedData.password, 12);

    // Créer l'utilisateur et le candidat
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: `${validatedData.prenom} ${validatedData.nom}`,
        type: "CANDIDAT",
        candidat: {
          create: {
            nom: validatedData.nom,
            prenom: validatedData.prenom,
            telephone: validatedData.telephone,
            pays: validatedData.pays,
            dateNaissance: new Date(validatedData.dateNaissance),
            nationalite: validatedData.nationalite,
            situationFamiliale: validatedData.situationFamiliale,
            permisConduire: validatedData.permisConduire,
          },
        },
      },
      include: { candidat: true },
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(
      { success: true, user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Erreur lors de la création du compte:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
