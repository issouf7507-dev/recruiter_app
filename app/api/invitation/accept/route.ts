import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, nom, prenom, password } = body;

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

    // Créer l'utilisateur
    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        name: `${prenom} ${nom}`,
        password: hashedPassword,
        type: "RECRUTEUR",
      },
    });

    if (!user) {
      return NextResponse.json({});
    }
    // Créer le collaborateur
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
      message: "Invitation acceptée avec succès",
      collaborateur,
    });
  } catch (error) {
    console.error("Erreur lors de l'acceptation de l'invitation:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'acceptation de l'invitation" },
      { status: 500 }
    );
  }
}
