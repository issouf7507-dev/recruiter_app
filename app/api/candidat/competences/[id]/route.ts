import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

// DELETE /api/candidat/experiences/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("candidat")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "CANDIDAT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const experience = await prisma.competence.findUnique({
      where: {
        id: id,
      },
    });

    if (!experience) {
      return NextResponse.json(
        { error: "Expérience non trouvée" },
        { status: 404 }
      );
    }

    // if (experience.candidatId !== session.user.id) {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    // }

    await prisma.competence.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'expérience:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'expérience" },
      { status: 500 }
    );
  }
}

// PUT /api/candidat/competences/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.cookies.get("candidat")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (!decoded) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const candidat = await prisma.candidat.findUnique({
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

    const competence = await prisma.competence.findUnique({
      where: {
        id: id,
      },
    });

    if (!competence) {
      return NextResponse.json(
        { error: "Compétence non trouvée" },
        { status: 404 }
      );
    }

    if (competence.candidatId !== candidat.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { categorie, nom, niveau } = body;

    const updatedCompetence = await prisma.competence.update({
      where: {
        id: id,
      },
      data: {
        categorie,
        nom,
        niveau,
      },
    });

    return NextResponse.json({ success: true, data: updatedCompetence });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la compétence:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la compétence" },
      { status: 500 }
    );
  }
}
