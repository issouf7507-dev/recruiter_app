import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

// GET - Récupérer les messages d'une conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { conversationId } = await params;

    // Récupérer le recruteur
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: decoded.userId },
    });

    if (!recruteur) {
      return NextResponse.json(
        { error: "Recruteur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que la conversation appartient au recruteur
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        recruteurId: recruteur.id,
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

    // Marquer les messages du candidat comme lus
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderType: "CANDIDAT",
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

// POST - Envoyer un nouveau message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { conversationId } = await params;

    // Gérer FormData au lieu de JSON
    const formData = await request.formData();
    const content = formData.get("content") as string;

    if (!content) {
      return NextResponse.json(
        { error: "Le contenu du message est requis" },
        { status: 400 }
      );
    }

    // Récupérer le recruteur
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: decoded.userId },
    });

    if (!recruteur) {
      return NextResponse.json(
        { error: "Recruteur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que la conversation appartient au recruteur
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        recruteurId: recruteur.id,
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
        senderId: recruteur.id,
        senderType: "RECRUTEUR",
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
