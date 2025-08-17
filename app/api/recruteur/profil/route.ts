import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { z } from "zod";

const profilSchema = z.object({
  name: z.string().min(2).optional(),
  entreprise: z.string().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  logo: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le profil du recruteur
    const recruteur = await prisma.recruteur.findFirst({
      where: {
        userId: decoded.userId,
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

    if (!recruteur) {
      return NextResponse.json(
        { error: "Recruteur non trouvé" },
        { status: 404 }
      );
    }

    // Formater les données pour correspondre au format attendu par le frontend
    const profil = {
      name: recruteur.name || recruteur.user?.name || "",
      entreprise: recruteur.entreprise || "",
      description: recruteur.description || "",
      industry: recruteur.industry || "",
      size: recruteur.size || "",
      location: recruteur.location || "",
      website: recruteur.website || "",
      email: recruteur.email || recruteur.user?.email || "",
      phone: recruteur.phone || "",
      logo: recruteur.logo || recruteur.user?.image || "",
      social: {
        linkedin: recruteur.social?.linkedin || "",
        twitter: recruteur.social?.twitter || "",
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
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = profilSchema.parse(body);

    // Extraire les données sociales
    const { linkedin, twitter, ...recruteurData } = validatedData;

    // Mettre à jour le profil du recruteur
    const updatedRecruteur = await prisma.recruteur.update({
      where: {
        userId: decoded.userId,
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
    if (validatedData.name) {
      await prisma.user.update({
        where: {
          id: decoded.userId,
        },
        data: {
          name: validatedData.name,
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
