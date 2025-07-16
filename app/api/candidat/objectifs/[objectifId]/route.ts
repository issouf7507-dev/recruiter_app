import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ objectifId: string }> }
) {
  try {
    const token = req.cookies.get("candidat")?.value;
    const { objectifId } = await params;
    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "CANDIDAT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le candidat
    const candidat = await prisma.candidat.findFirst({
      where: {
        userId: decoded.userId,
      },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    const objectif = await prisma.objectifCarriere.findUnique({
      where: {
        id: objectifId,
        candidatId: candidat.id,
      },
    });

    if (!objectif) {
      return new NextResponse("Objectif non trouvé", { status: 404 });
    }

    return NextResponse.json(objectif);
  } catch (error) {
    console.error("[OBJECTIF_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

// PATCH /api/objectifs/[objectifId] - Modifier un objectif
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ objectifId: string }> }
) {
  try {
    const token = req.cookies.get("candidat")?.value;
    const { objectifId } = await params;

    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "CANDIDAT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { titre, description, categorie, dateLimite, progression, etapes } =
      body;

    const candidat = await prisma.candidat.findFirst({
      where: { userId: decoded.userId },
    });

    if (!candidat) {
      return new NextResponse("Candidat non trouvé", { status: 404 });
    }

    const objectif = await prisma.objectifCarriere.findUnique({
      where: {
        id: objectifId,
        candidatId: candidat.id,
      },
    });

    if (!objectif) {
      return new NextResponse("Objectif non trouvé", { status: 404 });
    }

    const updatedObjectif = await prisma.objectifCarriere.update({
      where: { id: objectifId },
      data: {
        titre: titre || objectif.titre,
        description: description || objectif.description,
        categorie: categorie || objectif.categorie,
        dateLimite: dateLimite ? new Date(dateLimite) : objectif.dateLimite,
        progression:
          progression !== undefined ? progression : objectif.progression,
        // etapes: etapes || objectif.etapes,
        objectifEtapes: {
          create: etapes.map((etape: any) => ({
            titre: etape.titre,
            description: etape.description,
          })),
        },
      },
    });

    return NextResponse.json(updatedObjectif);
  } catch (error) {
    console.error("[OBJECTIF_PATCH]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

// DELETE /api/objectifs/[objectifId] - Supprimer un objectif
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ objectifId: string }> }
) {
  try {
    const token = req.cookies.get("candidat")?.value;
    const { objectifId } = await params;
    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "CANDIDAT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le candidat
    const candidat = await prisma.candidat.findFirst({
      where: {
        userId: decoded.userId,
      },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    const objectif = await prisma.objectifCarriere.findUnique({
      where: {
        id: objectifId,
        candidatId: candidat.id,
      },
    });

    if (!objectif) {
      return new NextResponse("Objectif non trouvé", { status: 404 });
    }

    await prisma.objectifCarriere.delete({
      where: { id: objectifId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[OBJECTIF_DELETE]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
