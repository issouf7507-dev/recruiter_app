import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier la configuration
    const config = {
      linkedinAccessToken: !!process.env.LINKEDIN_ACCESS_TOKEN,
      linkedinPersonUrn:
        process.env.LINKEDIN_PERSON_URN || `urn:li:person:${decoded.userId}`,
      jwtSecret: !!process.env.JWT_SECRET,
      databaseUrl: !!process.env.DATABASE_URL,
    };

    // Vérifier les offres du recruteur
    const offres = await prisma.jobOffer.findMany({
      where: {
        recruteurId: decoded.userId,
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
        id: decoded.userId,
        type: decoded.type,
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
