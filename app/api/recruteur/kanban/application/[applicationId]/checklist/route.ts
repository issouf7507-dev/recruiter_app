import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const body = await req.json();
    const id = (await params).applicationId;
    const { title, description } = body;

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

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session?.user.id },
      include: {
        recruteur: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const checklistItem = await prisma.checklistItem.create({
      data: {
        title,
        description,
        isCompleted: false,
        applicationId: id,
        createdById: recruteur?.id || collaborateur?.recruteur?.id || "",
        createdByType: "RECRUTEUR",
      },
    });

    return NextResponse.json({ success: true, data: checklistItem });
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'élément de la checklist:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de l'élément" },
      { status: 500 }
    );
  }
}
