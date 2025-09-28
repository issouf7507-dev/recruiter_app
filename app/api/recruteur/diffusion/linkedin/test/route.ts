import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session.user.id },
    });
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session.user.id },
      include: {
        recruteur: true,
      },
    });
    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier la configuration
    const config = {
      linkedinAccessToken: !!process.env.LINKEDIN_ACCESS_TOKEN,
      linkedinPersonUrn:
        process.env.LINKEDIN_PERSON_URN || `urn:li:person:${session.user.id}`,
      jwtSecret: !!process.env.JWT_SECRET,
      databaseUrl: !!process.env.DATABASE_URL,
    };

    // Vérifier les offres du recruteur
    const offres = await prisma.jobOffer.findMany({
      where: {
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      },
      select: {
        id: true,
        title: true,
        company: true,
        _count: {
          select: {
            jobOfferCompetences: true,
          },
        },
      },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      config,
      user: {
        id: session.user.id,
        type: recruteur?.type || collaborateur?.recruteur?.type || "",
      },
      offres,
      message: "Configuration vérifiée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors du test:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du test",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
