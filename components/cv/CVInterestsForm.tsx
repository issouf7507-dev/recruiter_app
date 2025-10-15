"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Heart, Edit, X } from "lucide-react";
import { toast } from "sonner";

interface Interest {
  id?: string;
  name: string;
  description?: string;
  order: number;
}

interface CVInterestsFormProps {
  data: Interest[];
  onChange: (data: Interest[]) => void;
}

export default function CVInterestsForm({
  data,
  onChange,
}: CVInterestsFormProps) {
  const [newInterest, setNewInterest] = useState({
    name: "",
    description: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const commonInterests = [
    { name: "Sport", description: "Football, tennis, course à pied" },
    { name: "Lecture", description: "Romans, essais, développement personnel" },
    { name: "Voyage", description: "Découverte de nouvelles cultures" },
    {
      name: "Photographie",
      description: "Portrait, paysage, street photography",
    },
    { name: "Cuisine", description: "Gastronomie française et internationale" },
    { name: "Musique", description: "Écoute, pratique d'instruments" },
    { name: "Cinéma", description: "Films d'auteur, documentaires" },
    {
      name: "Technologie",
      description: "Veille technologique, nouvelles tendances",
    },
    { name: "Bénévolat", description: "Engagement associatif" },
    { name: "Jardinage", description: "Potager, plantes d'intérieur" },
    { name: "Art", description: "Peinture, sculpture, expositions" },
    { name: "Jeux vidéo", description: "Stratégie, aventure, multijoueur" },
  ];

  const addInterest = () => {
    if (!newInterest.name.trim()) {
      toast.error("Veuillez saisir le nom du centre d'intérêt");
      return;
    }

    // Vérifier si l'intérêt existe déjà
    if (
      data.some(
        (interest) =>
          interest.name.toLowerCase() === newInterest.name.toLowerCase()
      )
    ) {
      toast.error("Ce centre d'intérêt est déjà dans votre liste");
      return;
    }

    const interest: Interest = {
      name: newInterest.name.trim(),
      description: newInterest.description.trim() || undefined,
      order: data.length,
    };

    onChange([...data, interest]);
    setNewInterest({ name: "", description: "" });
    toast.success("Centre d'intérêt ajouté");
  };

  const removeInterest = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
    setEditingIndex(null);
    toast.success("Centre d'intérêt supprimé");
  };

  const updateInterest = (
    index: number,
    field: keyof Interest,
    value: string
  ) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    onChange(updatedData);
  };

  const addCommonInterest = (interest: {
    name: string;
    description: string;
  }) => {
    if (
      data.some(
        (item) => item.name.toLowerCase() === interest.name.toLowerCase()
      )
    ) {
      toast.error("Ce centre d'intérêt est déjà dans votre liste");
      return;
    }

    const newInterestItem: Interest = {
      name: interest.name,
      description: interest.description,
      order: data.length,
    };

    onChange([...data, newInterestItem]);
    toast.success("Centre d'intérêt ajouté");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Centres d'intérêt</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Ajoutez vos centres d'intérêt et loisirs pour personnaliser votre
          profil
        </p>
      </div>

      {/* Formulaire d'ajout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter un centre d'intérêt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interestName">Nom du centre d'intérêt</Label>
                <Input
                  id="interestName"
                  value={newInterest.name}
                  onChange={(e) =>
                    setNewInterest({ ...newInterest, name: e.target.value })
                  }
                  placeholder="Sport, Lecture, Voyage..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="interestDescription">
                  Description (optionnel)
                </Label>
                <Input
                  id="interestDescription"
                  value={newInterest.description}
                  onChange={(e) =>
                    setNewInterest({
                      ...newInterest,
                      description: e.target.value,
                    })
                  }
                  placeholder="Précisez votre pratique..."
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={addInterest} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions d'intérêts courants */}
      {data.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggestions de centres d'intérêt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {commonInterests.map((interest, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => addCommonInterest(interest)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{interest.name}</h4>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">
                    {interest.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des centres d'intérêt */}
      {data.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Mes centres d'intérêt
              <Badge variant="secondary">{data.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.map((interest, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    {editingIndex === index ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`edit-name-${index}`}>Nom</Label>
                          <Input
                            id={`edit-name-${index}`}
                            value={interest.name}
                            onChange={(e) =>
                              updateInterest(index, "name", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-description-${index}`}>
                            Description
                          </Label>
                          <Textarea
                            id={`edit-description-${index}`}
                            value={interest.description || ""}
                            onChange={(e) =>
                              updateInterest(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Décrivez votre pratique ou votre passion..."
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setEditingIndex(null)}
                            variant="outline"
                          >
                            Terminer
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-medium text-lg mb-1">
                          {interest.name}
                        </h4>
                        {interest.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {interest.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setEditingIndex(editingIndex === index ? null : index)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeInterest(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center mb-4">
              Aucun centre d'intérêt ajouté pour le moment
            </p>
            <p className="text-sm text-gray-400 text-center">
              Les centres d'intérêt permettent aux recruteurs de mieux vous
              connaître
            </p>
          </CardContent>
        </Card>
      )}

      {/* Conseils */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Conseils pour vos centres d'intérêt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              • Choisissez des centres d'intérêt qui reflètent votre
              personnalité
            </p>
            <p>
              • Privilégiez ceux qui peuvent être pertinents pour le poste visé
            </p>
            <p>• Évitez les activités trop controversées ou personnelles</p>
            <p>
              • Soyez précis dans vos descriptions (niveau de pratique,
              réalisations)
            </p>
            <p>• Limitez-vous à 4-6 centres d'intérêt maximum</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
