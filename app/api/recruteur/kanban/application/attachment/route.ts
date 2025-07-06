import { NextResponse, NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

// Configuration des types de fichiers autorisés
const ALLOWED_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const applicationId = formData.get("applicationId") as string;
    const uploadedById = formData.get("uploadedById") as string;
    const uploadedByType = formData.get("uploadedByType") as string;

    // Validation des données requises
    if (!file || !applicationId || !uploadedById || !uploadedByType) {
      return NextResponse.json(
        {
          error:
            "Fichier, applicationId, uploadedById et uploadedByType requis",
        },
        { status: 400 }
      );
    }

    // Vérifier que l'application existe et appartient au recruteur
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          recruteurId: authenticatedUser.recruteurId,
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application non trouvée" },
        { status: 404 }
      );
    }

    // Validation du type de fichier
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(fileExtension)) {
      return NextResponse.json(
        {
          error:
            "Type de fichier non autorisé. Utilisez PDF, DOC, DOCX, TXT, images, Excel ou PowerPoint.",
        },
        { status: 400 }
      );
    }

    // Validation de la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. Taille maximum: 10MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Créer un nom de fichier unique
    const timestamp = Date.now();
    const filename = `app_${applicationId}_${timestamp}${fileExtension}`;

    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = join(process.cwd(), "public", "uploads", "applications");
    try {
      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, filename), buffer);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du fichier:", error);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde du fichier" },
        { status: 500 }
      );
    }

    const fileUrl = `/uploads/applications/${filename}`;

    // Sauvegarder les informations du fichier en base
    const savedFile = await prisma.applicationFile.create({
      data: {
        fileName: file.name,
        fileUrl,
        fileType: fileExtension,
        fileSize: file.size,
        uploadedById,
        uploadedByType,
        applicationId,
      },
    });

    return NextResponse.json(
      { success: true, data: savedFile },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
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
          recruteurId: authenticatedUser.recruteurId,
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
