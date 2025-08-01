import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

// GET - Récupérer les messages d'une conversation (côté candidat)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const token = request.cookies.get("candidat")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "CANDIDAT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { conversationId } = await params;

    // Récupérer le candidat
    const candidat = await prisma.candidat.findUnique({
      where: { userId: decoded.userId },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que la conversation appartient au candidat
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        candidatId: candidat.id,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer tous les messages de la conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      orderBy: { createdAt: "asc" },
    });

    // Marquer les messages du recruteur comme lus
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderType: "RECRUTEUR",
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Envoyer un nouveau message (côté candidat)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const token = request.cookies.get("candidat")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET_CANDIDAT!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "CANDIDAT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { conversationId } = await params;

    // Validation du corps de la requête
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Erreur de parsing JSON:", error);
      return NextResponse.json(
        { error: "Format JSON invalide" },
        { status: 400 }
      );
    }

    const { content } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        {
          error:
            "Le contenu du message est requis et doit être une chaîne non vide",
        },
        { status: 400 }
      );
    }

    // Récupérer le candidat
    const candidat = await prisma.candidat.findUnique({
      where: { userId: decoded.userId },
    });

    if (!candidat) {
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que la conversation appartient au candidat
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        candidatId: candidat.id,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvée" },
        { status: 404 }
      );
    }

    // Créer le nouveau message
    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: candidat.id,
        senderType: "CANDIDAT",
        content: content,
      },
    });

    // Mettre à jour la date de modification de la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
