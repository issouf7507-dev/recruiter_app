"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Briefcase,
} from "lucide-react";

interface Experience {
  id: number;
  poste: string;
  entreprise: string;
  localisation: string;
  typeContrat: string;
  dateDebut: Date;
  dateFin: Date | null;
  description: string;
  competences: string[];
}

const ExperiencesPage = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: 1,
      poste: "Développeur Full Stack",
      entreprise: "TechCorp Inc.",
      localisation: "Abidjan, Côte d'Ivoire",
      typeContrat: "CDI",
      dateDebut: new Date("2020-01-01"),
      dateFin: null as Date | null,
      description:
        "Développement et maintenance d'applications web full stack. Gestion de projets et encadrement d'une équipe de 3 développeurs.",
      competences: ["React", "Node.js", "MongoDB", "TypeScript"],
    },
    {
      id: 2,
      poste: "Développeur Frontend",
      entreprise: "WebSolutions",
      localisation: "Abidjan, Côte d'Ivoire",
      typeContrat: "CDD",
      dateDebut: new Date("2018-06-01"),
      dateFin: new Date("2019-12-31"),
      description:
        "Développement d'interfaces utilisateur modernes et responsives. Intégration de maquettes et optimisation des performances.",
      competences: ["React", "JavaScript", "CSS", "HTML"],
    },
  ]);

  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    poste: "",
    entreprise: "",
    localisation: "",
    typeContrat: "",
    dateDebut: new Date(),
    dateFin: null,
    description: "",
    competences: [],
  });

  const handleAddExperience = () => {
    if (newExperience.poste && newExperience.entreprise) {
      setExperiences([
        {
          id: experiences.length + 1,
          poste: newExperience.poste!,
          entreprise: newExperience.entreprise!,
          localisation: newExperience.localisation!,
          typeContrat: newExperience.typeContrat!,
          dateDebut: newExperience.dateDebut!,
          dateFin: newExperience.dateFin ?? null,
          description: newExperience.description!,
          competences: newExperience.competences!,
        },
        ...experiences,
      ]);
      setNewExperience({
        poste: "",
        entreprise: "",
        localisation: "",
        typeContrat: "",
        dateDebut: new Date(),
        dateFin: null,
        description: "",
        competences: [],
      });
      setIsAdding(false);
    }
  };

  const handleEditExperience = (id: number) => {
    setEditingId(id);
  };

  const handleSaveEdit = (id: number) => {
    setEditingId(null);
  };

  const handleDeleteExperience = (id: number) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Expériences professionnelles</h1>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une expérience
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poste">Poste</Label>
                  <Input
                    id="poste"
                    value={newExperience.poste}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        poste: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entreprise">Entreprise</Label>
                  <Input
                    id="entreprise"
                    value={newExperience.entreprise}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        entreprise: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="localisation">Localisation</Label>
                  <Input
                    id="localisation"
                    value={newExperience.localisation}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        localisation: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typeContrat">Type de contrat</Label>
                  <Select
                    value={newExperience.typeContrat}
                    onValueChange={(value) =>
                      setNewExperience({
                        ...newExperience,
                        typeContrat: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de début</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newExperience.dateDebut ? (
                          format(newExperience.dateDebut, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newExperience.dateDebut}
                        onSelect={(date) =>
                          setNewExperience({
                            ...newExperience,
                            dateDebut: date!,
                          })
                        }
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Date de fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newExperience.dateFin ? (
                          format(newExperience.dateFin, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newExperience.dateFin ?? new Date()}
                        onSelect={(date) =>
                          setNewExperience({ ...newExperience, dateFin: date })
                        }
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newExperience.description}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      description: e.target.value,
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Compétences</Label>
                <Input
                  placeholder="Ajouter des compétences (séparées par des virgules)"
                  value={newExperience.competences?.join(", ")}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      competences: e.target.value
                        .split(",")
                        .map((skill) => skill.trim()),
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddExperience}>Ajouter</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {experiences.map((experience) => (
          <Card key={experience.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{experience.poste}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{experience.entreprise}</span>
                    <span>•</span>
                    <span>{experience.localisation}</span>
                    <span>•</span>
                    <span>{experience.typeContrat}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(experience.dateDebut, "MMMM yyyy", { locale: fr })}{" "}
                    -{" "}
                    {experience.dateFin
                      ? format(experience.dateFin, "MMMM yyyy", { locale: fr })
                      : "Présent"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditExperience(experience.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteExperience(experience.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-4 text-muted-foreground">
                {experience.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {experience.competences.map((competence, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    {competence}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExperiencesPage;
