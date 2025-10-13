"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Trash2,
  Award,
  Code,
  Users,
  Globe,
  Settings,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Skill {
  id?: string;
  name: string;
  category: string;
  level: number;
  order: number;
}

interface CVSkillsFormProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

export default function CVSkillsForm({ data, onChange }: CVSkillsFormProps) {
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "technical",
    level: 3,
  });

  const skillCategories = [
    {
      id: "technical",
      label: "Techniques",
      icon: Code,
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "soft",
      label: "Savoir-être",
      icon: Users,
      color: "bg-green-100 text-green-800",
    },
    {
      id: "language",
      label: "Langues",
      icon: Globe,
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "other",
      label: "Autres",
      icon: Settings,
      color: "bg-gray-100 text-gray-800",
    },
  ];

  const levelLabels = [
    "Débutant",
    "Novice",
    "Intermédiaire",
    "Confirmé",
    "Expert",
  ];

  const addSkill = () => {
    if (!newSkill.name.trim()) {
      toast.error("Veuillez saisir le nom de la compétence");
      return;
    }

    const skill: Skill = {
      name: newSkill.name.trim(),
      category: newSkill.category,
      level: newSkill.level,
      order: data.length,
    };

    onChange([...data, skill]);
    setNewSkill({ name: "", category: "technical", level: 3 });
    toast.success("Compétence ajoutée");
  };

  const removeSkill = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
    toast.success("Compétence supprimée");
  };

  const updateSkillLevel = (index: number, level: number) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], level };
    onChange(updatedData);
  };

  const getSkillsByCategory = (category: string) => {
    return data.filter((skill) => skill.category === category);
  };

  const getCategoryInfo = (categoryId: string) => {
    return skillCategories.find((cat) => cat.id === categoryId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Compétences</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Ajoutez vos compétences techniques et personnelles avec leur niveau de
          maîtrise
        </p>
      </div>

      {/* Formulaire d'ajout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter une compétence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="skillName">Nom de la compétence</Label>
              <Input
                id="skillName"
                value={newSkill.name}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, name: e.target.value })
                }
                placeholder="JavaScript, Leadership, etc."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="skillCategory">Catégorie</Label>
              <select
                id="skillCategory"
                value={newSkill.category}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {skillCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="skillLevel">
                Niveau ({levelLabels[newSkill.level - 1]})
              </Label>
              <div className="space-y-2">
                <input
                  type="range"
                  id="skillLevel"
                  min="1"
                  max="5"
                  value={newSkill.level}
                  onChange={(e) =>
                    setNewSkill({
                      ...newSkill,
                      level: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <Progress value={newSkill.level * 20} className="h-2" />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={addSkill} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Affichage des compétences par catégorie */}
      {skillCategories.map((category) => {
        const categorySkills = getSkillsByCategory(category.id);
        const CategoryIcon = category.icon;

        if (categorySkills.length === 0) return null;

        return (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CategoryIcon className="h-5 w-5" />
                {category.label}
                <Badge variant="secondary">{categorySkills.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categorySkills.map((skill, skillIndex) => {
                  const globalIndex = data.findIndex((s) => s === skill);
                  return (
                    <div
                      key={skillIndex}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{skill.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {levelLabels[skill.level - 1]}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeSkill(globalIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={skill.level * 20}
                            className="flex-1 h-2"
                          />
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <button
                                key={level}
                                onClick={() =>
                                  updateSkillLevel(globalIndex, level)
                                }
                                className={`w-6 h-6 rounded-full border-2 text-xs font-medium transition-colors ${
                                  skill.level >= level
                                    ? "bg-blue-500 border-blue-500 text-white"
                                    : "border-gray-300 text-gray-400 hover:border-gray-400"
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center mb-4">
              Aucune compétence ajoutée pour le moment
            </p>
            <p className="text-sm text-gray-400 text-center">
              Utilisez le formulaire ci-dessus pour ajouter vos compétences
            </p>
          </CardContent>
        </Card>
      )}

      {/* Suggestions de compétences */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggestions de compétences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">
                  Compétences techniques populaires
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "JavaScript",
                    "Python",
                    "React",
                    "Node.js",
                    "SQL",
                    "Git",
                    "Docker",
                    "AWS",
                  ].map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() =>
                        setNewSkill({
                          ...newSkill,
                          name: skill,
                          category: "technical",
                        })
                      }
                    >
                      + {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Compétences personnelles</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Leadership",
                    "Communication",
                    "Travail d'équipe",
                    "Résolution de problèmes",
                    "Créativité",
                    "Adaptabilité",
                  ].map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() =>
                        setNewSkill({
                          ...newSkill,
                          name: skill,
                          category: "soft",
                        })
                      }
                    >
                      + {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
