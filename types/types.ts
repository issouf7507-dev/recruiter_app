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

export type KanbanColumn = {
  color: string;
  createdAt?: string;
  id?: string;
  isDefault?: boolean;
  jobOfferId?: number;
  name: string;
  order?: number;
  updatedAt?: string;
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
  views?: number;
  skills: string;
  postulated: boolean;
  favorite: boolean;
  templateId: number;
  recruteurId: string;
  createdAt: string; // ou Date si tu les convertis
  updatedAt: string; // ou Date si tu les convertis
  applications: Application[]; // à typer selon la structure d'une application
  jobOfferCompetences?: {
    id: string;
    competence: string;
    jobOfferId: number;
    createdAt: string;
  }[];
  matchingPercentage?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
};

export type AlerteNotificationType = {
  id: string;
  titre: string;
  message: string;
  offreId: number;
  createdAt: string;
  lu: boolean;
};

// Type étendu pour une offre d'emploi
export type DetailedJobOffer = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedDate: string;
  applicants: number;
  description: string;
  status: "active" | "draft" | "closed";
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  experience: string;
  education: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  views: number;
  applications: {
    total: number;
    new: number;
    shortlisted: number;
    rejected: number;
  };
  kanbanColumns: any[];
};

export type Candidature = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  cv: string;
  lettreMotivation: string;
  status: "nouvelle" | "en_cours" | "acceptee" | "refusee";
  date: string;
  isFavorite: boolean;
  column: Column;
  candidat: Candidat;
  createdAt: string;
};
