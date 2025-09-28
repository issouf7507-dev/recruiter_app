// lib/withAuth.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function withAuthCandidat(
  req: NextRequest,
  params: { id?: string },
  callback: (session: any, recruteur: any) => Promise<NextResponse>
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

    // Récupérer le recruteur lié
    const candidat = await prisma.candidat.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat introuvable" },
        { status: 404 }
      );
    }

    // Exécuter la logique métier passée en callback
    return await callback(session, candidat);
  } catch (error) {
    console.error("Erreur auth utilitaire:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function withAuthCandidatNoId(
  req: NextRequest,

  callback: (session: any, candidat: any) => Promise<NextResponse>
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'id de la route correspond au user connecté (si fourni)

    // Récupérer le candidat lié
    const candidat = await prisma.candidat.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat introuvable" },
        { status: 404 }
      );
    }

    // Exécuter la logique métier passée en callback
    return await callback(session, candidat);
  } catch (error) {
    console.error("Erreur auth utilitaire:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
