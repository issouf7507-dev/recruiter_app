import { NextResponse, NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const recruteur = await prisma.recruteur.findFirst({
      where: {
        userId: session?.user.id,
      },
    });

    const collaborateur = await prisma.collaborateur.findFirst({
      where: {
        userId: session?.user.id,
      },
      include: {
        recruteur: true,
      },
    });

    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    // Récupérer le recruteur

    // Récupérer les paramètres de diffusion du recruteur
    // Pour l'instant, on retourne des paramètres par défaut
    const diffusionSettings = {
      linkedin: {
        enabled: false,
        apiKey: "",
        apiSecret: "",
        companyId: "",
      },
      indeed: {
        enabled: false,
        publisherId: "",
        apiKey: "",
      },
      apec: {
        enabled: false,
        accountId: "",
        apiKey: "",
      },
      poleEmploi: {
        enabled: false,
        siret: "",
        apiKey: "",
      },
      general: {
        autoPublish: false,
        includeSalary: true,
        includeBenefits: true,
        customMessage: "",
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: diffusionSettings,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur lors de la récupération des paramètres:", err);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { offreId, platforms, settings } = body;

    // Récupérer le recruteur
    const recruteur = await prisma.recruteur.findFirst({
      where: {
        userId: session?.user.id,
      },
    });

    const collaborateur = await prisma.collaborateur.findFirst({
      where: {
        userId: session?.user.id,
      },
      include: {
        recruteur: true,
      },
    });

    if (!recruteur && !collaborateur) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'offre
    const offre = await prisma.jobOffer.findFirst({
      where: {
        id: offreId,
        recruteurId: recruteur?.id || collaborateur?.recruteur?.id || "",
      },
    });

    if (!offre) {
      return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 });
    }

    // Simuler la diffusion sur les plateformes
    const results = [];

    for (const platform of platforms) {
      try {
        // Ici, vous implémenteriez l'intégration réelle avec les APIs
        // LinkedIn Jobs API, Indeed API, etc.

        const result = await simulatePlatformDiffusion(
          offre,
          platform,
          settings
        );
        results.push({
          platform: platform.id,
          success: true,
          message: `Offre publiée avec succès sur ${platform.name}`,
          url: result.url,
        });
      } catch (error: any) {
        results.push({
          platform: platform.id,
          success: false,
          message: `Erreur lors de la publication sur ${platform.name}`,
          error: error?.message || "Erreur inconnue",
        });
      }
    }

    // Enregistrer l'historique de diffusion (à implémenter avec un modèle Prisma)
    // await prisma.diffusionHistory.create({
    //   data: {
    //     jobOfferId: offre.id,
    //     recruteurId: recruteur.id,
    //     platforms: platforms.map((p: any) => p.id),
    //     settings: settings,
    //     results: results,
    //     status: results.every((r: any) => r.success) ? "SUCCESS" : "PARTIAL",
    //   },
    // });

    return NextResponse.json(
      {
        success: true,
        data: {
          results,
          message: "Diffusion terminée",
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur lors de la diffusion:", err);
    return NextResponse.json(
      { error: "Erreur lors de la diffusion" },
      { status: 500 }
    );
  }
}

// Fonction de simulation pour les tests
async function simulatePlatformDiffusion(
  offre: any,
  platform: any,
  settings: any
) {
  // Simuler un délai de traitement
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  );

  // Simuler une URL de publication
  const urls: Record<string, string> = {
    linkedin: `https://www.linkedin.com/jobs/view/${Math.random()
      .toString(36)
      .substr(2, 9)}`,
    indeed: `https://www.indeed.com/viewjob?jk=${Math.random()
      .toString(36)
      .substr(2, 9)}`,
    apec: `https://www.apec.fr/candidat/recherche-emploi.html/emploi/${Math.random()
      .toString(36)
      .substr(2, 9)}`,
    poleEmploi: `https://candidat.pole-emploi.fr/offres/recherche/detail/${Math.random()
      .toString(36)
      .substr(2, 9)}`,
  };

  return {
    url:
      urls[platform.id as keyof typeof urls] ||
      `https://${platform.id}.com/job/${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    jobId: Math.random().toString(36).substr(2, 9),
  };
}
