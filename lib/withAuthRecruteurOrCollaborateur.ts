// lib/withAuthRecruteurOrCollaborateur.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface AuthResult {
  session: any;
  recruteur: any;
  isCollaborateur?: boolean;
  collaborateur?: any;
}

export async function withAuthRecruteurOrCollaborateur(
  req: NextRequest,
  params: { id?: string },
  callback: (authResult: AuthResult) => Promise<NextResponse>
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'id de la route correspond au user connecté (si fourni)
    if (params?.id && session.user.id !== params.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un recruteur
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session.user.id },
    });

    if (recruteur) {
      // C'est un recruteur
      return await callback({
        session,
        recruteur,
        isCollaborateur: false,
      });
    }

    // Vérifier si l'utilisateur est un collaborateur
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session.user.id },
      include: {
        recruteur: true,
      },
    });

    if (collaborateur) {
      // C'est un collaborateur, utiliser le recruteur associé
      return await callback({
        session,
        recruteur: collaborateur.recruteur,
        isCollaborateur: true,
        collaborateur,
      });
    }

    // Ni recruteur ni collaborateur
    return NextResponse.json(
      { error: "Utilisateur non autorisé" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Erreur auth utilitaire:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function withAuthRecruteurOrCollaborateurNoId(
  req: NextRequest,
  callback: (authResult: AuthResult) => Promise<NextResponse>
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un recruteur
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session.user.id },
    });

    if (recruteur) {
      // C'est un recruteur
      return await callback({
        session,
        recruteur,
        isCollaborateur: false,
      });
    }

    // Vérifier si l'utilisateur est un collaborateur
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session.user.id },
      include: {
        recruteur: true,
      },
    });

    if (collaborateur) {
      // C'est un collaborateur, utiliser le recruteur associé
      return await callback({
        session,
        recruteur: collaborateur.recruteur,
        isCollaborateur: true,
        collaborateur,
      });
    }

    // Ni recruteur ni collaborateur
    return NextResponse.json(
      { error: "Utilisateur non autorisé" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Erreur auth utilitaire:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
