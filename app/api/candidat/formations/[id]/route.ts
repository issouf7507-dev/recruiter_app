import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

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

    const formation = await prisma.formation.findUnique({
      where: {
        id: id,
      },
    });

    if (!formation) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 }
      );
    }

    if (formation.candidatId !== candidat.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { diplome, etablissement, domaine, dateDebut, dateFin, description } =
      body;

    const updatedFormation = await prisma.formation.update({
      where: {
        id: id,
      },
      data: {
        diplome,
        etablissement,
        domaine,
        dateDebut: new Date(dateDebut),
        dateFin: dateFin ? new Date(dateFin) : null,
        description,
      },
    });

    return NextResponse.json({ success: true, data: updatedFormation });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la formation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la formation" },
      { status: 500 }
    );
  }
}

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

    const experience = await prisma.formation.findUnique({
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

    await prisma.formation.delete({
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
