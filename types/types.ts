export type offerTemplate = {
  id: number;
  name: string;
  description: string;
  content: string;
  recruteurId: string;
};

type Column = {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
  jobOfferId: number;
  createdAt: string; // ou Date si tu le convertis
  updatedAt: string; // ou Date si tu le convertis
};

export type Candidat = {
  id: string;
  userId: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  dateNaissance: string;
  nationalite: string;
  situationFamiliale: string;
  permisConduire: string;
  bio: string;
  cv: string;
  letterm: string;
  competences: string[];
  image: string;
  favorite: boolean;
  statut: string | null;
  email: string | null;
};

export type Application = {
  id: string;
  candidatId: string;
  jobOfferId: number;
  columnId: string;
  note: string | null;
  rating: number | null;
  message: string;
  cv: string | null;
  email?: string | null;
  createdAt: string;
  candidat: Candidat;
  column: Column;
};

export type JobOffer = {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  type: string; // ex: "CDI", "CDD", etc.
  etat: string; // ex: "active"
  experience: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string; // ex: "EUR", "XOF", "USD", etc.
  salaryPeriod: string; // ex: "mois", "an", "heure"
  benefits: string;
  requirements: string;
  responsibilities: string;
  skills: string;
  postulated: boolean;
  favorite: boolean;
  templateId: number;
  recruteurId: string;
  createdAt: string; // ou Date si tu les convertis
  updatedAt: string; // ou Date si tu les convertis
  applications: Application[]; // à typer selon la structure d'une application
  competences: string[];
  matchingPercentage?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
};

export type AlerteNotificationType = {
  id: string;
  titre: string;
  message: string;
  offre: {
    id: number;
    title: string;
    company: string;
    location: string;
  };
  createdAt: string;
  lu: boolean;
};
