import { NextResponse, NextRequest } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { attachmentId: string } }
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

    const { attachmentId } = params;

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

    // Supprimer le fichier physique
    try {
      const filePath = join(process.cwd(), "public", applicationFile.fileUrl);
      await unlink(filePath);
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du fichier physique:",
        error
      );
      // On continue même si le fichier physique n'existe pas
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
