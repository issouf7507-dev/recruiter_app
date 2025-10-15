import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
// import { getAuthenticatedUser } from "@/lib/auth-utils";

interface DocumentData {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

// POST - Ajouter un candidat manuellement à une application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cv, cvUrl, applicationId, documents } = body;

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

    // Créer le candidat avec ses documents dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      const newCandidate = await tx.candidatCustom.create({
        data: {
          userId: recruteur?.userId || collaborateur?.userId || "",
          cv: cv || "",
          cvUrl: cvUrl || "",
          applicationId,
        },
      });

      // Créer les documents associés si fournis
      if (documents && Array.isArray(documents) && documents.length > 0) {
        await tx.candidatDocument.createMany({
          data: documents.map((doc: DocumentData) => ({
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            candidatId: newCandidate.id,
          })),
        });
      }

      // Récupérer le candidat avec ses documents
      return await tx.candidatCustom.findUnique({
        where: { id: newCandidate.id },
        include: { documents: true },
      });
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'ajout du candidat:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
