import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe dans BackupUser
    const backupUser = await prisma.backupUser.findUnique({
      where: { email },
    });

    if (!backupUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé dans BackupUser" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur n'est pas déjà migré
    if (backupUser.migrated) {
      return NextResponse.json(
        { error: "Utilisateur déjà migré" },
        { status: 400 }
      );
    }

    // Supprimer l'ancien utilisateur (cascade supprimera aussi account, candidat, recruteur, etc.)
    const oldUser = await prisma.user.findUnique({
      where: { email },
    });

    if (oldUser) {
      // Supprimer d'abord les comptes associés pour éviter les erreurs de contrainte
      await prisma.account.deleteMany({
        where: { userId: oldUser.id },
      });

      // Supprimer les sessions
      await prisma.session.deleteMany({
        where: { userId: oldUser.id },
      });

      // Maintenant supprimer l'utilisateur (cascade supprimera candidat/recruteur/collaborateur)
      await prisma.user.delete({
        where: { id: oldUser.id },
      });

      console.log(`✅ Ancien utilisateur supprimé: ${email}`);
    }

    return NextResponse.json(
      { 
        success: true,
        message: "Ancien utilisateur supprimé avec succès"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression" },
      { status: 500 }
    );
  }
}


