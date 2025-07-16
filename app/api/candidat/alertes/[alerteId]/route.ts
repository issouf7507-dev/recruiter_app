import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

// GET /api/alertes/[alerteId] - Récupérer une alerte spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ alerteId: string }> }
) {
  try {
    const token = req.cookies.get("candidat")?.value;
    const { alerteId } = await params;
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

    const alerte = await prisma.alerteEmploi.findUnique({
      where: {
        id: alerteId,
        candidatId: candidat.id,
      },
      // include: {÷}
    });

    if (!alerte) {
      return new NextResponse("Alerte non trouvée", { status: 404 });
    }

    return NextResponse.json(alerte);
  } catch (error) {
    console.error("[ALERTE_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

// PATCH /api/alertes/[alerteId] - Modifier une alerte
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ alerteId: string }> }
) {
  try {
    const token = req.cookies.get("candidat")?.value;
    const { alerteId } = await params;
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
    const {
      titre,
      // motsCles,
      localisation,
      typeContrat,
      salaireMin,
      salaireMax,
      experience,
      frequence,
      active,
    } = body;

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

    const alerte = await prisma.alerteEmploi.findUnique({
      where: {
        id: alerteId,
        candidatId: candidat.id,
      },
    });

    if (!alerte) {
      return new NextResponse("Alerte non trouvée", { status: 404 });
    }

    const updatedAlerte = await prisma.alerteEmploi.update({
      where: { id: alerteId },
      data: {
        titre: titre || alerte.titre,
        // motsCles: motsCles || alerte.motsCles,
        localisation: localisation || alerte.localisation,
        typeContrat: typeContrat || alerte.typeContrat,
        salaireMin: salaireMin !== undefined ? salaireMin : alerte.salaireMin,
        salaireMax: salaireMax !== undefined ? salaireMax : alerte.salaireMax,
        experience: experience || alerte.experience,
        frequence: frequence || alerte.frequence,
        active: active !== undefined ? active : alerte.active,
        derniereMiseAJour: new Date(),
      },
    });

    return NextResponse.json(updatedAlerte);
  } catch (error) {
    console.error("[ALERTE_PATCH]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

// DELETE /api/alertes/[alerteId] - Supprimer une alerte
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ alerteId: string }> }
) {
  try {
    const token = req.cookies.get("candidat")?.value;
    const { alerteId } = await params;
    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    const candidat = await prisma.candidat.findFirst({
      where: { userId: decoded.userId },
    });

    if (!candidat) {
      return new NextResponse("Candidat non trouvé", { status: 404 });
    }

    const alerte = await prisma.alerteEmploi.findUnique({
      where: {
        id: alerteId,
        candidatId: candidat.id,
      },
    });

    if (!alerte) {
      return new NextResponse("Alerte non trouvée", { status: 404 });
    }

    await prisma.alerteEmploi.delete({
      where: { id: alerteId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ALERTE_DELETE]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
