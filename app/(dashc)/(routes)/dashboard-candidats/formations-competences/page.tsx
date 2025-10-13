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
  GraduationCap,
  Languages,
  Code2,
  BookOpen,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Formation {
  id: string;
  diplome: string;
  etablissement: string;
  domaine: string;
  dateDebut: Date;
  dateFin: Date | null;
  description: string;
}

interface Competence {
  id: string;
  categorie: string;
  nom: string;
  niveau: number;
}

const formationSchema = z.object({
  diplome: z.string().min(1, "Le diplôme est requis"),
  etablissement: z.string().min(1, "L'établissement est requis"),
  domaine: z.string().optional(),
  dateDebut: z.date(),
  dateFin: z.date().nullable(),
  description: z.string().optional(),
});

const competenceSchema = z.object({
  categorie: z.string().min(1, "La catégorie est requise"),
  nom: z.string().min(1, "Le nom est requis"),
  niveau: z.number().min(1).max(5),
});

type FormationFormData = z.infer<typeof formationSchema>;
type CompetenceFormData = z.infer<typeof competenceSchema>;

const FormationsCompetencesPage = () => {
  const [isAddingFormation, setIsAddingFormation] = useState(false);
  const [isAddingCompetence, setIsAddingCompetence] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<
    "formation" | "competence" | null
  >(null);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "formation" | "competence";
    id: string;
    name: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const {
    register: registerFormation,
    handleSubmit: handleSubmitFormation,
    reset: resetFormation,
    formState: { errors: formationErrors },
    setValue: setFormationValue,
    watch: watchFormation,
  } = useForm<FormationFormData>({
    // resolver: zodResolver(formationSchema),
    defaultValues: {
      diplome: "",
      etablissement: "",
      domaine: "",
      dateDebut: new Date(),
      dateFin: null,
      description: "",
    },
  });

  const {
    register: registerCompetence,
    handleSubmit: handleSubmitCompetence,
    reset: resetCompetence,
    formState: { errors: competenceErrors },
    setValue: setCompetenceValue,
    watch: watchCompetence,
  } = useForm<CompetenceFormData>({
    // resolver: zodResolver(competenceSchema),
    defaultValues: {
      categorie: "",
      nom: "",
      niveau: 1,
    },
  });

  const { data: formationsData, isLoading: isLoadingFormations } = useQuery({
    queryKey: ["formations"],
    queryFn: async () => {
      const response = await fetch("/api/candidat/formations");
      const data = await response.json();
      if (!data.success)
        throw new Error("Erreur lors de la récupération des formations");
      return data.data;
    },
  });

  const { data: competencesData, isLoading: isLoadingCompetences } = useQuery({
    queryKey: ["competences"],
    queryFn: async () => {
      const response = await fetch("/api/candidat/competences");
      const data = await response.json();
      if (!data.success)
        throw new Error("Erreur lors de la récupération des compétences");
      return data.data;
    },
  });

  const addFormationMutation = useMutation({
    mutationFn: async (data: FormationFormData) => {
      const response = await fetch("/api/candidat/formations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!result.success)
        throw new Error("Erreur lors de l'ajout de la formation");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      resetFormation();
      setIsAddingFormation(false);
      toast.success("Formation ajoutée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de la formation");
    },
  });

  const addCompetenceMutation = useMutation({
    mutationFn: async (data: CompetenceFormData) => {
      const response = await fetch("/api/candidat/competences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!result.success)
        throw new Error("Erreur lors de l'ajout de la compétence");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competences"] });
      resetCompetence();
      setIsAddingCompetence(false);
      toast.success("Compétence ajoutée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de la compétence");
    },
  });

  const updateFormationMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: FormationFormData;
    }) => {
      const response = await fetch(`/api/candidat/formations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!result.success)
        throw new Error("Erreur lors de la mise à jour de la formation");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      setEditingId(null);
      setEditingType(null);
      toast.success("Formation mise à jour avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la formation");
    },
  });

  const updateCompetenceMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CompetenceFormData;
    }) => {
      const response = await fetch(`/api/candidat/competences/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!result.success)
        throw new Error("Erreur lors de la mise à jour de la compétence");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competences"] });
      setEditingId(null);
      setEditingType(null);
      toast.success("Compétence mise à jour avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la compétence");
    },
  });

  const deleteFormationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/candidat/formations/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success)
        throw new Error("Erreur lors de la suppression de la formation");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast.success("Formation supprimée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la formation");
    },
  });

  const deleteCompetenceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/candidat/competences/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success)
        throw new Error("Erreur lors de la suppression de la compétence");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competences"] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast.success("Compétence supprimée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la compétence");
    },
  });

  const handleAddFormation = async (data: FormationFormData) => {
    addFormationMutation.mutate(data);
  };

  const handleAddCompetence = async (data: CompetenceFormData) => {
    addCompetenceMutation.mutate(data);
  };

  const handleUpdateFormation = async (data: FormationFormData) => {
    if (!editingId) return;
    updateFormationMutation.mutate({ id: editingId, data });
  };

  const handleUpdateCompetence = async (data: CompetenceFormData) => {
    if (!editingId) return;
    updateCompetenceMutation.mutate({ id: editingId, data });
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === "formation") {
      deleteFormationMutation.mutate(itemToDelete.id);
    } else {
      deleteCompetenceMutation.mutate(itemToDelete.id);
    }
  };

  const handleDeleteClick = (
    type: "formation" | "competence",
    id: string,
    name: string
  ) => {
    setItemToDelete({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (type: "formation" | "competence", id: string) => {
    setEditingId(id);
    setEditingType(type);

    if (type === "formation") {
      const formationToEdit = formationsData?.find(
        (f: Formation) => f.id === id
      );
      if (formationToEdit) {
        resetFormation({
          diplome: formationToEdit.diplome,
          etablissement: formationToEdit.etablissement,
          domaine: formationToEdit.domaine,
          dateDebut: new Date(formationToEdit.dateDebut),
          dateFin: formationToEdit.dateFin
            ? new Date(formationToEdit.dateFin)
            : null,
          description: formationToEdit.description,
        });
      }
    } else {
      const competenceToEdit = competencesData?.find(
        (c: Competence) => c.id === id
      );
      if (competenceToEdit) {
        resetCompetence({
          categorie: competenceToEdit.categorie,
          nom: competenceToEdit.nom,
          niveau: competenceToEdit.niveau,
        });
      }
    }
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
              <form
                onSubmit={handleSubmitFormation(handleAddFormation)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diplome">Diplôme</Label>
                    <Input id="diplome" {...registerFormation("diplome")} />
                    {formationErrors.diplome && (
                      <p className="text-sm text-red-500">
                        {formationErrors.diplome.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="etablissement">Établissement</Label>
                    <Input
                      id="etablissement"
                      {...registerFormation("etablissement")}
                    />
                    {formationErrors.etablissement && (
                      <p className="text-sm text-red-500">
                        {formationErrors.etablissement.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domaine">Domaine d'études</Label>
                  <Input id="domaine" {...registerFormation("domaine")} />
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
                          {watchFormation("dateDebut") ? (
                            format(watchFormation("dateDebut"), "PPP", {
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
                          selected={watchFormation("dateDebut")}
                          onSelect={(date) =>
                            setFormationValue("dateDebut", date!)
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
                          {watchFormation("dateFin") ? (
                            format(watchFormation("dateFin") as Date, "PPP", {
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
                          selected={watchFormation("dateFin") ?? undefined}
                          onSelect={(date) =>
                            setFormationValue("dateFin", date ?? null)
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
                    {...registerFormation("description")}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingFormation(false)}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Ajouter"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoadingFormations ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {formationsData?.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <GraduationCap className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Aucune formation n'a été ajoutée pour le moment.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingFormation(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une formation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              formationsData?.map((formation: Formation) => (
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
                          {format(formation.dateDebut, "MMMM yyyy", {
                            locale: fr,
                          })}{" "}
                          -{" "}
                          {formation.dateFin
                            ? format(formation.dateFin, "MMMM yyyy", {
                                locale: fr,
                              })
                            : "Présent"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleEditClick("formation", formation.id)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleDeleteClick(
                              "formation",
                              formation.id,
                              formation.diplome
                            )
                          }
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
              ))
            )}
          </div>
        )}
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
              <form
                onSubmit={handleSubmitCompetence(handleAddCompetence)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categorie">Catégorie</Label>
                    <Select
                      value={watchCompetence("categorie")}
                      onValueChange={(value) =>
                        setCompetenceValue("categorie", value)
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
                    {competenceErrors.categorie && (
                      <p className="text-sm text-red-500">
                        {competenceErrors.categorie.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <Input id="nom" {...registerCompetence("nom")} />
                    {competenceErrors.nom && (
                      <p className="text-sm text-red-500">
                        {competenceErrors.nom.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Niveau</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((niveau) => (
                      <Button
                        key={niveau}
                        variant={
                          watchCompetence("niveau") === niveau
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setCompetenceValue("niveau", niveau)}
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
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Ajouter"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoadingCompetences ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competencesData?.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <Code2 className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Aucune compétence n'a été ajoutée pour le moment.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingCompetence(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une compétence
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              competencesData?.map((competence: Competence) => (
                <Card key={competence.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">
                          {competence.nom}
                        </h3>
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
                          onClick={() =>
                            handleEditClick("competence", competence.id)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleDeleteClick(
                              "competence",
                              competence.id,
                              competence.nom
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              {itemToDelete?.type === "formation"
                ? "la formation"
                : "la compétence"}{" "}
              "{itemToDelete?.name}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression en cours...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingId(null);
            setEditingType(null);
            resetFormation();
            resetCompetence();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Modifier{" "}
              {editingType === "formation" ? "la formation" : "la compétence"}
            </DialogTitle>
          </DialogHeader>

          {editingType === "formation" && (
            <form
              onSubmit={handleSubmitFormation(handleUpdateFormation)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-diplome">Diplôme</Label>
                  <Input
                    id="edit-diplome"
                    {...registerFormation("diplome")}
                    defaultValue={
                      formationsData?.find(
                        (formation: Formation) => formation.id === editingId
                      )?.diplome
                    }
                  />
                  {formationErrors.diplome && (
                    <p className="text-sm text-red-500">
                      {formationErrors.diplome.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-etablissement">Établissement</Label>
                  <Input
                    id="edit-etablissement"
                    {...registerFormation("etablissement")}
                    defaultValue={
                      formationsData?.find(
                        (formation: Formation) => formation.id === editingId
                      )?.etablissement
                    }
                  />
                  {formationErrors.etablissement && (
                    <p className="text-sm text-red-500">
                      {formationErrors.etablissement.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-domaine">Domaine d'études</Label>
                <Input
                  id="edit-domaine"
                  {...registerFormation("domaine")}
                  defaultValue={
                    formationsData?.find(
                      (formation: Formation) => formation.id === editingId
                    )?.domaine
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
                        {watchFormation("dateDebut") ? (
                          format(watchFormation("dateDebut") as Date, "PPP", {
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
                        selected={watchFormation("dateDebut")}
                        onSelect={(date) =>
                          setFormationValue("dateDebut", date!)
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
                        {watchFormation("dateFin") ? (
                          format(watchFormation("dateFin") as Date, "PPP", {
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
                        selected={watchFormation("dateFin") ?? undefined}
                        onSelect={(date) =>
                          setFormationValue("dateFin", date ?? null)
                        }
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  {...registerFormation("description")}
                  defaultValue={
                    formationsData?.find(
                      (formation: Formation) => formation.id === editingId
                    )?.description
                  }
                  className="min-h-[100px]"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setEditingType(null);
                    resetFormation();
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    "Mettre à jour"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {editingType === "competence" && (
            <form
              onSubmit={handleSubmitCompetence(handleUpdateCompetence)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-categorie">Catégorie</Label>
                  <Select
                    value={watchCompetence("categorie")}
                    onValueChange={(value) =>
                      setCompetenceValue("categorie", value)
                    }
                    defaultValue={
                      competencesData?.find(
                        (competence: Competence) => competence.id === editingId
                      )?.categorie
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
                  {competenceErrors.categorie && (
                    <p className="text-sm text-red-500">
                      {competenceErrors.categorie.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-nom">Nom</Label>
                  <Input
                    id="edit-nom"
                    {...registerCompetence("nom")}
                    defaultValue={
                      competencesData?.find(
                        (competence: Competence) => competence.id === editingId
                      )?.nom
                    }
                  />
                  {competenceErrors.nom && (
                    <p className="text-sm text-red-500">
                      {competenceErrors.nom.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Niveau</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((niveau) => (
                    <Button
                      key={niveau}
                      variant={
                        watchCompetence("niveau") === niveau
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setCompetenceValue("niveau", niveau)}
                    >
                      {niveau}
                    </Button>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setEditingType(null);
                    resetCompetence();
                  }}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    "Mettre à jour"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormationsCompetencesPage;
