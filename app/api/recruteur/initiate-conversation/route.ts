import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

// POST - Initier une conversation avec un candidat
export async function POST(request: NextRequest) {
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

    const { jobOfferId, candidatId, message } = await request.json();

    if (!jobOfferId || !candidatId || !message) {
      return NextResponse.json(
        { error: "jobOfferId, candidatId et message sont requis" },
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

    // Vérifier que le candidat existe
    const candidat = await prisma.candidat.findUnique({
      where: { id: candidatId },
    });

    if (!candidat) {
      console.log("Candidat non trouvé avec ID:", candidatId);
      return NextResponse.json(
        { error: "Candidat non trouvé" },
        { status: 404 }
      );
    }

    console.log("Candidat trouvé:", candidat.id, candidat.nom, candidat.prenom);

    // Vérifier que l'offre appartient au recruteur
    const jobOffer = await prisma.jobOffer.findFirst({
      where: {
        id: parseInt(jobOfferId),
        recruteurId: recruteur.id,
      },
    });

    if (!jobOffer) {
      return NextResponse.json(
        { error: "Offre non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    // Vérifier si une conversation existe déjà
    let conversation = await prisma.conversation.findUnique({
      where: {
        jobOfferId_candidatId_recruteurId: {
          jobOfferId: parseInt(jobOfferId),
          candidatId: candidatId,
          recruteurId: recruteur.id,
        },
      },
    });

    // Si la conversation n'existe pas, la créer
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          jobOfferId: parseInt(jobOfferId),
          candidatId: candidatId,
          recruteurId: recruteur.id,
          isActive: true,
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

    // Mettre à jour la date de modification de la conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Créer une notification pour le candidat
    await prisma.notification.create({
      data: {
        candidatId: candidat.id,
        titre: "Nouveau message",
        message: `Vous avez reçu un message de ${recruteur.name} concernant le poste de ${jobOffer.title}`,
        type: "message",
        offreId: jobOffer.id,
        lu: false,
      },
    });

    console.log("Conversation créée/retrouvée:", conversation.id);
    console.log("Message envoyé:", newMessage.id);

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      message: newMessage,
    });
  } catch (error) {
    console.error("Erreur lors de l'initiation de la conversation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
