"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Globe, Award } from "lucide-react";
import { toast } from "sonner";

interface Language {
  id?: string;
  name: string;
  level: string;
  certification?: string;
  order: number;
}

interface CVLanguagesFormProps {
  data: Language[];
  onChange: (data: Language[]) => void;
}

export default function CVLanguagesForm({
  data,
  onChange,
}: CVLanguagesFormProps) {
  const [newLanguage, setNewLanguage] = useState({
    name: "",
    level: "Intermédiaire",
    certification: "",
  });

  const languageLevels = [
    {
      value: "Débutant",
      label: "Débutant (A1-A2)",
      description: "Notions de base",
    },
    {
      value: "Intermédiaire",
      label: "Intermédiaire (B1-B2)",
      description: "Conversation courante",
    },
    {
      value: "Avancé",
      label: "Avancé (C1-C2)",
      description: "Maîtrise approfondie",
    },
    { value: "Natif", label: "Langue maternelle", description: "Niveau natif" },
    {
      value: "Bilingue",
      label: "Bilingue",
      description: "Parfaitement bilingue",
    },
  ];

  const commonLanguages = [
    "Français",
    "Anglais",
    "Espagnol",
    "Allemand",
    "Italien",
    "Portugais",
    "Chinois",
    "Japonais",
    "Arabe",
    "Russe",
    "Néerlandais",
    "Suédois",
  ];

  const addLanguage = () => {
    if (!newLanguage.name.trim()) {
      toast.error("Veuillez saisir le nom de la langue");
      return;
    }

    // Vérifier si la langue existe déjà
    if (
      data.some(
        (lang) => lang.name.toLowerCase() === newLanguage.name.toLowerCase()
      )
    ) {
      toast.error("Cette langue est déjà dans votre liste");
      return;
    }

    const language: Language = {
      name: newLanguage.name.trim(),
      level: newLanguage.level,
      certification: newLanguage.certification.trim() || undefined,
      order: data.length,
    };

    onChange([...data, language]);
    setNewLanguage({ name: "", level: "Intermédiaire", certification: "" });
    toast.success("Langue ajoutée");
  };

  const removeLanguage = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
    toast.success("Langue supprimée");
  };

  const updateLanguage = (
    index: number,
    field: keyof Language,
    value: string
  ) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    onChange(updatedData);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Débutant":
        return "bg-red-100 text-red-800";
      case "Intermédiaire":
        return "bg-yellow-100 text-yellow-800";
      case "Avancé":
        return "bg-blue-100 text-blue-800";
      case "Natif":
      case "Bilingue":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Langues</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Ajoutez les langues que vous maîtrisez avec votre niveau de compétence
        </p>
      </div>

      {/* Formulaire d'ajout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter une langue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="languageName">Langue</Label>
              <Input
                id="languageName"
                value={newLanguage.name}
                onChange={(e) =>
                  setNewLanguage({ ...newLanguage, name: e.target.value })
                }
                placeholder="Nom de la langue"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLanguage();
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="languageLevel">Niveau</Label>
              <select
                id="languageLevel"
                value={newLanguage.level}
                onChange={(e) =>
                  setNewLanguage({ ...newLanguage, level: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languageLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="languageCertification">
                Certification (optionnel)
              </Label>
              <Input
                id="languageCertification"
                value={newLanguage.certification}
                onChange={(e) =>
                  setNewLanguage({
                    ...newLanguage,
                    certification: e.target.value,
                  })
                }
                placeholder="TOEIC, DELE, etc."
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={addLanguage} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions de langues courantes */}
      {data.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Langues courantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {commonLanguages.map((language) => (
                <Badge
                  key={language}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    setNewLanguage({ ...newLanguage, name: language })
                  }
                >
                  + {language}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des langues */}
      {data.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Mes langues
              <Badge variant="secondary">{data.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.map((language, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-lg">{language.name}</h4>
                      <Badge className={getLevelColor(language.level)}>
                        {language.level}
                      </Badge>
                      {language.certification && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Award className="h-3 w-3" />
                          {language.certification}
                        </Badge>
                      )}
                    </div>

                    {/* Édition en ligne */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Langue</Label>
                        <Input
                          value={language.name}
                          onChange={(e) =>
                            updateLanguage(index, "name", e.target.value)
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Niveau</Label>
                        <select
                          value={language.level}
                          onChange={(e) =>
                            updateLanguage(index, "level", e.target.value)
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-8"
                        >
                          {languageLevels.map((level) => (
                            <option key={level.value} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Certification</Label>
                        <Input
                          value={language.certification || ""}
                          onChange={(e) =>
                            updateLanguage(
                              index,
                              "certification",
                              e.target.value
                            )
                          }
                          placeholder="TOEIC, DELE, etc."
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeLanguage(index)}
                    className="ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center mb-4">
              Aucune langue ajoutée pour le moment
            </p>
            <p className="text-sm text-gray-400 text-center">
              Utilisez le formulaire ci-dessus pour ajouter vos compétences
              linguistiques
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informations sur les niveaux */}
      <Card>
        <CardHeader>
          <CardTitle>Guide des niveaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languageLevels.map((level) => (
              <div key={level.value} className="flex items-center gap-3">
                <Badge className={getLevelColor(level.value)}>
                  {level.value}
                </Badge>
                <div>
                  <p className="font-medium text-sm">{level.label}</p>
                  <p className="text-xs text-gray-500">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
