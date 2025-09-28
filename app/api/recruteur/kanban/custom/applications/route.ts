import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";

// POST - Créer une nouvelle application (offre d'emploi)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, company, location, columnId } = body;

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

    // Vérifier que la colonne appartient au recruteur
    const column = await prisma.kanbanColumnCustom.findFirst({
      where: {
        id: columnId,
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      },
    });

    if (!column) {
      return NextResponse.json(
        { error: "Colonne non trouvée" },
        { status: 404 }
      );
    }

    const newApplication = await prisma.applicationCustom.create({
      data: {
        title,
        description,
        company: company || "Non spécifié",
        location: location || "Non spécifié",
        kanbanColumnCustomid: columnId,
      },
      include: {
        candidatCustom: true,
        notes: true,
        checklist: true,
        files: true,
        collaborateurs: {
          include: {
            collaborateur: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newApplication,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de l'application:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Déplacer une application vers une autre colonne
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId, newColumnId } = body;

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
    // Vérifier que l'application existe et appartient au recruteur
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

    // Vérifier que la nouvelle colonne appartient au recruteur
    const newColumn = await prisma.kanbanColumnCustom.findFirst({
      where: {
        id: newColumnId,
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      },
    });

    if (!newColumn) {
      return NextResponse.json(
        { error: "Nouvelle colonne non trouvée" },
        { status: 404 }
      );
    }

    // Déplacer l'application
    const updatedApplication = await prisma.applicationCustom.update({
      where: { id: applicationId },
      data: { kanbanColumnCustomid: newColumnId },
      include: {
        candidatCustom: true,
        notes: true,
        checklist: true,
        files: true,
        collaborateurs: {
          include: {
            collaborateur: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedApplication,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du déplacement de l'application:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
