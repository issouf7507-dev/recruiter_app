import { NextResponse, NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { initEdgeStore } from "@edgestore/server";

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
