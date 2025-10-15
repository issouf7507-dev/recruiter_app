import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const id = (await params).id;
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

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    const candidatures = await prisma.application.findMany({
      where: {
        jobOfferId: String(id),
      },
      include: {
        candidat: true,
        column: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: candidatures,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur lors de la récupération des candidatures:", err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des candidatures" },
      { status: 500 }
    );
  }
}
