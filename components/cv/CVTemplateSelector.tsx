"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface CVTemplate {
  id: string;
  name: string;
  description?: string;
  layout: string;
  colors?: any;
  fonts?: any;
}

interface CVTemplateSelectorProps {
  templates: CVTemplate[];
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
}

export default function CVTemplateSelector({
  templates,
  selectedTemplateId,
  onTemplateSelect,
}: CVTemplateSelectorProps) {
  const defaultTemplates = [
    {
      id: "modern",
      name: "Moderne",
      description: "Design épuré et contemporain",
      layout: "modern",
      colors: { primary: "#3B82F6", secondary: "#64748B" },
      preview: "bg-gradient-to-br from-blue-50 to-blue-100",
    },
    {
      id: "classic",
      name: "Classique",
      description: "Style traditionnel et professionnel",
      layout: "classic",
      colors: { primary: "#1F2937", secondary: "#6B7280" },
      preview: "bg-gradient-to-br from-gray-50 to-gray-100",
    },
    {
      id: "creative",
      name: "Créatif",
      description: "Design original et coloré",
      layout: "creative",
      colors: { primary: "#7C3AED", secondary: "#A78BFA" },
      preview: "bg-gradient-to-br from-purple-50 to-purple-100",
    },
    {
      id: "minimal",
      name: "Minimaliste",
      description: "Simplicité et élégance",
      layout: "minimal",
      colors: { primary: "#059669", secondary: "#10B981" },
      preview: "bg-gradient-to-r from-gray-800 to-gray-600",
    },
  ];

  const allTemplates = templates.length > 0 ? templates : defaultTemplates;

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Choisissez un modèle</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Sélectionnez le style qui correspond le mieux à votre profil
          professionnel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allTemplates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedTemplateId === template.id
                ? "ring-2 ring-blue-500 border-blue-500"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            <CardContent className="p-4">
              <div className="relative">
                {/* Aperçu du template */}
                <div
                  className={`h-32 rounded-lg mb-3 flex items-center justify-center ${
                    (template as any).preview ||
                    "bg-gradient-to-br from-gray-50 to-gray-100"
                  }`}
                >
                  {template.layout === "minimal" ? (
                    <div className="flex w-full h-full rounded-lg overflow-hidden">
                      {/* Sidebar sombre */}
                      <div className="w-1/3 bg-gray-900 p-2 flex flex-col items-center justify-center">
                        <div className="w-6 h-6 bg-gray-600 rounded-full mb-2"></div>
                        <div className="w-8 h-0.5 bg-white/60 mb-1"></div>
                        <div className="w-6 h-0.5 bg-white/40 mb-1"></div>
                        <div className="w-10 h-0.5 bg-white/40"></div>
                      </div>
                      {/* Contenu principal */}
                      <div className="flex-1 bg-white p-2 flex flex-col justify-center">
                        <div className="w-16 h-1.5 bg-gray-800 rounded mb-1"></div>
                        <div className="w-12 h-0.5 bg-gray-500 rounded mb-2"></div>
                        <div className="w-20 h-0.5 bg-gray-400 rounded mb-1"></div>
                        <div className="w-16 h-0.5 bg-gray-400 rounded"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-2 bg-white/60 rounded mb-2 mx-auto"></div>
                      <div className="w-12 h-1 bg-white/40 rounded mb-1 mx-auto"></div>
                      <div className="w-20 h-1 bg-white/40 rounded mx-auto"></div>
                    </div>
                  )}
                </div>

                {/* Indicateur de sélection */}
                {selectedTemplateId === template.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}

                {/* Informations du template */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {template.layout}
                    </Badge>
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTemplateId && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900 dark:text-blue-100">
              Modèle sélectionné :{" "}
              {allTemplates.find((t) => t.id === selectedTemplateId)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
