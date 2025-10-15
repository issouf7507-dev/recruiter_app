import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    // Validation
    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        email: true,
        passwordNeedsUpdate: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Hasher le mot de passe avec bcrypt (compatible Better Auth)
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe dans la table user
    await prisma.user.update({
      where: { email: email },
      data: {
        password: hashedPassword,
        passwordNeedsUpdate: true, // Marquer comme mis à jour
      },
    });

    // Vérifier si un compte credential existe déjà
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    if (existingAccount) {
      // Mettre à jour le compte existant
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });
    } else {
      // Créer un nouveau compte credential avec un ID valide
      const crypto = require("crypto");
      const accountId = crypto.randomUUID();
      
      await prisma.account.create({
        data: {
          id: accountId,
          accountId: user.email,
          providerId: "credential",
          userId: user.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Mot de passe mis à jour avec succès" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du mot de passe" },
      { status: 500 }
    );
  }
}

