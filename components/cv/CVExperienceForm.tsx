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
  Briefcase,
  Calendar,
  MapPin,
  Building,
  Edit,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Experience {
  id?: string;
  position: string;
  company: string;
  location?: string;
  contractType?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements?: string;
  skills?: string[];
  order: number;
}

interface CVExperienceFormProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export default function CVExperienceForm({
  data,
  onChange,
}: CVExperienceFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newSkill, setNewSkill] = useState("");

  const addExperience = () => {
    const newExperience: Experience = {
      position: "",
      company: "",
      location: "",
      contractType: "CDI",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      achievements: "",
      skills: [],
      order: data.length,
    };
    onChange([...data, newExperience]);
    setEditingIndex(data.length);
  };

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: any
  ) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    onChange(updatedData);
  };

  const removeExperience = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
    setEditingIndex(null);
    toast.success("Expérience supprimée");
  };

  const addSkill = (experienceIndex: number) => {
    if (newSkill.trim()) {
      const experience = data[experienceIndex];
      const skills = experience.skills || [];
      if (!skills.includes(newSkill.trim())) {
        updateExperience(experienceIndex, "skills", [
          ...skills,
          newSkill.trim(),
        ]);
        setNewSkill("");
      }
    }
  };

  const removeSkill = (experienceIndex: number, skillIndex: number) => {
    const experience = data[experienceIndex];
    const skills = experience.skills || [];
    const updatedSkills = skills.filter((_, i) => i !== skillIndex);
    updateExperience(experienceIndex, "skills", updatedSkills);
  };

  const contractTypes = [
    "CDI",
    "CDD",
    "Stage",
    "Alternance",
    "Freelance",
    "Intérim",
    "Autre",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Expériences professionnelles
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Ajoutez vos expériences professionnelles en commençant par la plus
            récente
          </p>
        </div>
        <Button onClick={addExperience} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une expérience
        </Button>
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center mb-4">
              Aucune expérience ajoutée pour le moment
            </p>
            <Button onClick={addExperience} variant="outline">
              Ajouter votre première expérience
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((experience, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    {experience.position || "Nouvelle expérience"}
                    {experience.company && (
                      <span className="text-sm font-normal text-gray-500">
                        chez {experience.company}
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
                      onClick={() => removeExperience(index)}
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
                        <Label htmlFor={`position-${index}`}>Poste *</Label>
                        <Input
                          id={`position-${index}`}
                          value={experience.position}
                          onChange={(e) =>
                            updateExperience(index, "position", e.target.value)
                          }
                          placeholder="Développeur Full Stack"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`company-${index}`}>Entreprise *</Label>
                        <Input
                          id={`company-${index}`}
                          value={experience.company}
                          onChange={(e) =>
                            updateExperience(index, "company", e.target.value)
                          }
                          placeholder="Nom de l'entreprise"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`location-${index}`}>Lieu</Label>
                        <Input
                          id={`location-${index}`}
                          value={experience.location || ""}
                          onChange={(e) =>
                            updateExperience(index, "location", e.target.value)
                          }
                          placeholder="Paris, France"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`contractType-${index}`}>
                          Type de contrat
                        </Label>
                        <select
                          id={`contractType-${index}`}
                          value={experience.contractType || "CDI"}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "contractType",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {contractTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
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
                            experience.startDate
                              ? new Date(experience.startDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            updateExperience(
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
                            experience.endDate
                              ? new Date(experience.endDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "endDate",
                              e.target.value
                                ? new Date(e.target.value).toISOString()
                                : ""
                            )
                          }
                          disabled={experience.isCurrent}
                        />
                      </div>
                      <div className="flex items-center space-x-2 mt-6">
                        <Checkbox
                          id={`isCurrent-${index}`}
                          checked={experience.isCurrent}
                          onCheckedChange={(checked) => {
                            updateExperience(index, "isCurrent", checked);
                            if (checked) {
                              updateExperience(index, "endDate", "");
                            }
                          }}
                        />
                        <Label htmlFor={`isCurrent-${index}`}>
                          Poste actuel
                        </Label>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor={`description-${index}`}>
                        Description du poste
                      </Label>
                      <Textarea
                        id={`description-${index}`}
                        value={experience.description || ""}
                        onChange={(e) =>
                          updateExperience(index, "description", e.target.value)
                        }
                        placeholder="Décrivez vos missions et responsabilités..."
                        rows={3}
                      />
                    </div>

                    {/* Réalisations */}
                    <div>
                      <Label htmlFor={`achievements-${index}`}>
                        Réalisations et accomplissements
                      </Label>
                      <Textarea
                        id={`achievements-${index}`}
                        value={experience.achievements || ""}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "achievements",
                            e.target.value
                          )
                        }
                        placeholder="Listez vos principales réalisations..."
                        rows={3}
                      />
                    </div>

                    {/* Compétences */}
                    <div>
                      <Label>Compétences utilisées</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Ajouter une compétence"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill(index);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => addSkill(index)}
                          size="sm"
                        >
                          Ajouter
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(experience.skills || []).map((skill, skillIndex) => (
                          <Badge
                            key={skillIndex}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {skill}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeSkill(index, skillIndex)}
                            />
                          </Badge>
                        ))}
                      </div>
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
                        {experience.startDate && (
                          <>
                            {new Date(experience.startDate).toLocaleDateString(
                              "fr-FR",
                              {
                                month: "long",
                                year: "numeric",
                              }
                            )}
                            {experience.isCurrent
                              ? " - Aujourd'hui"
                              : experience.endDate
                                ? ` - ${new Date(
                                    experience.endDate
                                  ).toLocaleDateString("fr-FR", {
                                    month: "long",
                                    year: "numeric",
                                  })}`
                                : ""}
                          </>
                        )}
                      </div>
                      {experience.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {experience.location}
                        </div>
                      )}
                      {experience.contractType && (
                        <Badge variant="outline">
                          {experience.contractType}
                        </Badge>
                      )}
                    </div>

                    {experience.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {experience.description}
                      </p>
                    )}

                    {experience.skills && experience.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {experience.skills.map((skill, skillIndex) => (
                          <Badge
                            key={skillIndex}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
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
