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
        role: role == "MANAGER" ? "MANAGER" : "ADMIN",
        token,
        expiresAt,
        recruteurId: authenticatedUser.id,
      },
    });

    // Envoyer l'email d'invitation
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept?token=${token}`;

    await MailService.sendEmail(
      email,
      "🎉 Invitation à rejoindre notre équipe de recrutement !",
      `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation à rejoindre l'équipe</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc;">
        
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🎯</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Rejoignez notre équipe de recrutement !</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            
            <p style="font-size: 18px; color: #4a5568; margin-bottom: 30px; text-align: center;">
              Bonjour ! 👋<br>
              Vous avez été sélectionné(e) pour rejoindre notre équipe de recrutement et contribuer à notre mission de connecter les meilleurs talents avec les meilleures opportunités.
            </p>
            
            <!-- Highlight Box -->
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 22px;">🚀 Prêt(e) à commencer ?</h2>
              <p style="margin: 0; font-size: 16px; opacity: 0.9;">Cliquez sur le bouton ci-dessous pour accepter votre invitation et créer votre compte</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                ✨ Accepter l'invitation
              </a>
            </div>
            
            <!-- Features -->
            <div style="display: flex; justify-content: space-around; margin: 30px 0; flex-wrap: wrap;">
              <div style="text-align: center; flex: 1; min-width: 120px; margin: 10px;">
                <div style="font-size: 32px; margin-bottom: 10px;">👥</div>
                <div style="font-size: 14px; color: #666; font-weight: 500;">Équipe collaborative</div>
              </div>
              <div style="text-align: center; flex: 1; min-width: 120px; margin: 10px;">
                <div style="font-size: 32px; margin-bottom: 10px;">📊</div>
                <div style="font-size: 14px; color: #666; font-weight: 500;">Analytics avancés</div>
              </div>
              <div style="text-align: center; flex: 1; min-width: 120px; margin: 10px;">
                <div style="font-size: 32px; margin-bottom: 10px;">⚡</div>
                <div style="font-size: 14px; color: #666; font-weight: 500;">Processus optimisé</div>
              </div>
            </div>
            
            <!-- Expiry Warning -->
            <div style="background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
              <span style="color: #e53e3e; font-size: 20px; margin-right: 8px;">⏰</span>
              <strong>Attention :</strong> Ce lien d'invitation expirera dans 7 jours
            </div>
            
            <!-- Fallback Link -->
            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
              <a href="${inviteUrl}" style="color: #667eea; word-break: break-all;">${inviteUrl}</a>
            </p>
            
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 5px 0; color: #718096; font-size: 14px;"><strong>L'équipe Recruter</strong></p>
            <p style="margin: 5px 0; color: #718096; font-size: 14px;">Connecter les talents avec les opportunités</p>
            <p style="font-size: 12px; margin-top: 20px; color: #718096;">
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
            </p>
          </div>
          
        </div>
        
      </body>
      </html>
      `
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
