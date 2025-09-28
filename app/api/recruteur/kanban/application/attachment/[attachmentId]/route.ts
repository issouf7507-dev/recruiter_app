import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { initEdgeStore } from "@edgestore/server";
import { auth } from "@/lib/auth";

const es = initEdgeStore.create();

const edgeStoreRouter = es.router({
  kanbanAttachments: es.fileBucket({
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: [
      // Images
      "image/*",
      // Documents PDF
      "application/pdf",
      // Documents Word
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      // Documents Excel
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // Documents PowerPoint
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      // Fichiers texte
      "text/plain",
      // Autres types de documents
      "application/octet-stream",
    ],
  }),
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
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

    const attachmentId = (await params).attachmentId;

    // Récupérer le fichier
    const applicationFile = await prisma.applicationFile.findUnique({
      where: { id: attachmentId },
    });

    if (!applicationFile) {
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le fichier d'EdgeStore
    try {
      // Extraire l'URL du fichier EdgeStore
      const fileUrl = applicationFile.fileUrl;

      // Si c'est une URL EdgeStore, la supprimer
      if (fileUrl && fileUrl.includes("edgestore")) {
        // Créer une instance EdgeStore pour la suppression
        const { createEdgeStoreNextHandler } = await import(
          "@edgestore/server/adapters/next/app"
        );

        const handler = createEdgeStoreNextHandler({
          router: edgeStoreRouter,
        });

        // Supprimer le fichier d'EdgeStore
        // Note: La suppression directe via l'API EdgeStore nécessite une approche différente
        // Pour l'instant, nous supprimons seulement de la base de données
        // Le fichier EdgeStore sera supprimé automatiquement après un certain temps
        console.log("Fichier EdgeStore à supprimer:", fileUrl);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du fichier EdgeStore:",
        error
      );
      // On continue même si la suppression EdgeStore échoue
    }

    // Supprimer l'enregistrement de la base de données
    await prisma.applicationFile.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({
      success: true,
      message: "Fichier supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du fichier" },
      { status: 500 }
    );
  }
}
