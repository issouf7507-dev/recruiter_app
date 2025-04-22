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
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Pencil,
  Trash2,
  Target,
  Trophy,
  BookOpen,
  Users,
  Briefcase,
} from "lucide-react";

interface Objectif {
  id: number;
  titre: string;
  description: string;
  categorie: string;
  dateLimite: Date;
  progression: number;
  etapes: string[];
}

const SuiviCarrierePage = () => {
  const [objectifs, setObjectifs] = useState<Objectif[]>([
    {
      id: 1,
      titre: "Devenir Lead Developer",
      description:
        "Atteindre un poste de Lead Developer dans une entreprise tech innovante",
      categorie: "Évolution professionnelle",
      dateLimite: new Date("2025-12-31"),
      progression: 60,
      etapes: [
        "Acquérir des compétences en gestion d'équipe",
        "Développer des projets complexes",
        "Obtenir des certifications pertinentes",
      ],
    },
    {
      id: 2,
      titre: "Maîtriser React Native",
      description:
        "Développer des applications mobiles cross-platform avec React Native",
      categorie: "Compétences techniques",
      dateLimite: new Date("2024-06-30"),
      progression: 30,
      etapes: [
        "Suivre une formation complète",
        "Créer 3 applications de démonstration",
        "Contribuer à un projet open source",
      ],
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newObjectif, setNewObjectif] = useState<Partial<Objectif>>({
    titre: "",
    description: "",
    categorie: "",
    dateLimite: new Date(),
    progression: 0,
    etapes: [],
  });

  const handleAddObjectif = () => {
    if (newObjectif.titre && newObjectif.description) {
      setObjectifs([
        {
          id: objectifs.length + 1,
          titre: newObjectif.titre!,
          description: newObjectif.description!,
          categorie: newObjectif.categorie!,
          dateLimite: newObjectif.dateLimite!,
          progression: 0,
          etapes: newObjectif.etapes!,
        },
        ...objectifs,
      ]);
      setNewObjectif({
        titre: "",
        description: "",
        categorie: "",
        dateLimite: new Date(),
        progression: 0,
        etapes: [],
      });
      setIsAdding(false);
    }
  };

  const handleDelete = (id: number) => {
    setObjectifs(objectifs.filter((obj) => obj.id !== id));
  };

  const getCategoryIcon = (categorie: string) => {
    switch (categorie) {
      case "Évolution professionnelle":
        return <Briefcase className="h-5 w-5" />;
      case "Compétences techniques":
        return <BookOpen className="h-5 w-5" />;
      case "Réseau professionnel":
        return <Users className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Suivi de carrière</h1>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un objectif
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre de l'objectif</Label>
                <Input
                  id="titre"
                  value={newObjectif.titre}
                  onChange={(e) =>
                    setNewObjectif({
                      ...newObjectif,
                      titre: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newObjectif.description}
                  onChange={(e) =>
                    setNewObjectif({
                      ...newObjectif,
                      description: e.target.value,
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categorie">Catégorie</Label>
                <Select
                  value={newObjectif.categorie}
                  onValueChange={(value) =>
                    setNewObjectif({
                      ...newObjectif,
                      categorie: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Évolution professionnelle">
                      Évolution professionnelle
                    </SelectItem>
                    <SelectItem value="Compétences techniques">
                      Compétences techniques
                    </SelectItem>
                    <SelectItem value="Réseau professionnel">
                      Réseau professionnel
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddObjectif}>Ajouter</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {objectifs.map((objectif) => (
          <Card key={objectif.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  {getCategoryIcon(objectif.categorie)}
                  <div>
                    <h3 className="font-semibold">{objectif.titre}</h3>
                    <div className="text-sm text-muted-foreground">
                      {objectif.categorie}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(objectif.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-4 text-muted-foreground">
                {objectif.description}
              </p>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progression</span>
                  <span>{objectif.progression}%</span>
                </div>
                <Progress value={objectif.progression} />
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Étapes à suivre</h4>
                <ul className="space-y-2">
                  {objectif.etapes.map((etape, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          index <
                          (objectif.progression / 100) * objectif.etapes.length
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      {etape}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Date limite : {objectif.dateLimite.toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SuiviCarrierePage;
