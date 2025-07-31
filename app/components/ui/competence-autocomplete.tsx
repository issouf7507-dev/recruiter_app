"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Competence {
  id: string;
  name: string;
  category?: string;
  popularity?: number;
}

interface CompetenceAutocompleteProps {
  selectedCompetences: string[];
  onCompetencesChange: (competences: string[]) => void;
  placeholder?: string;
  maxCompetences?: number;
  className?: string;
}

// Liste des compétences populaires
const popularCompetences: Competence[] = [
  // Langages de programmation
  {
    id: "javascript",
    name: "JavaScript",
    category: "Langages",
    popularity: 95,
  },
  { id: "python", name: "Python", category: "Langages", popularity: 90 },
  { id: "java", name: "Java", category: "Langages", popularity: 85 },
  {
    id: "typescript",
    name: "TypeScript",
    category: "Langages",
    popularity: 80,
  },
  { id: "csharp", name: "C#", category: "Langages", popularity: 75 },
  { id: "php", name: "PHP", category: "Langages", popularity: 70 },
  { id: "go", name: "Go", category: "Langages", popularity: 65 },
  { id: "rust", name: "Rust", category: "Langages", popularity: 60 },
  { id: "swift", name: "Swift", category: "Langages", popularity: 55 },
  { id: "kotlin", name: "Kotlin", category: "Langages", popularity: 50 },

  // Frameworks et bibliothèques
  { id: "react", name: "React", category: "Frameworks", popularity: 95 },
  { id: "nodejs", name: "Node.js", category: "Frameworks", popularity: 90 },
  { id: "vuejs", name: "Vue.js", category: "Frameworks", popularity: 80 },
  { id: "angular", name: "Angular", category: "Frameworks", popularity: 75 },
  { id: "express", name: "Express.js", category: "Frameworks", popularity: 85 },
  { id: "django", name: "Django", category: "Frameworks", popularity: 70 },
  { id: "spring", name: "Spring Boot", category: "Frameworks", popularity: 75 },
  { id: "laravel", name: "Laravel", category: "Frameworks", popularity: 65 },
  { id: "flask", name: "Flask", category: "Frameworks", popularity: 60 },
  { id: "fastapi", name: "FastAPI", category: "Frameworks", popularity: 55 },

  // Bases de données
  { id: "sql", name: "SQL", category: "Bases de données", popularity: 90 },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "Bases de données",
    popularity: 80,
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Bases de données",
    popularity: 85,
  },
  { id: "mysql", name: "MySQL", category: "Bases de données", popularity: 80 },
  { id: "redis", name: "Redis", category: "Bases de données", popularity: 70 },
  {
    id: "elasticsearch",
    name: "Elasticsearch",
    category: "Bases de données",
    popularity: 60,
  },
  {
    id: "cassandra",
    name: "Cassandra",
    category: "Bases de données",
    popularity: 45,
  },
  {
    id: "dynamodb",
    name: "DynamoDB",
    category: "Bases de données",
    popularity: 50,
  },

  // Cloud et DevOps
  { id: "aws", name: "AWS", category: "Cloud", popularity: 90 },
  { id: "docker", name: "Docker", category: "DevOps", popularity: 85 },
  { id: "kubernetes", name: "Kubernetes", category: "DevOps", popularity: 75 },
  { id: "azure", name: "Azure", category: "Cloud", popularity: 80 },
  { id: "gcp", name: "Google Cloud", category: "Cloud", popularity: 70 },
  { id: "terraform", name: "Terraform", category: "DevOps", popularity: 65 },
  { id: "jenkins", name: "Jenkins", category: "DevOps", popularity: 60 },
  { id: "gitlab", name: "GitLab CI/CD", category: "DevOps", popularity: 55 },
  { id: "github", name: "GitHub Actions", category: "DevOps", popularity: 70 },

  // Outils de développement
  { id: "git", name: "Git", category: "Outils", popularity: 95 },
  { id: "vscode", name: "VS Code", category: "Outils", popularity: 90 },
  { id: "intellij", name: "IntelliJ IDEA", category: "Outils", popularity: 75 },
  { id: "postman", name: "Postman", category: "Outils", popularity: 70 },
  { id: "jira", name: "Jira", category: "Outils", popularity: 80 },
  { id: "confluence", name: "Confluence", category: "Outils", popularity: 65 },
  { id: "figma", name: "Figma", category: "Outils", popularity: 60 },
  { id: "sketch", name: "Sketch", category: "Outils", popularity: 45 },

  // Méthodologies
  { id: "agile", name: "Agile", category: "Méthodologies", popularity: 85 },
  { id: "scrum", name: "Scrum", category: "Méthodologies", popularity: 80 },
  { id: "kanban", name: "Kanban", category: "Méthodologies", popularity: 70 },
  { id: "tdd", name: "TDD", category: "Méthodologies", popularity: 60 },
  { id: "bdd", name: "BDD", category: "Méthodologies", popularity: 50 },
  { id: "devops", name: "DevOps", category: "Méthodologies", popularity: 75 },

  // Compétences transversales
  {
    id: "leadership",
    name: "Leadership",
    category: "Soft Skills",
    popularity: 80,
  },
  {
    id: "communication",
    name: "Communication",
    category: "Soft Skills",
    popularity: 85,
  },
  {
    id: "problem-solving",
    name: "Problem Solving",
    category: "Soft Skills",
    popularity: 90,
  },
  { id: "teamwork", name: "Teamwork", category: "Soft Skills", popularity: 85 },
  {
    id: "project-management",
    name: "Project Management",
    category: "Soft Skills",
    popularity: 75,
  },
  {
    id: "mentoring",
    name: "Mentoring",
    category: "Soft Skills",
    popularity: 65,
  },
];

export default function CompetenceAutocomplete({
  selectedCompetences,
  onCompetencesChange,
  placeholder = "Sélectionner des compétences...",
  maxCompetences = 10,
  className,
}: CompetenceAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredCompetences, setFilteredCompetences] = useState<Competence[]>(
    []
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrer les compétences basées sur la recherche
  useEffect(() => {
    if (!searchValue) {
      setFilteredCompetences(popularCompetences);
    } else {
      const filtered = popularCompetences.filter(
        (competence) =>
          competence.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          competence.category?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredCompetences(filtered);
    }
  }, [searchValue]);

  // Grouper les compétences par catégorie
  const groupedCompetences = filteredCompetences.reduce(
    (groups, competence) => {
      const category = competence.category || "Autres";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(competence);
      return groups;
    },
    {} as Record<string, Competence[]>
  );

  const handleCompetenceSelect = (competenceName: string) => {
    if (selectedCompetences.includes(competenceName)) {
      onCompetencesChange(
        selectedCompetences.filter((c) => c !== competenceName)
      );
    } else if (selectedCompetences.length < maxCompetences) {
      onCompetencesChange([...selectedCompetences, competenceName]);
    }
    setSearchValue("");
    setOpen(false);
  };

  const removeCompetence = (competenceToRemove: string) => {
    onCompetencesChange(
      selectedCompetences.filter((c) => c !== competenceToRemove)
    );
  };

  const addCustomCompetence = () => {
    if (
      searchValue.trim() &&
      !selectedCompetences.includes(searchValue.trim()) &&
      selectedCompetences.length < maxCompetences
    ) {
      onCompetencesChange([...selectedCompetences, searchValue.trim()]);
      setSearchValue("");
      setOpen(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Compétences sélectionnées */}
      {selectedCompetences.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCompetences.map((competence) => (
            <Badge
              key={competence}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {competence}
              <button
                onClick={() => removeCompetence(competence)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Sélecteur de compétences */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={selectedCompetences.length >= maxCompetences}
          >
            {selectedCompetences.length === 0
              ? placeholder
              : `${selectedCompetences.length}/${maxCompetences} compétences sélectionnées`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Rechercher une compétence..."
              value={searchValue}
              onValueChange={setSearchValue}
              ref={inputRef}
            />
            <CommandList>
              <CommandEmpty>
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Aucune compétence trouvée
                  </p>
                  {searchValue.trim() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addCustomCompetence}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter "{searchValue.trim()}"
                    </Button>
                  )}
                </div>
              </CommandEmpty>

              {Object.entries(groupedCompetences).map(
                ([category, competences]) => (
                  <CommandGroup key={category} heading={category}>
                    {competences.map((competence) => (
                      <CommandItem
                        key={competence.id}
                        value={competence.name}
                        onSelect={() => handleCompetenceSelect(competence.name)}
                        disabled={selectedCompetences.includes(competence.name)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCompetences.includes(competence.name)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <span>{competence.name}</span>
                          {competence.popularity && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({competence.popularity}% popularité)
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Indicateur de limite */}
      {selectedCompetences.length >= maxCompetences && (
        <p className="text-xs text-muted-foreground">
          Limite de {maxCompetences} compétences atteinte
        </p>
      )}
    </div>
  );
}
