import { JobOffer } from "@/types/types";

interface UserProfile {
  id: string;
  email: string;
  type: string;
  name?: string;
  image?: string;
  candidat?: {
    adresse: string | null;
    bio: string | null;
    cv: string | null;
    dateNaissance: string; // ISO date string
    favorite: boolean;
    id: string;
    letterm: string | null;
    nationalite: string;
    nom: string;
    pays: string;
    permisConduire: string;
    prenom: string;
    situationFamiliale: string;
    statut: string | null;
    telephone: string;
    userId: string;
    ville: string | null;
    image: string | null;
    competences: string[];
  };
  recruteur?: {
    id: string;
    name: string;
    type: string;
    entreprise?: string;
    logo?: string;
  };
}

export function matchUserWithOffers2(
  user: UserProfile,
  offers: JobOffer[]
): JobOffer[] {
  if (offers) {
    // On prépare les compétences du candidat en lowercase
    const userSkills =
      user.candidat?.competences?.map((skill) => skill.toLowerCase()) || [];

    return offers.map((offer) => {
      // On prépare les compétences de l'offre en lowercase aussi
      const offerSkills =
        offer.jobOfferCompetences?.map((skill) =>
          skill.competence.toLowerCase()
        ) || [];

      const matchedSkills = offerSkills.filter((skill: string) =>
        userSkills.includes(skill)
      );
      const missingSkills = offerSkills.filter(
        (skill: string) => !userSkills.includes(skill)
      );

      const matchingPercentage = Math.round(
        (matchedSkills.length / offerSkills.length) * 100
      );

      return {
        ...offer,
        matchingPercentage,
        matchedSkills,
        missingSkills,
      };
    });
  } else {
    return [];
  }
}

// export function matchUserWithOffers2(
//   user: UserProfile,
//   offers: JobOffer[]
// ): JobOffer[] {
//   if (offers) {
//     return offers.map((offer) => {
//       const matchedSkills = offer.competences.filter((skill) =>
//         user.candidat?.competences.includes(skill)
//       );
//       const missingSkills = offer.competences.filter(
//         (skill) => !user.candidat?.competences.includes(skill)
//       );

//       const matchingPercentage = Math.round(
//         (matchedSkills.length / offer.competences.length) * 100
//       );

//       return {
//         //   title: offer.title,
//         //   company: offer.company,
//         ...offer,
//         matchingPercentage,
//         matchedSkills,
//         missingSkills,
//       };
//     });
//   } else {
//     return [];
//   }
// }
