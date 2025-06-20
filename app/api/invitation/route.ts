import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

import { MailService } from "@/app/services/mail.service";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { verify } from "jsonwebtoken";

// Route pour créer une nouvelle invitation
export async function POST(req: NextRequest) {
  try {
    const tokenv = req.cookies.get("token")?.value;

    if (!tokenv) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const decoded = verify(tokenv, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        recruteur: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const authenticatedUser = user.recruteur;

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: "Recruteur non trouvé" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email et rôle sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si une invitation existe déjà pour cet email
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        recruteurId: authenticatedUser.id,
        accepted: false,
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Une invitation est déjà en attente pour cet email" },
        { status: 400 }
      );
    }

    // Générer un token unique
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

    // Créer l'invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        expiresAt,
        recruteurId: authenticatedUser.id,
      },
    });

    // Envoyer l'email d'invitation
    const inviteUrl = `http://localhost:3000/dashboard-recruteurs/invitations/accept?token=${token}`;

    await MailService.sendEmail(
      email,
      "Invitation à rejoindre l'équipe",
      `
     <h1>Vous avez été invité à rejoindre l'équipe</h1>
         <p>Vous avez été invité à rejoindre l'équipe.</p>
        <p>Cliquez sur le lien suivant pour accepter l'invitation :</p>
        <a href="${inviteUrl}">${inviteUrl}</a>
         <p>Ce lien expirera dans 7 jours.</p>`
    );

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Erreur lors de la création de l'invitation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'invitation" },
      { status: 500 }
    );
  }
}

// Route pour récupérer les invitations d'un recruteur
export async function GET(req: NextRequest) {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);

    if (!authenticatedUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        recruteurId: authenticatedUser.recruteurId,
      },
      include: {
        collaborateur: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Erreur lors de la récupération des invitations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des invitations" },
      { status: 500 }
    );
  }
}
