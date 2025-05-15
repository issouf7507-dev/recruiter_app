import prisma from "@/lib/prisma";
import { MailService } from "./mail.service";

interface AlerteMatch {
  alerteId: string;
  jobOfferId: number;
  score: number;
  matchDetails: {
    titre: boolean;
    localisation: boolean;
    typeContrat: boolean;
    experience: boolean;
    competences: boolean;
  };
}

export class AlerteService {
  // Vérifie si une offre correspond à une alerte
  private static async checkAlerteMatch(
    alerte: any,
    jobOffer: any
  ): Promise<AlerteMatch | null> {
    const matchDetails = {
      titre: false,
      localisation: false,
      typeContrat: false,
      experience: false,
      competences: false,
    };

    // Vérification du titre
    const titreMatch = jobOffer.title
      .toLowerCase()
      .includes(alerte.titre.toLowerCase());
    matchDetails.titre = titreMatch;

    // Vérification de la localisation
    const localisationMatch = jobOffer.location
      .toLowerCase()
      .includes(alerte.localisation.toLowerCase());
    matchDetails.localisation = localisationMatch;

    // Vérification du type de contrat
    const typeContratMatch =
      jobOffer.type.toLowerCase() === alerte.typeContrat.toLowerCase();
    matchDetails.typeContrat = typeContratMatch;

    // Vérification de l'expérience
    // const experienceMatch = this.compareExperience(
    //   jobOffer.experience,
    //   alerte.experience
    // );
    // matchDetails.experience = experienceMatch;

    // Vérification des compétences
    const competencesMatch = alerte.motsCles.some((motCle: string) =>
      jobOffer.competences.some((comp: string) =>
        comp.toLowerCase().trim().includes(motCle.toLowerCase().trim())
      )
    );

    matchDetails.competences = competencesMatch;

    // Calcul du score de correspondance
    const score = Object.values(matchDetails).filter(Boolean).length;

    // Si le score est suffisant (au moins 3 critères correspondent)
    if (score >= 3) {
      return {
        alerteId: alerte.id,
        jobOfferId: jobOffer.id,
        score,
        matchDetails,
      };
    }

    return null;
  }

  // Compare les niveaux d'expérience
  // private static compareExperience(
  //   jobExperience: string,
  //   alerteExperience: string
  // ): boolean {
  //   const experienceMap: { [key: string]: number } = {
  //     Débutant: 0,
  //     "1-3 ans": 1,
  //     "3-5 ans": 2,
  //     "5+ ans": 3,
  //   };

  //   const jobExpLevel = experienceMap[jobExperience] || 0;
  //   const alerteExpLevel = experienceMap[alerteExperience] || 0;

  //   return jobExpLevel >= alerteExpLevel;
  // }

  // Vérifie toutes les alertes actives contre les nouvelles offres
  public static async checkNouvellesOffres() {
    try {
      // Récupérer toutes les alertes actives
      const alertes = await prisma.alerteEmploi.findMany({
        where: { active: true },
        include: { candidat: true },
      });

      // Récupérer les offres créées depuis la dernière vérification
      const derniereVerification = new Date();
      derniereVerification.setHours(derniereVerification.getHours() - 24); // Dernières 24h

      const nouvellesOffres = await prisma.jobOffer.findMany({});

      const matches: AlerteMatch[] = [];
      // console.log("alertes", alertes);
      console.log("nouvellesOffres", nouvellesOffres);
      // Vérifier chaque alerte contre chaque nouvelle offre
      for (const alerte of alertes) {
        // Récupérer toutes les notifications existantes pour ce candidat
        const notificationsExistantes = await prisma.notification.findMany({
          where: {
            candidatId: alerte.candidatId,
            type: "alerte",
          },
          select: {
            offreId: true,
          },
        });

        // Créer un Set des IDs d'offres déjà notifiées pour ce candidat
        const offresDejaNotifiees = new Set(
          notificationsExistantes.map((n) => n.offreId)
        );

        for (const offre of nouvellesOffres) {
          // Vérifier si l'offre a déjà été notifiée pour ce candidat
          if (offresDejaNotifiees.has(offre.id)) {
            // console.log(offresDejaNotifiees.has(offre.id));
            continue;
          }

          const match = await this.checkAlerteMatch(alerte, offre);
          if (match) {
            matches.push(match);

            // Mettre à jour le nombre de résultats pour cette alerte
            await prisma.alerteEmploi.update({
              where: { id: alerte.id },
              data: {
                nombreResultats: {
                  increment: 1,
                },
                derniereMiseAJour: new Date(),
              },
            });

            // Créer une notification pour le candidat
            await this.createNotification(alerte.candidat, offre, match);
          }
        }
      }

      return matches;
    } catch (error) {
      console.error("Erreur lors de la vérification des alertes:", error);
      throw error;
    }
  }

  // Crée une notification pour le candidat
  private static async createNotification(
    candidat: any,
    offre: any,
    match: AlerteMatch
  ) {
    try {
      // Créer la notification
      await prisma.notification.create({
        data: {
          titre: "Nouvelle offre correspondante",
          message: `Une nouvelle offre correspond à votre alerte "${offre.title}"`,
          type: "alerte",
          candidatId: candidat.id,
          offreId: offre.id,
        },
      });

      // await MailService.sendEmail(
      //   candidat.email,
      //   "Nouvelle offre correspondante",
      //   `Une nouvelle offre correspond à votre alerte "${offre.title}"`
      // );

      console.log(`Notification créée pour ${candidat.email}: ${offre.title}`);
    } catch (error) {
      console.error("Erreur lors de la création de la notification:", error);
    }
  }
}
