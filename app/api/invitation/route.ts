import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

import { verify } from "jsonwebtoken";
import { MailService } from "@/app/services/mail.service";

// Route pour créer une nouvelle invitation
export async function POST(req: NextRequest) {
  try {
    const tokenv = req.cookies.get("token")?.value;

    if (!tokenv) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const decoded = verify(tokenv, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email et rôle sont requis" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
      },
      include: {
        recruteur: true,
      },
    });

    // Vérifier si l'utilisateur est un recruteur
    const recruteur = await prisma.recruteur.findFirst({
      where: {
        user: {
          email: user?.recruteur?.email,
        },
      },
    });

    if (!recruteur) {
      return NextResponse.json(
        {
          error: "Vous devez être un recruteur pour inviter des collaborateurs",
        },
        { status: 403 }
      );
    }

    // Vérifier si une invitation existe déjà pour cet email
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        recruteurId: recruteur.id,
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
        recruteurId: recruteur.id,
      },
    });

    // Envoyer l'email d'invitation
    const inviteUrl = `http://localhost:3000/dashboard-recruteurs/invitations/accept?token=${token}`;

    await MailService.sendEmail(
      email,
      "Invitation à rejoindre l'équipe",
      `
     <h1>Vous avez été invité à rejoindre l'équipe</h1>
         <p>Vous avez été invité à rejoindre l'équipe de ${
           recruteur.entreprise || recruteur.name
         }.</p>
        <p>Cliquez sur le lien suivant pour accepter l'invitation :</p>
        <a href="${`http://localhost:3000/dashboard-recruteurs/invitations/accept?token=${token}`}">${`http://localhost:3000/dashboard-recruteurs/invitations/accept?token=${token}`}</a>
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
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
      },
      include: {
        recruteur: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être un recruteur pour voir les invitations" },
        { status: 403 }
      );
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        recruteurId: user.recruteur?.id,
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
