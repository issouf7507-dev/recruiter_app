import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";

// POST - Ajouter un fichier à une application
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const body = await req.json();
    const { fileName, fileUrl, fileType, fileSize, uploadedByType } = body;

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

    const newFile = await prisma.applicationFileCustom.create({
      data: {
        applicationId,
        fileName,
        fileUrl,
        fileType,
        fileSize,
        uploadedById: recruteur?.id || collaborateur?.recruteur?.id || "",
        uploadedByType: uploadedByType || "RECRUTEUR",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newFile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'ajout du fichier:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
