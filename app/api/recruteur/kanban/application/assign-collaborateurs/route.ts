import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
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
    const { applicationId, collaborateurIds } = await req.json();

    if (!applicationId || !Array.isArray(collaborateurIds)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    // console.log("applicationId", applicationId);
    // console.log("collaborateurIds", collaborateurIds);

    // Vérifier que l'application appartient au recruteur
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que tous les collaborateurs appartiennent au recruteur
    const collaborateurs = await prisma.collaborateur.findMany({
      where: {
        id: { in: collaborateurIds },
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      },
    });

    if (collaborateurs.length !== collaborateurIds.length) {
      return NextResponse.json(
        { error: "Certains collaborateurs n'appartiennent pas à votre équipe" },
        { status: 400 }
      );
    }

    // Supprimer toutes les affectations existantes pour cette application
    await prisma.applicationCollaborateur.deleteMany({
      where: {
        applicationId,
      },
    });

    // Créer les nouvelles affectations
    if (collaborateurIds.length > 0) {
      const assignments = collaborateurIds.map((collaborateurId: string) => ({
        applicationId,
        collaborateurId,
        assignedBy: recruteur?.id || collaborateur?.recruteur?.id || "",
      }));

      //   console.log("assignments", assignments);

      await prisma.applicationCollaborateur.createMany({
        data: assignments,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Collaborateurs affectés avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de l'affectation des collaborateurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'affectation des collaborateurs" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
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

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json(
        { error: "ID de l'application requis" },
        { status: 400 }
      );
    }

    // Récupérer les collaborateurs affectés à cette application
    const assignments = await prisma.applicationCollaborateur.findMany({
      where: {
        applicationId,
        application: {
          jobOffer: {
            recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
          },
        },
      },
      include: {
        collaborateur: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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
    console.error("Erreur lors de la récupération des affectations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des affectations" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
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

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json(
        { error: "ID de l'affectation requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'affectation appartient au recruteur
    const assignment = await prisma.applicationCollaborateur.findFirst({
      where: {
        id: assignmentId,
        application: {
          jobOffer: {
            recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Affectation non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer l'affectation
    await prisma.applicationCollaborateur.delete({
      where: {
        id: assignmentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Collaborateur désaffecté avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la désaffectation du collaborateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la désaffectation du collaborateur" },
      { status: 500 }
    );
  }
}
