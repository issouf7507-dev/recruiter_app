import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const authenticatedUser = await getAuthenticatedUser(req);
    const { id } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session?.user.id },
    });
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session?.user.id },
      include: {
        recruteur: true,
      },
    });
    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const candidates = await prisma.candidatCustom.findMany({
      where: {
        userId: recruteur?.userId || collaborateur?.userId || "",
        applicationId: id,
      },
    });

    return NextResponse.json({
      success: true,
      candidates: candidates,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la récupération des candidats",
        error: error,
      },
      { status: 500 }
    );
  }
}
