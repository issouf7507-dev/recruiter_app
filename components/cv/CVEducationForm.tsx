"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  GraduationCap,
  Calendar,
  MapPin,
  Building,
  Edit,
  Award,
} from "lucide-react";
import { toast } from "sonner";

interface Education {
  id?: string;
  degree: string;
  institution: string;
  field?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  grade?: string;
  honors?: string;
  order: number;
}

interface CVEducationFormProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export default function CVEducationForm({
  data,
  onChange,
}: CVEducationFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addEducation = () => {
    const newEducation: Education = {
      degree: "",
      institution: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      grade: "",
      honors: "",
      order: data.length,
    };
    onChange([...data, newEducation]);
    setEditingIndex(data.length);
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: any
  ) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    onChange(updatedData);
  };

  const removeEducation = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
    setEditingIndex(null);
    toast.success("Formation supprimée");
  };

  const degreeTypes = [
    "Baccalauréat",
    "BTS",
    "DUT",
    "Licence",
    "Bachelor",
    "Master",
    "Mastère",
    "MBA",
    "Doctorat",
    "Diplôme d'ingénieur",
    "Autre",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formation et éducation</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Ajoutez vos formations en commençant par la plus récente
          </p>
        </div>
        <Button onClick={addEducation} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une formation
        </Button>
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center mb-4">
              Aucune formation ajoutée pour le moment
            </p>
            <Button onClick={addEducation} variant="outline">
              Ajouter votre première formation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((education, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {education.degree || "Nouvelle formation"}
                    {education.institution && (
                      <span className="text-sm font-normal text-gray-500">
                        à {education.institution}
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEditingIndex(editingIndex === index ? null : index)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeEducation(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {editingIndex === index ? (
                  <div className="space-y-4">
                    {/* Informations de base */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`degree-${index}`}>Diplôme *</Label>
                        <select
                          id={`degree-${index}`}
                          value={education.degree}
                          onChange={(e) =>
                            updateEducation(index, "degree", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionner un diplôme</option>
                          {degreeTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`institution-${index}`}>
                          Établissement *
                        </Label>
                        <Input
                          id={`institution-${index}`}
                          value={education.institution}
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "institution",
                              e.target.value
                            )
                          }
                          placeholder="Nom de l'établissement"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`field-${index}`}>
                          Domaine d'étude
                        </Label>
                        <Input
                          id={`field-${index}`}
                          value={education.field || ""}
                          onChange={(e) =>
                            updateEducation(index, "field", e.target.value)
                          }
                          placeholder="Informatique, Marketing, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor={`location-${index}`}>Lieu</Label>
                        <Input
                          id={`location-${index}`}
                          value={education.location || ""}
                          onChange={(e) =>
                            updateEducation(index, "location", e.target.value)
                          }
                          placeholder="Paris, France"
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`startDate-${index}`}>
                          Date de début *
                        </Label>
                        <Input
                          id={`startDate-${index}`}
                          type="date"
                          value={
                            education.startDate
                              ? new Date(education.startDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "startDate",
                              e.target.value
                                ? new Date(e.target.value).toISOString()
                                : ""
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`endDate-${index}`}>Date de fin</Label>
                        <Input
                          id={`endDate-${index}`}
                          type="date"
                          value={
                            education.endDate
                              ? new Date(education.endDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "endDate",
                              e.target.value
                                ? new Date(e.target.value).toISOString()
                                : ""
                            )
                          }
                          disabled={education.isCurrent}
                        />
                      </div>
                      <div className="flex items-center space-x-2 mt-6">
                        <Checkbox
                          id={`isCurrent-${index}`}
                          checked={education.isCurrent}
                          onCheckedChange={(checked) => {
                            updateEducation(index, "isCurrent", checked);
                            if (checked) {
                              updateEducation(index, "endDate", "");
                            }
                          }}
                        />
                        <Label htmlFor={`isCurrent-${index}`}>
                          Formation en cours
                        </Label>
                      </div>
                    </div>

                    {/* Notes et mentions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`grade-${index}`}>Note/Mention</Label>
                        <Input
                          id={`grade-${index}`}
                          value={education.grade || ""}
                          onChange={(e) =>
                            updateEducation(index, "grade", e.target.value)
                          }
                          placeholder="Mention Bien, 15/20, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor={`honors-${index}`}>Distinctions</Label>
                        <Input
                          id={`honors-${index}`}
                          value={education.honors || ""}
                          onChange={(e) =>
                            updateEducation(index, "honors", e.target.value)
                          }
                          placeholder="Prix d'excellence, Bourse, etc."
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor={`description-${index}`}>
                        Description (optionnel)
                      </Label>
                      <Textarea
                        id={`description-${index}`}
                        value={education.description || ""}
                        onChange={(e) =>
                          updateEducation(index, "description", e.target.value)
                        }
                        placeholder="Décrivez les matières principales, projets réalisés, etc."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => setEditingIndex(null)}
                        variant="outline"
                      >
                        Terminer l'édition
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {education.startDate && (
                          <>
                            {new Date(education.startDate).toLocaleDateString(
                              "fr-FR",
                              {
                                month: "long",
                                year: "numeric",
                              }
                            )}
                            {education.isCurrent
                              ? " - En cours"
                              : education.endDate
                                ? ` - ${new Date(
                                    education.endDate
                                  ).toLocaleDateString("fr-FR", {
                                    month: "long",
                                    year: "numeric",
                                  })}`
                                : ""}
                          </>
                        )}
                      </div>
                      {education.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {education.location}
                        </div>
                      )}
                    </div>

                    {education.field && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Domaine :</strong> {education.field}
                      </p>
                    )}

                    {education.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {education.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {education.grade && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Award className="h-3 w-3" />
                          {education.grade}
                        </Badge>
                      )}
                      {education.honors && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Award className="h-3 w-3" />
                          {education.honors}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
