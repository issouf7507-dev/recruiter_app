import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// GET - Récupérer tous les attachments d'une application
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

    // Récupérer tous les fichiers attachés
    const attachments = await prisma.applicationFileCustom.findMany({
      where: {
        applicationId: applicationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: attachments,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des attachments:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Ajouter un attachment à une application
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const body = await req.json();
    const { fileName, fileUrl, fileType, fileSize, uploadedByType } = body;
    const { applicationId } = await params;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!fileName || !fileUrl || !fileType || !fileSize) {
      return NextResponse.json(
        { error: "Données du fichier incomplètes" },
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

    // Créer le nouvel attachment
    const newAttachment = await prisma.applicationFileCustom.create({
      data: {
        applicationId: applicationId,
        fileName: fileName,
        fileUrl: fileUrl,
        fileType: fileType,
        fileSize: parseInt(fileSize),
        uploadedById: authenticatedUser.recruteurId,
        uploadedByType: uploadedByType || "RECRUTEUR",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Fichier ajouté avec succès",
      data: newAttachment,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'attachment:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
