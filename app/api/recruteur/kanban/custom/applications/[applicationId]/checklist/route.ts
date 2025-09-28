import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Ajouter un élément à la checklist
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const body = await req.json();
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

    // Vérifier que l'application appartient au recruteur
    const application = await prisma.applicationCustom.findFirst({
      where: {
        id: applicationId,
        // TODO: Ajouter la vérification du recruteur via les relations
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application non trouvée" },
        { status: 404 }
      );
    }

    const newChecklistItem = await prisma.checklistItemCustom.create({
      data: {
        applicationId,
        title,
        description: description || "",
        createdById: recruteur?.id || collaborateur?.recruteur?.id || "",
        createdByType: "RECRUTEUR",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newChecklistItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'élément checklist:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// GET - Récupérer tous les éléments de la checklist
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;

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

    const checklistItems = await prisma.checklistItemCustom.findMany({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        data: checklistItems,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération de la checklist:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
