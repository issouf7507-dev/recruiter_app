import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { randomBytes } from "crypto";
import { MailService } from "@/app/services/mail.service";

// Route pour renvoyer une invitation spécifique
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session.user.id },
    });

    if (!recruteur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const invitationId = searchParams.get("id");

    if (!invitationId) {
      return NextResponse.json(
        { error: "ID d'invitation requis" },
        { status: 400 }
      );
    }

    // Récupérer l'invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        recruteurId: recruteur.id,
        accepted: false,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation non trouvée" },
        { status: 404 }
      );
    }

    // Générer un nouveau token et prolonger l'expiration
    const newToken = randomBytes(32).toString("hex");
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7); // Expire dans 7 jours

    // Mettre à jour l'invitation
    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
      },
    });

    // Envoyer le nouvel email d'invitation
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard-recruteurs/invitations/accept?token=${newToken}`;

    await MailService.sendEmail(
      invitation.email,
      "🔄 Renouvellement d'invitation - Rejoignez notre équipe !",
      `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Renouvellement d'invitation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8fafc;">
        
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">🔄</div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Invitation renouvelée !</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            
            <p style="font-size: 18px; color: #4a5568; margin-bottom: 30px; text-align: center;">
              Bonjour ! 👋<br>
              Votre invitation précédente a été renouvelée. Vous avez maintenant 7 jours supplémentaires pour rejoindre notre équipe de recrutement.
            </p>
            
            <!-- Highlight Box -->
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 22px;">🚀 Prêt(e) à nous rejoindre ?</h2>
              <p style="margin: 0; font-size: 16px; opacity: 0.9;">Cliquez sur le bouton ci-dessous pour accepter votre invitation</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                ✨ Accepter l'invitation
              </a>
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
          </div>
          
        </div>
        
      </body>
      </html>
      `
    );

    return NextResponse.json({
      message: "Invitation renvoyée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors du renvoi de l'invitation:", error);
    return NextResponse.json(
      { error: "Erreur lors du renvoi de l'invitation" },
      { status: 500 }
    );
  }
}

