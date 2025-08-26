import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// POST - Affecter des collaborateurs à une application
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const { applicationId } = await params;
  try {
    const body = await req.json();
    const { collaborateurIds } = body;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!Array.isArray(collaborateurIds) || collaborateurIds.length === 0) {
      return NextResponse.json(
        { error: "Liste de collaborateurs requise" },
        { status: 400 }
      );
    }

    // Vérifier que l'application existe et appartient au recruteur
    const existingApplication = await prisma.applicationCustom.findFirst({
      where: {
        id: applicationId,
        // TODO: Ajouter la vérification du recruteur via les relations
      },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: "Application non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que tous les collaborateurs appartiennent au recruteur
    const collaborateurs = await prisma.collaborateurCustom.findMany({
      where: {
        id: { in: collaborateurIds },
        recruteurId: authenticatedUser.recruteurId,
      },
    });

    if (collaborateurs.length !== collaborateurIds.length) {
      return NextResponse.json(
        { error: "Certains collaborateurs ne sont pas accessibles" },
        { status: 400 }
      );
    }

    // Supprimer les affectations existantes
    await prisma.applicationCollaborateurCustom.deleteMany({
      where: {
        applicationId: applicationId,
      },
    });

    // Créer les nouvelles affectations
    const newAssignments = await Promise.all(
      collaborateurIds.map((collaborateurId: string) =>
        prisma.applicationCollaborateurCustom.create({
          data: {
            applicationId: applicationId,
            collaborateurId: collaborateurId,
            assignedBy: authenticatedUser.recruteurId,
          },
          include: {
            collaborateur: true,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Collaborateurs affectés avec succès",
      data: newAssignments,
    });
  } catch (error) {
    console.error("Erreur lors de l'affectation des collaborateurs:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// GET - Récupérer les collaborateurs affectés à une application
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

    // Récupérer les affectations de collaborateurs
    const assignments = await prisma.applicationCollaborateurCustom.findMany({
      where: {
        applicationId: applicationId,
      },
      include: {
        collaborateur: true,
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des collaborateurs:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Retirer un collaborateur d'une application
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const collaborateurId = searchParams.get("collaborateurId");
    const { applicationId } = await params;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!collaborateurId) {
      return NextResponse.json(
        { error: "ID du collaborateur requis" },
        { status: 400 }
      );
    }

    // Supprimer l'affectation
    const deletedAssignment =
      await prisma.applicationCollaborateurCustom.deleteMany({
        where: {
          applicationId: applicationId,
          collaborateurId: collaborateurId,
        },
      });

    if (deletedAssignment.count === 0) {
      return NextResponse.json(
        { error: "Affectation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Collaborateur retiré avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'affectation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
