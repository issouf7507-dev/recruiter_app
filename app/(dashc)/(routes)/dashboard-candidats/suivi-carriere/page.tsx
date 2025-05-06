"use client";

import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { z } from "zod";
import { useUserStore } from "@/store/userStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { fetchData, postData } from "@/utils/utilts";
// import axios from "axios";

interface Objectif {
  id: string;
  titre: string;
  description: string;
  categorie: string;
  dateLimite: Date;
  progression: number;
  etapes: string[];
}

const suiviCarriereSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  categorie: z.string().min(1, "La catégorie est requise"),
  dateLimite: z.date({
    required_error: "La date limite est requise",
  }),
  progression: z.number().min(0).max(100),
  etapes: z.array(z.string()),
});

type SuiviCarriereFormData = z.infer<typeof suiviCarriereSchema>;

const SuiviCarrierePage = () => {
  const { candidat } = useUserStore();
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingObjectif, setEditingObjectif] = useState<Partial<Objectif>>({});
  const [newEtape, setNewEtape] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<SuiviCarriereFormData>({
    resolver: zodResolver(suiviCarriereSchema),
    defaultValues: {
      titre: "",
      description: "",
      categorie: "",
      dateLimite: new Date(),
      progression: 0,
      etapes: [],
    },
  });

  const { data: objectifsData, refetch } = useQuery({
    queryKey: ["objectifs"],
    queryFn: () => fetchData("/api/candidat/objectifs"),
  });

  // console.log(objectifsData);

  const addObjectifMutation = useMutation({
    mutationFn: (data: SuiviCarriereFormData) =>
      postData(data, "/api/candidat/objectifs"),
    onSuccess(data, variables, context) {
      toast.success("Objectif ajouté avec succès");
      refetch();
      reset();
      setIsAdding(false);
    },
    onError(error, variables, context) {
      toast.error("Erreur lors de l'ajout de l'objectif");
    },
  });

  const handleAddObjectif = async (data: SuiviCarriereFormData) => {
    // console.log("Form data:", data);
    addObjectifMutation.mutate(data);
    // try {
    //   console.log("Form data:", data);
    //   // Simulation d'ajout d'objectif (à remplacer par votre API)
    //   const newObjectif: Objectif = {
    //     id: Math.random().toString(36).substr(2, 9),
    //     ...data,
    //   };
    //   setObjectifs([newObjectif, ...objectifs]);
    //   reset();
    //   setIsAdding(false);
    //   toast.success("Objectif ajouté avec succès");
    // } catch (error) {
    //   console.error("Error submitting form:", error);
    //   toast.error("Erreur lors de l'ajout de l'objectif");
    // }
  };

  useEffect(() => {
    fetchObjectifs();
  }, []);

  const fetchObjectifs = async () => {
    // try {
    //   const response = await axios.get("/api/objectifs");
    //   setObjectifs(response.data);
    // } catch (error) {
    //   toast.error("Erreur lors du chargement des objectifs");
    // }
  };

  const handleEdit = (objectif: Objectif) => {
    setIsEditing(objectif.id);
    setEditingObjectif({ ...objectif });
  };

  const handleUpdateObjectif = async () => {
    // try {
    //   if (editingObjectif.titre && editingObjectif.description) {
    //     const response = await axios.patch(
    //       `/api/objectifs/${editingObjectif.id}`,
    //       editingObjectif
    //     );
    //     setObjectifs(
    //       objectifs.map((obj) =>
    //         obj.id === editingObjectif.id ? response.data : obj
    //       )
    //     );
    //     setIsEditing(null);
    //     setEditingObjectif({});
    //     toast.success("Objectif mis à jour avec succès");
    //   }
    // } catch (error) {
    //   toast.error("Erreur lors de la mise à jour de l'objectif");
    // }
  };

  const handleDelete = async (id: string) => {
    // try {
    //   await axios.delete(`/api/objectifs/${id}`);
    //   setObjectifs(objectifs.filter((obj) => obj.id !== id));
    //   toast.success("Objectif supprimé avec succès");
    // } catch (error) {
    //   toast.error("Erreur lors de la suppression de l'objectif");
    // }
  };

  const handleAddEtape = async (objectifId: string) => {
    // try {
    //   if (newEtape.trim()) {
    //     const objectif = objectifs.find((obj) => obj.id === objectifId);
    //     if (objectif) {
    //       const updatedEtapes = [...objectif.etapes, newEtape.trim()];
    //       const response = await axios.patch(`/api/objectifs/${objectifId}`, {
    //         etapes: updatedEtapes,
    //       });
    //       setObjectifs(
    //         objectifs.map((obj) =>
    //           obj.id === objectifId ? response.data : obj
    //         )
    //       );
    //       setNewEtape("");
    //       toast.success("Étape ajoutée avec succès");
    //     }
    //   }
    // } catch (error) {
    //   toast.error("Erreur lors de l'ajout de l'étape");
    // }
  };

  const handleDeleteEtape = async (objectifId: string, etapeIndex: number) => {
    // try {
    //   const objectif = objectifs.find((obj) => obj.id === objectifId);
    //   if (objectif) {
    //     const updatedEtapes = objectif.etapes.filter(
    //       (_, index) => index !== etapeIndex
    //     );
    //     const response = await axios.patch(`/api/objectifs/${objectifId}`, {
    //       etapes: updatedEtapes,
    //     });
    //     setObjectifs(
    //       objectifs.map((obj) => (obj.id === objectifId ? response.data : obj))
    //     );
    //     toast.success("Étape supprimée avec succès");
    //   }
    // } catch (error) {
    //   toast.error("Erreur lors de la suppression de l'étape");
    // }
  };

  const handleUpdateProgression = async (
    objectifId: string,
    newProgression: number
  ) => {
    // try {
    //   const response = await axios.patch(`/api/objectifs/${objectifId}`, {
    //     progression: newProgression,
    //   });
    //   setObjectifs(
    //     objectifs.map((obj) => (obj.id === objectifId ? response.data : obj))
    //   );
    // } catch (error) {
    //   toast.error("Erreur lors de la mise à jour de la progression");
    // }
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
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un objectif
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardContent className="p-6">
            <form
              onSubmit={handleSubmit(handleAddObjectif)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="titre">Titre de l'objectif</Label>
                <Input
                  id="titre"
                  {...register("titre")}
                  className={cn(errors.titre && "border-red-500")}
                />
                {errors.titre && (
                  <p className="text-sm text-red-500">{errors.titre.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  className={cn(errors.description && "border-red-500")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Select
                    onValueChange={(value) => setValue("categorie", value)}
                    defaultValue={watch("categorie")}
                  >
                    <SelectTrigger
                      className={cn(
                        errors.categorie ? "border-red-500 w-full" : "w-full"
                      )}
                    >
                      <SelectValue
                        placeholder="Sélectionner une catégorie"
                        className="w-full"
                      />
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
                  {errors.categorie && (
                    <p className="text-sm text-red-500">
                      {errors.categorie.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateLimite">Date limite</Label>
                  <Input
                    id="dateLimite"
                    type="date"
                    {...register("dateLimite", {
                      valueAsDate: true,
                      required: "La date limite est requise",
                    })}
                    className={cn(errors.dateLimite && "border-red-500")}
                  />
                  {errors.dateLimite && (
                    <p className="text-sm text-red-500">
                      {errors.dateLimite.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="progression">Progression (%)</Label>
                  <Input
                    id="progression"
                    type="number"
                    min="0"
                    max="100"
                    {...register("progression", {
                      valueAsNumber: true,
                      required: "La progression est requise",
                      min: {
                        value: 0,
                        message: "La progression doit être entre 0 et 100",
                      },
                      max: {
                        value: 100,
                        message: "La progression doit être entre 0 et 100",
                      },
                    })}
                    className={cn(errors.progression && "border-red-500")}
                  />
                  {errors.progression && (
                    <p className="text-sm text-red-500">
                      {errors.progression.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    reset();
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit">Ajouter</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {objectifs.map((objectif) => (
          <Card key={objectif.id}>
            <CardContent className="p-6">
              {isEditing === objectif.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-titre">Titre de l'objectif</Label>
                    <Input
                      id="edit-titre"
                      value={editingObjectif.titre}
                      onChange={(e) =>
                        setEditingObjectif({
                          ...editingObjectif,
                          titre: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editingObjectif.description}
                      onChange={(e) =>
                        setEditingObjectif({
                          ...editingObjectif,
                          description: e.target.value,
                        })
                      }
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-categorie">Catégorie</Label>
                    <Select
                      value={editingObjectif.categorie}
                      onValueChange={(value) =>
                        setEditingObjectif({
                          ...editingObjectif,
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

                  <div className="space-y-2">
                    <Label htmlFor="edit-progression">Progression (%)</Label>
                    <Input
                      id="edit-progression"
                      type="number"
                      min="0"
                      max="100"
                      value={editingObjectif.progression}
                      onChange={(e) =>
                        setEditingObjectif({
                          ...editingObjectif,
                          progression: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(null)}
                    >
                      Annuler
                    </Button>
                    <Button onClick={handleUpdateObjectif}>Enregistrer</Button>
                  </div>
                </div>
              ) : (
                <>
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
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(objectif)}
                      >
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
                    <div className="mt-2">
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={objectif.progression}
                        onChange={(e) =>
                          handleUpdateProgression(
                            objectif.id,
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Étapes à suivre</h4>
                    <ul className="space-y-2">
                      {objectif.etapes.map((etape, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                index <
                                (objectif.progression / 100) *
                                  objectif.etapes.length
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            {etape}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeleteEtape(objectif.id, index)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex gap-2">
                      <Input
                        placeholder="Nouvelle étape"
                        value={newEtape}
                        onChange={(e) => setNewEtape(e.target.value)}
                      />
                      <Button onClick={() => handleAddEtape(objectif.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    Date limite : {objectif.dateLimite.toLocaleDateString()}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SuiviCarrierePage;
