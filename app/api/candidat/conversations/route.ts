import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

// GET - Récupérer les conversations d'un candidat
export async function GET(request: NextRequest) {
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

    // Récupérer le candidat
    const candidat = await prisma.candidat.findUnique({
      where: { userId: decoded.userId },
    });

    if (!candidat) {
      console.log("Candidat non trouvé pour userId:", decoded.userId);
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    console.log("Candidat trouvé:", candidat.id);

    // Récupérer toutes les conversations du candidat
    const conversations = await prisma.conversation.findMany({
      where: {
        candidatId: candidat.id,
        isActive: true,
      },
      include: {
        recruteur: {
          select: {
            id: true,
            name: true,
            entreprise: true,
            logo: true,
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
              where: { isRead: false, senderType: "RECRUTEUR" },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Formater les données pour l'interface
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      recruteur: {
        id: conv.recruteur.id,
        name: conv.recruteur.name,
        entreprise: conv.recruteur.entreprise,
        logo: conv.recruteur.logo,
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

    console.log("Conversations trouvées:", formattedConversations.length);
    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
