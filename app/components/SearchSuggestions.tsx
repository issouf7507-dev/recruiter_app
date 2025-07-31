"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchSuggestionsProps {
  selectedCompetences: string[];
  onCompetenceToggle: (competence: string) => void;
  stats?: Array<{
    competence: string;
    _count: {
      competence: number;
    };
  }>;
}

const popularCombinations = [
  {
    name: "Développement Frontend",
    competences: ["javascript", "react", "typescript", "nextjs"],
    description: "Spécialistes de l'interface utilisateur",
  },
  {
    name: "Développement Backend",
    competences: ["nodejs", "python", "java", "sql"],
    description: "Experts des serveurs et bases de données",
  },
  {
    name: "DevOps & Cloud",
    competences: ["docker", "aws", "git", "mongodb"],
    description: "Infrastructure et déploiement",
  },
  {
    name: "Design & Communication",
    competences: ["uiux", "canva", "rédaction", "agile"],
    description: "Créatifs et communicants",
  },
];

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  selectedCompetences,
  onCompetenceToggle,
  stats,
}) => {
  const getCombinationMatchCount = (competences: string[]) => {
    return competences.filter((c) => selectedCompetences.includes(c)).length;
  };

  const getCombinationPercentage = (competences: string[]) => {
    const matchCount = getCombinationMatchCount(competences);
    return Math.round((matchCount / competences.length) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Compétences populaires */}
      {stats && stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Compétences les plus recherchées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.slice(0, 8).map((stat) => (
                <Badge
                  key={stat.competence}
                  variant={
                    selectedCompetences.includes(stat.competence)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => onCompetenceToggle(stat.competence)}
                >
                  {stat.competence.charAt(0).toUpperCase() +
                    stat.competence.slice(1)}
                  <span className="ml-1 text-xs opacity-70">
                    ({stat._count.competence})
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Combinaisons suggérées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4" />
            Combinaisons populaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {popularCombinations.map((combination) => {
              const matchPercentage = getCombinationPercentage(
                combination.competences
              );
              const isPartiallySelected =
                getCombinationMatchCount(combination.competences) > 0;

              return (
                <div
                  key={combination.name}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm",
                    isPartiallySelected && "border-primary/30 bg-primary/5"
                  )}
                  onClick={() => {
                    // Ajouter les compétences manquantes de la combinaison
                    combination.competences.forEach((comp) => {
                      if (!selectedCompetences.includes(comp)) {
                        onCompetenceToggle(comp);
                      }
                    });
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{combination.name}</h4>
                    {isPartiallySelected && (
                      <span className="text-xs text-primary font-medium">
                        {matchPercentage}% sélectionné
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {combination.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {combination.competences.map((comp) => (
                      <Badge
                        key={comp}
                        variant={
                          selectedCompetences.includes(comp)
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {comp.charAt(0).toUpperCase() + comp.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchSuggestions;
