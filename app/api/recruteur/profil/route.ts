import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le profil du recruteur
    const recruteur = await prisma.recruteur.findFirst({
      where: {
        userId: session?.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        social: true,
      },
    });

    const collaborateur = await prisma.collaborateur.findUnique({
      where: { userId: session.user.id },
      include: {
        recruteur: {
          include: {
            user: { select: { name: true, email: true, image: true } },
          },
        },
      },
    });

    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // if (!recruteur) {
    //   return NextResponse.json(
    //     { error: "Recruteur non trouvé" },
    //     { status: 404 }
    //   );
    // }

    // Formater les données pour correspondre au format attendu par le frontend
    const profil = {
      name: recruteur?.name || recruteur?.user?.name || "",
      entreprise: recruteur?.entreprise || "",
      description: recruteur?.description || "",
      industry: recruteur?.industry || "",
      size: recruteur?.size || "",
      location: recruteur?.location || "",
      website: recruteur?.website || "",
      email: recruteur?.email || recruteur?.user?.email || "",
      phone: recruteur?.phone || "",
      logo: recruteur?.logo || recruteur?.user?.image || "",
      social: {
        linkedin: recruteur?.social?.linkedin || "",
        twitter: recruteur?.social?.twitter || "",
      },
    };

    return NextResponse.json({
      success: true,
      data: profil,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    // const validatedData = .parse(body);

    // Extraire les données sociales
    const { linkedin, twitter, ...recruteurData } = body;

    // Mettre à jour le profil du recruteur
    const updatedRecruteur = await prisma.recruteur.update({
      where: {
        userId: session?.user.id,
      },
      data: {
        ...recruteurData,
        social: {
          upsert: {
            create: {
              linkedin: linkedin || "",
              twitter: twitter || "",
            },
            update: {
              linkedin: linkedin || "",
              twitter: twitter || "",
            },
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        social: true,
      },
    });

    // Mettre à jour également le nom de l'utilisateur si fourni
    if (body.name) {
      await prisma.user.update({
        where: {
          id: session?.user.id,
        },
        data: {
          name: body.name,
        },
      });
    }

    // Formater la réponse
    const profil = {
      name: updatedRecruteur.name || updatedRecruteur.user?.name || "",
      entreprise: updatedRecruteur.entreprise || "",
      description: updatedRecruteur.description || "",
      industry: updatedRecruteur.industry || "",
      size: updatedRecruteur.size || "",
      location: updatedRecruteur.location || "",
      website: updatedRecruteur.website || "",
      email: updatedRecruteur.email || updatedRecruteur.user?.email || "",
      phone: updatedRecruteur.phone || "",
      logo: updatedRecruteur.logo || updatedRecruteur.user?.image || "",
      social: {
        linkedin: updatedRecruteur.social?.linkedin || "",
        twitter: updatedRecruteur.social?.twitter || "",
      },
    };

    return NextResponse.json({
      success: true,
      data: profil,
      message: "Profil mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
