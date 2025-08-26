import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// GET - Récupérer une application spécifique avec tous ses détails
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const application = await prisma.applicationCustom.findFirst({
      where: {
        id: applicationId,
        // TODO: Ajouter la vérification du recruteur via les relations
      },
      include: {
        candidatCustom: true,
        notes: {
          orderBy: { createdAt: "desc" },
        },
        checklist: {
          orderBy: { createdAt: "desc" },
        },
        files: {
          orderBy: { createdAt: "desc" },
        },
        collaborateurs: {
          include: {
            collaborateur: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: application,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération de l'application:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une application (notes, échéance, etc.)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const body = await req.json();
    const { notes, duedate } = body;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
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

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (notes !== undefined) {
      // Créer une nouvelle note
      await prisma.applicationNoteCustom.create({
        data: {
          applicationId,
          content: notes,
          authorId: authenticatedUser.userId,
          authorType: authenticatedUser.type,
          authorName: authenticatedUser.name || "Utilisateur",
        },
      });
    }

    if (duedate !== undefined) {
      updateData.duedate = duedate ? new Date(duedate) : null;
    }

    // Mettre à jour l'application si nécessaire
    if (Object.keys(updateData).length > 0) {
      await prisma.applicationCustom.update({
        where: { id: applicationId },
        data: updateData,
      });
    }

    // Récupérer l'application mise à jour
    const updatedApplication = await prisma.applicationCustom.findUnique({
      where: { id: applicationId },
      include: {
        candidatCustom: true,
        notes: {
          orderBy: { createdAt: "desc" },
        },
        checklist: {
          orderBy: { createdAt: "desc" },
        },
        files: {
          orderBy: { createdAt: "desc" },
        },
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
    console.error("Erreur lors de la mise à jour de l'application:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
