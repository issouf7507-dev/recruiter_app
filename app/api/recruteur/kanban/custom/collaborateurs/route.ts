import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session?.user.id },
    });
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session?.user.id },
      include: {
        recruteur: true,
      },
    });
    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les collaborateurs custom
    const collaborateurs = await prisma.collaborateurCustom.findMany({
      where: {
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      collaborateurs: collaborateurs,
      fromCache: false,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des collaborateurs:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, nom, prenom, role, userId } = body;

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session?.user.id },
    });
    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session?.user.id },
      include: {
        recruteur: true,
      },
    });
    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!email || !nom || !prenom || !role || !userId) {
      return NextResponse.json(
        { error: "Données incomplètes" },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingCollaborateur = await prisma.collaborateurCustom.findFirst({
      where: {
        email: email,
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      },
    });

    if (existingCollaborateur) {
      return NextResponse.json(
        { error: "Un collaborateur avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Créer le nouveau collaborateur
    const newCollaborateur = await prisma.collaborateurCustom.create({
      data: {
        email: email,
        nom: nom,
        prenom: prenom,
        role: role,
        userId: userId,
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Collaborateur créé avec succès",
      data: newCollaborateur,
    });
  } catch (error) {
    console.error("Erreur lors de la création du collaborateur:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
