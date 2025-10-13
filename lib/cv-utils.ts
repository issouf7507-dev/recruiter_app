// Utilitaires pour le générateur de CV

export function cleanCVDataForAPI(cvData: any) {
  const cleaned = { ...cvData };

  // Nettoyer les informations personnelles
  if (cleaned.personalInfo) {
    cleaned.personalInfo = {
      ...cleaned.personalInfo,
      dateOfBirth:
        cleaned.personalInfo.dateOfBirth &&
        cleaned.personalInfo.dateOfBirth !== ""
          ? cleaned.personalInfo.dateOfBirth
          : null,
    };
  }

  // Nettoyer les expériences
  if (cleaned.experiences) {
    cleaned.experiences = cleaned.experiences
      .filter((exp: any) => exp.position && exp.company) // Garder seulement les expériences avec poste et entreprise
      .map((exp: any) => ({
        ...exp,
        startDate: exp.startDate && exp.startDate !== "" ? exp.startDate : null,
        endDate:
          exp.endDate && exp.endDate !== "" && !exp.isCurrent
            ? exp.startDate
            : null,
        description: exp.description || null,
        achievements: exp.achievements || null,
        location: exp.location || null,
        contractType: exp.contractType || "CDI",
      }));
  }

  // Nettoyer les formations
  if (cleaned.educations) {
    cleaned.educations = cleaned.educations
      .filter((edu: any) => edu.degree && edu.institution) // Garder seulement les formations avec diplôme et établissement
      .map((edu: any) => ({
        ...edu,
        startDate: edu.startDate && edu.startDate !== "" ? edu.startDate : null,
        endDate:
          edu.endDate && edu.endDate !== "" && !edu.isCurrent
            ? edu.endDate
            : null,
        description: edu.description || null,
        field: edu.field || null,
        location: edu.location || null,
        grade: edu.grade || null,
        honors: edu.honors || null,
      }));
  }

  // Nettoyer les compétences
  if (cleaned.skills) {
    cleaned.skills = cleaned.skills.filter(
      (skill: any) => skill.name && skill.name.trim() !== ""
    );
  }

  // Nettoyer les langues
  if (cleaned.languages) {
    cleaned.languages = cleaned.languages.filter(
      (lang: any) => lang.name && lang.name.trim() !== ""
    );
  }

  // Nettoyer les centres d'intérêt
  if (cleaned.interests) {
    cleaned.interests = cleaned.interests.filter(
      (interest: any) => interest.name && interest.name.trim() !== ""
    );
  }

  return cleaned;
}

export function validateCVData(cvData: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Vérifier le template
  if (!cvData.templateId) {
    errors.push("Veuillez sélectionner un modèle de CV");
  }

  // Vérifier les informations personnelles de base
  if (!cvData.personalInfo?.firstName) {
    errors.push("Le prénom est requis");
  }
  if (!cvData.personalInfo?.lastName) {
    errors.push("Le nom est requis");
  }
  if (!cvData.personalInfo?.email) {
    errors.push("L'email est requis");
  }

  // Vérifier qu'il y a au moins une expérience ou une formation
  const hasExperience =
    cvData.experiences &&
    cvData.experiences.some((exp: any) => exp.position && exp.company);
  const hasEducation =
    cvData.educations &&
    cvData.educations.some((edu: any) => edu.degree && edu.institution);

  if (!hasExperience && !hasEducation) {
    errors.push(
      "Ajoutez au moins une expérience professionnelle ou une formation"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
