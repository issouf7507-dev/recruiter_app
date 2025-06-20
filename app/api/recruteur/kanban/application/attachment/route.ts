import { NextResponse, NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Récupérer le token depuis les cookies
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier le token
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        type: string;
      };
    } catch (error) {
      console.error("Erreur de vérification du token:", error);
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    if (decoded.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const applicationId = formData.get("applicationId") as string;
    const uploadedById = formData.get("uploadedById") as string;
    const uploadedByType = formData.get("uploadedByType") as string;

    if (!file || !applicationId || !uploadedById || !uploadedByType) {
      return NextResponse.json(
        {
          error:
            "Fichier, applicationId, uploadedById et uploadedByType requis",
        },
        { status: 400 }
      );
    }

    // Vérifier que l'application existe
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { jobOffer: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = [
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
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        {
          error:
            "Type de fichier non autorisé. Utilisez PDF, DOC, DOCX, TXT, images, Excel ou PowerPoint.",
        },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
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
      // Sauvegarder le fichier
      await writeFile(join(uploadDir, filename), buffer);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du fichier:", error);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde du fichier" },
        { status: 500 }
      );
    }

    // Retourner l'URL du fichier
    const fileUrl = `/uploads/applications/${filename}`;

    // Sauvegarder les informations du fichier dans la base de données
    const applicationFile = await prisma.applicationFile.create({
      data: {
        applicationId: applicationId,
        fileName: file.name,
        fileUrl: fileUrl,
        fileType: file.type,
        fileSize: file.size,
        uploadedById: uploadedById,
        uploadedByType: uploadedByType,
      },
    });

    return NextResponse.json({
      success: true,
      data: applicationFile,
      message: "Fichier uploadé avec succès",
    });
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
    // Récupérer le token depuis les cookies
    const token = req.cookies.get("recruteur")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier le token
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET_RECRUTEUR!) as {
        userId: string;
        type: string;
      };
    } catch (error) {
      console.error("Erreur de vérification du token:", error);
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    if (decoded.type !== "RECRUTEUR") {
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
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobOffer: true,
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
