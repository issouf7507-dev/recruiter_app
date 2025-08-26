import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// POST - Ajouter un candidat manuellement à une application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nom,
      prenom,
      email,
      telephone,
      cv,
      bio,
      adresse,
      ville,
      pays,
      dateNaissance,
      applicationId,
    } = body;

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'application appartient au recruteur
    const application = await prisma.applicationCustom.findFirst({
      where: {
        id: applicationId,
        // TODO: Ajouter la vérification du recruteur via les relations
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application non trouvée" },
        { status: 404 }
      );
    }

    const newCandidate = await prisma.candidatCustom.create({
      data: {
        // email,
        nom,
        prenom,
        role: "USER",
        userId: `temp_${Date.now()}`, // ID temporaire unique
        telephone: telephone || "",
        cv: cv || "",
        bio: bio || "",
        adresse: adresse || "",
        ville: ville || "",
        pays: pays || "France",
        dateNaissance: dateNaissance ? new Date(dateNaissance) : new Date(),
        applicationId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newCandidate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'ajout du candidat:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
