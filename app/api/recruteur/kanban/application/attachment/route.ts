import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

    // Accepter les données JSON au lieu de FormData
    const body = await req.json();
    const {
      fileName,
      fileUrl,
      fileType,
      fileSize,
      uploadedById,
      uploadedByType,
      applicationId,
    } = body;

    // Validation des données requises
    if (
      !fileName ||
      !fileUrl ||
      !fileType ||
      !fileSize ||
      !uploadedById ||
      !uploadedByType ||
      !applicationId
    ) {
      return NextResponse.json(
        {
          error:
            "Toutes les données sont requises (fileName, fileUrl, fileType, fileSize, uploadedById, uploadedByType, applicationId)",
        },
        { status: 400 }
      );
    }

    // Vérifier que l'application existe et appartient au recruteur
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

    // Validation de la taille (si fournie)
    if (fileSize && fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. Taille maximum: 10MB" },
        { status: 400 }
      );
    }

    // Sauvegarder les informations du fichier en base
    const savedFile = await prisma.applicationFile.create({
      data: {
        fileName,
        fileUrl,
        fileType,
        fileSize: fileSize || 0,
        uploadedById: recruteur?.id || collaborateur?.recruteur?.id || "",
        uploadedByType,
        applicationId,
      },
    });

    return NextResponse.json(
      { success: true, data: savedFile },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du fichier:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du fichier" },
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
        { error: "applicationId requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'application existe et que le recruteur y a accès
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
        },
      },
      include: {
        files: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: application.files,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des fichiers" },
      { status: 500 }
    );
  }
}
