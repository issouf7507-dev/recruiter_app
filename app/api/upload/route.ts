import { NextResponse, NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { verify } from "jsonwebtoken";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Récupérer le token depuis les cookies

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (!session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "cv" ou "letterm"

    if (!file || !type) {
      return NextResponse.json(
        { error: "Fichier et type requis" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé. Utilisez PDF, DOC ou DOCX." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Créer un nom de fichier unique
    const timestamp = Date.now();
    const filename = `${session.user.id}_${type}_${timestamp}${fileExtension}`;

    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = join(process.cwd(), "public", "uploads");
    try {
      // Créer le dossier uploads s'il n'existe pas
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
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    );
  }
}
