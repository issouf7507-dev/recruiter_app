"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Linkedin } from "lucide-react";

interface LinkedInPreviewProps {
  offre: {
    title: string;
    company: string;
    location: string;
    type: string;
    description: string;
    experience: string;
    skills: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
  };
  customMessage?: string;
  includeSalary?: boolean;
  visibility?: "PUBLIC" | "CONNECTIONS";
}

export default function LinkedInPreview({
  offre,
  customMessage,
  includeSalary = true,
  visibility = "PUBLIC",
}: LinkedInPreviewProps) {
  const generatePreviewContent = () => {
    // Vérifier que toutes les propriétés nécessaires existent
    if (
      !offre ||
      !offre.company ||
      !offre.title ||
      !offre.location ||
      !offre.type ||
      !offre.experience
    ) {
      return "❌ Données d'offre incomplètes";
    }

    let content = `🚀 Nouvelle opportunité chez ${offre.company} !\n\n`;
    content += `📋 ${offre.title}\n`;
    content += `📍 ${offre.location}\n`;
    content += `💼 Type de contrat: ${offre.type}\n`;
    content += `🎯 Expérience: ${offre.experience}\n\n`;

    // Description courte (limite LinkedIn)
    const description = offre.description || "Aucune description disponible";
    const shortDescription =
      description.length > 200
        ? description.substring(0, 200) + "..."
        : description;

    content += `${shortDescription}\n\n`;

    // Compétences principales
    if (offre.skills && offre.skills.trim()) {
      const skills = offre.skills
        .split(",")
        .slice(0, 5)
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      if (skills.length > 0) {
        content += `🔧 Compétences: ${skills.join(", ")}\n\n`;
      }
    }

    // Salaire si demandé
    if (
      includeSalary &&
      offre.salaryMin &&
      offre.salaryMax &&
      offre.salaryCurrency
    ) {
      content += `💰 Salaire: ${offre.salaryMin.toLocaleString()} - ${offre.salaryMax.toLocaleString()} ${
        offre.salaryCurrency
      }\n\n`;
    }

    // Message personnalisé
    if (customMessage && customMessage.trim()) {
      content += `💬 ${customMessage}\n\n`;
    }

    content += `#emploi #recrutement #opportunité #${offre.company.replace(
      /\s+/g,
      ""
    )}`;

    return content;
  };

  // Vérifier que l'offre existe
  if (!offre) {
    return (
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/30">
        <CardContent className="pt-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>Aucune offre sélectionnée</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Linkedin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-blue-900 dark:text-blue-100">
            Aperçu LinkedIn
          </h3>
          <Badge variant="outline" className="ml-auto">
            {visibility === "PUBLIC" ? "Public" : "Connexions"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {offre.company?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {offre.company || "Entreprise"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Maintenant
              </p>
            </div>
          </div>

          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900 dark:text-gray-100">
            {generatePreviewContent()}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>👍 J'aime</span>
              <span>💬 Commenter</span>
              <span>🔄 Republier</span>
              <span>📤 Envoyer</span>
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <p>
            • Ce post sera visible par{" "}
            {visibility === "PUBLIC"
              ? "tous les utilisateurs LinkedIn"
              : "vos connexions uniquement"}
          </p>
          <p>• Respectez les limites LinkedIn (150 posts/jour)</p>
        </div>
      </CardContent>
    </Card>
  );
}
