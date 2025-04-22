export type offerTemplate = {
  id: number;
  name: string;
  description: string;
  content: string;
  recruteurId: string;
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
  templateId: number;
  recruteurId: string;
  createdAt: string; // ou Date si tu les convertis
  updatedAt: string; // ou Date si tu les convertis
  applications: any[]; // à typer selon la structure d'une application
  competences: string[];
  matchingPercentage?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
};
