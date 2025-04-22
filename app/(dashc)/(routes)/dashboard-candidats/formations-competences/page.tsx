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
  GraduationCap,
  Languages,
  Code2,
  BookOpen,
} from "lucide-react";

interface Formation {
  id: number;
  diplome: string;
  etablissement: string;
  domaine: string;
  dateDebut: Date;
  dateFin: Date | null | undefined;
  description: string;
}

interface Competence {
  id: number;
  categorie: string;
  nom: string;
  niveau: number;
}

const FormationsCompetencesPage = () => {
  const [isAddingFormation, setIsAddingFormation] = useState(false);
  const [isAddingCompetence, setIsAddingCompetence] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formations, setFormations] = useState<Formation[]>([
    {
      id: 1,
      diplome: "Master en Informatique",
      etablissement: "Université Félix Houphouët-Boigny",
      domaine: "Informatique",
      dateDebut: new Date("2016-09-01"),
      dateFin: new Date("2018-06-30"),
      description:
        "Spécialisation en développement web et intelligence artificielle. Projet de fin d'études sur l'analyse prédictive des données.",
    },
    {
      id: 2,
      diplome: "Licence en Mathématiques",
      etablissement: "Université Félix Houphouët-Boigny",
      domaine: "Mathématiques",
      dateDebut: new Date("2013-09-01"),
      dateFin: new Date("2016-06-30"),
      description:
        "Formation générale en mathématiques avec option en statistiques et probabilités.",
    },
  ]);

  const [competences, setCompetences] = useState<Competence[]>([
    {
      id: 1,
      categorie: "Développement",
      nom: "React",
      niveau: 4,
    },
    {
      id: 2,
      categorie: "Développement",
      nom: "Node.js",
      niveau: 4,
    },
    {
      id: 3,
      categorie: "Langues",
      nom: "Anglais",
      niveau: 3,
    },
    {
      id: 4,
      categorie: "Langues",
      nom: "Français",
      niveau: 5,
    },
  ]);

  const [newFormation, setNewFormation] = useState<Partial<Formation>>({
    diplome: "",
    etablissement: "",
    domaine: "",
    dateDebut: new Date(),
    dateFin: null as Date | null,
    description: "",
  });

  const [newCompetence, setNewCompetence] = useState<Partial<Competence>>({
    categorie: "",
    nom: "",
    niveau: 1,
  });

  const handleAddFormation = () => {
    if (newFormation.diplome && newFormation.etablissement) {
      setFormations([
        {
          id: formations.length + 1,
          diplome: newFormation.diplome!,
          etablissement: newFormation.etablissement!,
          domaine: newFormation.domaine!,
          dateDebut: newFormation.dateDebut!,
          dateFin: newFormation.dateFin ?? null,
          description: newFormation.description!,
        },
        ...formations,
      ]);
      setNewFormation({
        diplome: "",
        etablissement: "",
        domaine: "",
        dateDebut: new Date(),
        dateFin: null,
        description: "",
      });
      setIsAddingFormation(false);
    }
  };

  const handleAddCompetence = () => {
    if (newCompetence.nom && newCompetence.categorie) {
      setCompetences([
        {
          id: competences.length + 1,
          categorie: newCompetence.categorie!,
          nom: newCompetence.nom!,
          niveau: newCompetence.niveau!,
        },
        ...competences,
      ]);
      setNewCompetence({
        categorie: "",
        nom: "",
        niveau: 1,
      });
      setIsAddingCompetence(false);
    }
  };

  const handleDeleteFormation = (id: number) => {
    setFormations(formations.filter((f) => f.id !== id));
  };

  const handleDeleteCompetence = (id: number) => {
    setCompetences(competences.filter((c) => c.id !== id));
  };

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Formations</h1>
          <Button onClick={() => setIsAddingFormation(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une formation
          </Button>
        </div>

        {isAddingFormation && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diplome">Diplôme</Label>
                    <Input
                      id="diplome"
                      value={newFormation.diplome}
                      onChange={(e) =>
                        setNewFormation({
                          ...newFormation,
                          diplome: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="etablissement">Établissement</Label>
                    <Input
                      id="etablissement"
                      value={newFormation.etablissement}
                      onChange={(e) =>
                        setNewFormation({
                          ...newFormation,
                          etablissement: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domaine">Domaine d'études</Label>
                  <Input
                    id="domaine"
                    value={newFormation.domaine}
                    onChange={(e) =>
                      setNewFormation({
                        ...newFormation,
                        domaine: e.target.value,
                      })
                    }
                  />
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
                          {newFormation.dateDebut ? (
                            format(newFormation.dateDebut, "PPP", {
                              locale: fr,
                            })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newFormation.dateDebut}
                          onSelect={(date) =>
                            setNewFormation({
                              ...newFormation,
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
                          {newFormation.dateFin ? (
                            format(newFormation.dateFin, "PPP", { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newFormation.dateFin ?? undefined}
                          onSelect={(date) =>
                            setNewFormation({
                              ...newFormation,
                              dateFin: date ?? null,
                            })
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
                    value={newFormation.description}
                    onChange={(e) =>
                      setNewFormation({
                        ...newFormation,
                        description: e.target.value,
                      })
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingFormation(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleAddFormation}>Ajouter</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {formations.map((formation) => (
            <Card key={formation.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {formation.diplome}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>{formation.etablissement}</span>
                      <span>•</span>
                      <span>{formation.domaine}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(formation.dateDebut, "MMMM yyyy", { locale: fr })}{" "}
                      -{" "}
                      {formation.dateFin
                        ? format(formation.dateFin, "MMMM yyyy", { locale: fr })
                        : "Présent"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingId(formation.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteFormation(formation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="mt-4 text-muted-foreground">
                  {formation.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Compétences</h1>
          <Button onClick={() => setIsAddingCompetence(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une compétence
          </Button>
        </div>

        {isAddingCompetence && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categorie">Catégorie</Label>
                    <Select
                      value={newCompetence.categorie}
                      onValueChange={(value) =>
                        setNewCompetence({
                          ...newCompetence,
                          categorie: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Développement">
                          Développement
                        </SelectItem>
                        <SelectItem value="Langues">Langues</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Gestion">Gestion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <Input
                      id="nom"
                      value={newCompetence.nom}
                      onChange={(e) =>
                        setNewCompetence({
                          ...newCompetence,
                          nom: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Niveau</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((niveau) => (
                      <Button
                        key={niveau}
                        variant={
                          newCompetence.niveau === niveau
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setNewCompetence({
                            ...newCompetence,
                            niveau,
                          })
                        }
                      >
                        {niveau}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingCompetence(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleAddCompetence}>Ajouter</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competences.map((competence) => (
            <Card key={competence.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{competence.nom}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {competence.categorie === "Développement" ? (
                        <Code2 className="h-4 w-4" />
                      ) : competence.categorie === "Langues" ? (
                        <Languages className="h-4 w-4" />
                      ) : (
                        <BookOpen className="h-4 w-4" />
                      )}
                      <span>{competence.categorie}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((niveau) => (
                        <div
                          key={niveau}
                          className={`h-2 w-2 rounded-full ${
                            niveau <= competence.niveau
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingId(competence.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteCompetence(competence.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormationsCompetencesPage;
