import { NextResponse, NextRequest } from "next/server";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";

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

    // Récupérer le recruteur
    const recruteur = await prisma.recruteur.findFirst({
      where: {
        userId: decoded.userId,
      },
    });

    if (!recruteur) {
      return NextResponse.json(
        { error: "Recruteur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("search") || "";
    const experience = searchParams.get("experience");
    const localisation = searchParams.get("localisation") || "";
    const diplome = searchParams.get("diplome") || "";
    const disponibilite = searchParams.get("disponibilite") || "";
    const pretentionSalariale = searchParams.get("pretentionSalariale") || "";
    const jobOfferId = searchParams.get("jobOfferId");

    // Construire la requête de base
    let whereClause: any = {
      applications: {
        some: {
          jobOffer: {
            recruteurId: recruteur.id,
          },
        },
      },
    };

    // Ajouter les filtres
    if (searchTerm) {
      whereClause.OR = [
        { nom: { contains: searchTerm, mode: "insensitive" } },
        { prenom: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
        { competences: { hasSome: [searchTerm] } },
      ];
    }

    if (localisation) {
      whereClause.ville = { contains: localisation, mode: "insensitive" };
    }

    if (diplome) {
      whereClause.formations = {
        some: {
          diplome: { contains: diplome, mode: "insensitive" },
        },
      };
    }

    // Modifier la clause applications si jobOfferId est spécifié
    if (jobOfferId) {
      whereClause.applications = {
        some: {
          jobOfferId: parseInt(jobOfferId),
          jobOffer: {
            recruteurId: recruteur.id,
          },
        },
      };
    }

    // Récupérer les candidats avec leurs informations
    const candidats = await prisma.candidat.findMany({
      where: whereClause,
      include: {
        applications: {
          include: {
            jobOffer: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
            column: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        experiences: {
          orderBy: {
            dateDebut: "desc",
          },
          take: 1,
        },
        formations: {
          orderBy: {
            dateFin: "desc",
          },
          take: 1,
        },
        competencesList: true,
      },
      orderBy: {
        nom: "asc",
      },
    });

    // Transformer les données pour correspondre au format attendu
    const candidatsFormatted = candidats.map((candidat) => {
      // Calculer l'expérience en années
      let experienceYears = 0;
      if (candidat.experiences && candidat.experiences.length > 0) {
        const latestExperience = candidat.experiences[0];
        const startDate = new Date(latestExperience.dateDebut);
        const endDate = latestExperience.dateFin
          ? new Date(latestExperience.dateFin)
          : new Date();
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        experienceYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
      }

      const diplome = candidat.formations?.[0]?.diplome || "Non spécifié";
      const competences = [
        ...candidat.competencesList,
        ...(candidat.competencesList?.map((comp: any) => comp.nom) || []),
      ];

      return {
        id: candidat.id,
        nom: `${candidat.prenom || ""} ${candidat.nom || ""}`.trim(),
        email: candidat.email,
        photo: candidat.image || "",
        experience: experienceYears,
        competences: competences,
        diplome: diplome,
        localisation: candidat.ville || "Non spécifié",
        disponibilite: candidat.statut || "Non spécifié",
        pretentionSalariale: "Non spécifié", // À implémenter si nécessaire
        cvUrl: candidat.cv || "",
        applications:
          candidat.applications?.map((app: any) => ({
            id: app.id,
            jobOffer: app.jobOffer,
            status: app.column.name,
            createdAt: app.createdAt,
          })) || [],
      };
    });

    // Appliquer les filtres supplémentaires côté serveur si nécessaire
    let filteredCandidats = candidatsFormatted;

    if (experience) {
      const minExperience = parseInt(experience);
      filteredCandidats = filteredCandidats.filter(
        (candidat) => candidat.experience >= minExperience
      );
    }

    if (disponibilite && disponibilite !== "all") {
      filteredCandidats = filteredCandidats.filter((candidat) =>
        candidat.disponibilite
          .toLowerCase()
          .includes(disponibilite.toLowerCase())
      );
    }

    if (pretentionSalariale && pretentionSalariale !== "all") {
      // Logique pour filtrer par prétention salariale si nécessaire
      // Pour l'instant, on garde tous les candidats
    }

    return NextResponse.json(
      {
        success: true,
        data: filteredCandidats,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur lors de la recherche des candidats:", err);
    return NextResponse.json(
      { error: "Erreur lors de la recherche des candidats" },
      { status: 500 }
    );
  }
}
