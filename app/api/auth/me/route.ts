import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Récupérer le token depuis les cookies
    const token = req.cookies.get("token")?.value;
    // console.log(token);

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier le token
    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    // Vérifier que l'utilisateur est un recruteur ou un collaborateur
    if (decoded.type !== "RECRUTEUR" && decoded.type !== "COLLABORATEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        recruteur: true,
        collaborateur: {
          include: {
            recruteur: true,
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

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des informations" },
      { status: 500 }
    );
  }
}
