"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  Loader2,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { fetchData, postData, deleteData } from "@/utils/utilts";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation, useQuery } from "@tanstack/react-query";

interface Experience {
  id: string;
  poste: string;
  entreprise: string;
  localisation: string;
  typeContrat: string;
  dateDebut: Date;
  dateFin: Date | null;
  description: string;
  competences: string[];
  experienceCompetences: {
    competence: string;
  }[];
}

const experienceSchema = z.object({
  poste: z.string().min(1, "Le poste est requis"),
  entreprise: z.string().min(1, "L'entreprise est requise"),
  localisation: z.string().min(1, "La localisation est requise"),
  typeContrat: z.string().min(1, "Le type de contrat est requis"),
  dateDebut: z.date(),
  dateFin: z.date().nullable(),
  description: z.string().optional(),
  competences: z.array(z.string()).optional(),
  candidatId: z.string(),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

const ExperiencesPage = () => {
  const { candidat } = useUserStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExperienceFormData>({
    // resolver: zodResolver(experienceSchema),
    defaultValues: {
      poste: "",
      entreprise: "",
      localisation: "",
      typeContrat: "",
      dateDebut: new Date(),
      dateFin: null,
      description: "",
      competences: [],
      candidatId: "",
    },
  });

  const {
    data: experiencesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["experiencesData"],
    queryFn: () => fetchData("/api/candidat/experiences"),
  });

  const addExperienceMutation = useMutation({
    mutationFn: (data: ExperienceFormData) =>
      postData(data, "/api/candidat/experiences"),
    onSuccess: () => {
      toast.success("Expérience ajoutée avec succès");
      refetch();
      form.reset();
      setIsAdding(false);
    },
    onError: (error) => {
      console.error("Erreur lors de l'ajout de l'expérience:", error);
      toast.error("Erreur lors de l'ajout de l'expérience");
    },
  });

  // console.log(experiencesData);
  // useEffect(() => {
  //   loadExperiences();
  // }, [candidat]);

  // const loadExperiences = async () => {
  //   if (!candidat?.candidat?.id) return;

  //   try {
  //     const response = await fetchData(`/api/candidat/experiences`);
  //     if (response.success) {
  //       setExperiences(response.data);
  //     }
  //   } catch (error) {
  //     console.error("Erreur lors du chargement des expériences:", error);
  //     toast.error("Erreur lors du chargement des expériences");
  //   } finally {
  //     // setIsLoading(false);
  //   }
  // };

  const handleAddExperience = async (data: ExperienceFormData) => {
    if (!candidat?.candidat?.id) return;

    addExperienceMutation.mutate({
      ...data,
      candidatId: candidat.candidat.id,
    });

    // setIsSubmitting(true);
    // try {
    //   const response = await postData(
    //     {
    //       ...data,
    //       candidatId: candidat.candidat.id,
    //     },
    //     "/api/candidat/experiences"
    //   );

    //   if (response.success) {
    //     toast.success("Expérience ajoutée avec succès");
    //     form.reset();
    //     setIsAdding(false);
    //     // loadExperiences();
    //   }
    // } catch (error) {
    //   console.error("Erreur lors de l'ajout de l'expérience:", error);
    //   toast.error("Erreur lors de l'ajout de l'expérience");
    // } finally {
    //   // setIsSubmitting(false);
    // }
  };

  const handleDeleteExperience = async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await deleteData(`/api/candidat/experiences/${id}`);
      if (response.success) {
        toast.success("Expérience supprimée avec succès");
        // loadExperiences();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'expérience:", error);
      toast.error("Erreur lors de la suppression de l'expérience");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Expériences professionnelles</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos expériences professionnelles pour améliorer votre profil
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une expérience
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddExperience)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="poste"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poste</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="entreprise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entreprise</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="localisation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localisation</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="typeContrat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de contrat</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CDI">CDI</SelectItem>
                            <SelectItem value="CDD">CDD</SelectItem>
                            <SelectItem value="Stage">Stage</SelectItem>
                            <SelectItem value="Freelance">Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateDebut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de début</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP", { locale: fr })
                                ) : (
                                  <span>Choisir une date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              locale={fr}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateFin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de fin</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP", { locale: fr })
                                ) : (
                                  <span>Choisir une date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value ?? undefined}
                              onSelect={field.onChange}
                              initialFocus
                              locale={fr}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="competences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compétences</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ajouter des compétences (séparées par des virgules)"
                          value={field.value?.join(", ")}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                .split(",")
                                .map((skill) => skill.trim())
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      form.reset();
                    }}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={addExperienceMutation.isPending}
                  >
                    {addExperienceMutation.isPending ? (
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
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {experiencesData?.data.length === 0 ? (
          <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                <Briefcase className="h-12 w-12 text-muted-foreground" />
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Aucune expérience</h3>
                  <p className="text-sm text-muted-foreground">
                    Commencez par ajouter vos expériences professionnelles pour
                    enrichir votre profil
                  </p>
                </div>
                <Button onClick={() => setIsAdding(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une expérience
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          experiencesData?.data.map((experience: Experience) => (
            <Card key={experience.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {experience.poste}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{experience.entreprise}</span>
                      <span>•</span>
                      <span>{experience.localisation}</span>
                      <span>•</span>
                      <span>{experience.typeContrat}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(experience.dateDebut, "MMMM yyyy", {
                        locale: fr,
                      })}{" "}
                      -{" "}
                      {experience.dateFin
                        ? format(experience.dateFin, "MMMM yyyy", {
                            locale: fr,
                          })
                        : "Présent"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteExperience(experience.id)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="mt-4 text-muted-foreground">
                  {experience.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {experience.experienceCompetences.map((competence, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                    >
                      {competence.competence}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ExperiencesPage;
