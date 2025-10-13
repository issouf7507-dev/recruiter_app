import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, nom, prenom, password } = body;

    if (!token || !nom || !prenom || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'invitation existe et n'est pas expirée
    const invitation = await prisma.invitation.findFirst({
      where: {
        token,
        accepted: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        recruteur: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation invalide ou expirée" },
        { status: 400 }
      );
    }

    // Vérifier si un utilisateur existe déjà avec cet email
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email" },
        { status: 400 }
      );
    }

    // Utiliser Better Auth pour créer l'utilisateur
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: invitation.email,
        password: password,
        name: `${prenom} ${nom}`,
      },
    });

    if (!signUpResult) {
      return NextResponse.json(
        {
          error: signUpResult || "Erreur lors de la création du compte",
        },
        { status: 500 }
      );
    }

    // Mettre à jour le type d'utilisateur dans la base de données
    const user = await prisma.user.update({
      where: { id: signUpResult.user.id },
      data: {
        type: "COLLABORATEUR",
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour du compte" },
        { status: 500 }
      );
    }

    // Créer le collaborateur - il travaillera dans l'espace du recruteur
    const collaborateur = await prisma.collaborateur.create({
      data: {
        email: invitation.email,
        nom,
        prenom,
        role: invitation.role,
        recruteurId: invitation.recruteurId,
        invitationId: invitation.id,
        userId: user.id,
      },
    });

    // Marquer l'invitation comme acceptée
    await prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        accepted: true,
      },
    });

    return NextResponse.json({
      message:
        "Invitation acceptée avec succès. Vous êtes maintenant collaborateur dans l'équipe.",
      collaborateur,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
      },
      recruteur: {
        id: invitation.recruteur.id,
        name: invitation.recruteur.name,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'acceptation de l'invitation:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'acceptation de l'invitation" },
      { status: 500 }
    );
  }
}
