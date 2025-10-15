import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { auth } from "@/lib/auth";

// GET - Récupérer les conversations d'un recruteur
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session?.user.id },
    });

    // Récupérer toutes les conversations du recruteur avec les candidats qui ont postulé
    const conversations = await prisma.conversation.findMany({
      where: {
        recruteurId: recruteur?.id,
        isActive: true,
      },
      include: {
        candidat: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            image: true,
          },
        },
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: { isRead: false, senderType: "CANDIDAT" },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Formater les données pour l'interface
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      candidat: {
        id: conv.candidat.id,
        name: `${conv.candidat.prenom || ""} ${conv.candidat.nom || ""}`.trim(),
        email: conv.candidat.email,
        avatar: conv.candidat.image,
      },
      jobOffer: {
        id: conv.jobOffer.id,
        title: conv.jobOffer.title,
        company: conv.jobOffer.company,
      },
      lastMessage: conv.messages[0]
        ? {
            content: conv.messages[0].content,
            timestamp: conv.messages[0].createdAt,
            sender: conv.messages[0].senderType,
          }
        : null,
      unreadCount: conv._count.messages,
      updatedAt: conv.updatedAt,
    }));

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle conversation
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session?.user.id },
    });

    const { jobOfferId, candidatId, message } = await request.json();

    if (!jobOfferId || !candidatId || !message) {
      return NextResponse.json(
        { error: "jobOfferId, candidatId et message sont requis" },
        { status: 400 }
      );
    }

    // Récupérer le recruteur

    if (!recruteur) {
      return NextResponse.json(
        { error: "Recruteur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le candidat a postulé à cette offre
    const application = await prisma.application.findFirst({
      where: {
        jobOfferId: jobOfferId as string,
        candidatId: candidatId,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Le candidat n'a pas postulé à cette offre" },
        { status: 400 }
      );
    }

    // Vérifier que l'offre appartient au recruteur
    const jobOffer = await prisma.jobOffer.findFirst({
      where: {
        id: jobOfferId as string,
        recruteurId: recruteur.id,
      },
    });

    if (!jobOffer) {
      return NextResponse.json(
        { error: "Offre non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    // Créer ou récupérer la conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        jobOfferId_candidatId_recruteurId: {
          jobOfferId: jobOfferId as string,
          candidatId: candidatId,
          recruteurId: recruteur.id,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          jobOfferId: jobOfferId as string,
          candidatId: candidatId,
          recruteurId: recruteur.id,
        },
      });
    }

    // Créer le premier message
    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: recruteur.id,
        senderType: "RECRUTEUR",
        content: message,
      },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      message: newMessage,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la conversation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
