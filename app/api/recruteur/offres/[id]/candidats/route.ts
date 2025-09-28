import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";

// GET - Récupérer les candidats qui ont postulé à une offre
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      return NextResponse.json(
        { error: "Recruteur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'offre appartient au recruteur
    const jobOffer = await prisma.jobOffer.findFirst({
      where: {
        id: parseInt(id),
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      },
    });

    if (!jobOffer) {
      return NextResponse.json(
        { error: "Offre non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    // Récupérer les candidats qui ont postulé à cette offre
    const applications = await prisma.application.findMany({
      where: {
        jobOfferId: parseInt(id),
      },
      include: {
        candidat: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            image: true,
            cv: true,
            letterm: true,
          },
        },
        column: {
          select: {
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            notes: true,
            checklist: true,
            files: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Formater les données pour l'interface
    const formattedCandidats = applications.map((app) => ({
      id: app.candidat.id,
      name: `${app.candidat.prenom || ""} ${app.candidat.nom || ""}`.trim(),
      email: app.candidat.email,
      avatar: app.candidat.image,
      cv: app.candidat.cv,
      letterm: app.candidat.letterm,
      applicationId: app.id,
      status: app.column.name,
      statusColor: app.column.color,
      rating: app.rating,
      message: app.message,
      appliedAt: app.createdAt,
      stats: {
        notes: app._count.notes,
        checklist: app._count.checklist,
        files: app._count.files,
      },
    }));

    return NextResponse.json(formattedCandidats);
  } catch (error) {
    console.error("Erreur lors de la récupération des candidats:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
