import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { sign } from "jsonwebtoken";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        recruteur: true,
        collaborateur: {
          include: {
            recruteur: true,
          },
        },
      },
    });

    // Vérifier que l'utilisateur est un recruteur ou un collaborateur
    if (!user || (user.type !== "RECRUTEUR" && user.type !== "COLLABORATEUR")) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await compare(password, user.password!);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Créer le token JWT
    const token = sign(
      { userId: user.id, type: user.type },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Créer la réponse
    const response = NextResponse.json({
      user: { ...user, password: undefined },
    });

    // Définir le cookie HttpOnly
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}
