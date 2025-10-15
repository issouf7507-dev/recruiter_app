"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Plus,
  Bell,
  Trash2,
  Pencil,
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import { AlerteNotification } from "@/app/components/notifications/alerte-notification";

import { AlerteNotificationType } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import CompetenceAutocomplete from "@/app/components/ui/competence-autocomplete";

const alerteSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  motsCles: z.array(z.string()),
  localisation: z.string().min(1, "La localisation est requise"),
  typeContrat: z.string().min(1, "Le type de contrat est requis"),
  salaireMin: z.number().optional(),
  salaireMax: z.number().optional(),
  experience: z.string().min(1, "L'expérience est requise"),
  frequence: z.string(),
  active: z.boolean(),
});

type AlerteFormData = z.infer<typeof alerteSchema>;

interface Alerte extends AlerteFormData {
  id: string;
  derniereMiseAJour: Date;
  nombreResultats: number;
  alerteMotsCles: {
    motCle: string;
  }[];
}

interface Competence {
  value: string;
  label: string;
}

// Liste des compétences disponibles
const competences: Competence[] = [
  { value: "JavaScript", label: "JavaScript" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "React", label: "React" },
  { value: "Next.js", label: "Next.js" },
  { value: "Node.js", label: "Node.js" },
  { value: "Python", label: "Python" },
  { value: "Java", label: "Java" },
  { value: "PHP", label: "PHP" },
  { value: "SQL", label: "SQL" },
  { value: "MongoDB", label: "MongoDB" },
  { value: "Git", label: "Git" },
  { value: "Docker", label: "Docker" },
  { value: "AWS", label: "AWS" },
  { value: "UI/UX Design", label: "UI/UX Design" },
  { value: "Méthodologies Agiles", label: "Méthodologies Agiles" },
  { value: "Canva", label: "Canva" },
  { value: "Rédaction", label: "Rédaction" },
  { value: "PostgreSQL", label: "PostgreSQL" },
  { value: "Figma", label: "Figma" },
  { value: "Adobe XD", label: "Adobe XD" },
  { value: "Design Thinking", label: "Design Thinking" },
  { value: "Gestion de projet", label: "Gestion de projet" },
  { value: "Scrum", label: "Scrum" },
  { value: "JIRA", label: "JIRA" },
  { value: "Linux", label: "Linux" },
  { value: "Windows Server", label: "Windows Server" },
  { value: "Sécurité réseau", label: "Sécurité réseau" },
  { value: "Social media", label: "Social media" },
  { value: "Marketing", label: "Marketing" },
  { value: "Communication", label: "Communication" },
];

const AlertesEmploiPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const hasIncrementedViews = useRef(false);
  const queryClient = useQueryClient();

  const form = useForm<AlerteFormData>({
    // resolver: zodResolver(alerteSchema),
    defaultValues: {
      titre: "",
      motsCles: [],
      localisation: "",
      typeContrat: "",
      experience: "",
      frequence: "Quotidienne",
      active: true,
    },
  });

  // Fetch alertes
  const {
    data: alertes = [],
    isLoading,
    refetch,
  } = useQuery<Alerte[]>({
    queryKey: ["alertes"],
    queryFn: async () => {
      const response = await fetch("/api/candidat/alertes");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des alertes");
      }
      return response.json();
    },
  });

  // console.log("alerte", alertes);

  const {
    data: notifications,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery<AlerteNotificationType[]>({
    queryKey: ["alerte-notifications"],
    queryFn: async () => {
      const response = await fetch("/api/candidat/notifications");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des notifications");
      }
      return response.json();
    },
  });

  // Déplacer le useEffect ici, juste après les hooks de base
  useEffect(() => {
    if (!hasIncrementedViews.current) {
      hasIncrementedViews.current = true;
      const checkAlertes = async () => {
        try {
          const response = await fetch("/api/candidat/alertes/check", {
            method: "POST",
          });

          if (!response.ok) {
            throw new Error("Erreur lors de la vérification des alertes");
          }

          // console.log("response", response);

          const data = await response.json();
          // console.log("Résultats de la vérification:", data);

          // Rafraîchir les notifications
          await refetchNotifications();
        } catch (error) {
          console.error("Erreur:", error);
        }
      };
      checkAlertes();
    }
  }, [refetchNotifications]);

  // console.log(notifications);

  // Create alerte
  const createAlerte = useMutation({
    mutationFn: async (data: AlerteFormData) => {
      const response = await fetch("/api/candidat/alertes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'alerte");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertes"] });
      form.reset();
      setIsCreating(false);
      toast.success("Alerte créée avec succès");
      refetchNotifications();
      refetch();
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'alerte");
    },
  });

  // Toggle alerte active
  const toggleAlerte = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await fetch(`/api/candidat/alertes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la modification de l'alerte");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertes"] });
    },
    onError: () => {
      toast.error("Erreur lors de la modification de l'alerte");
    },
  });

  // Delete alerte
  const deleteAlerte = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/candidat/alertes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'alerte");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertes"] });
      toast.success("Alerte supprimée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de l'alerte");
    },
  });

  const onSubmit = (data: AlerteFormData) => {
    createAlerte.mutate(data);
  };

  const filteredAlertes = alertes.filter((alerte) =>
    alerte.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto ">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">Alertes emploi</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une alerte
          </Button>
          {/* <AlerteNotification
              notifications={(notifications && notifications) || []}
              isLoading={notificationsLoading}
            /> */}
        </div>
      </div>

      {/* Formulaire de création d'alerte */}
      {isCreating && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">Nouvelle alerte</h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  onSubmit as SubmitHandler<FieldValues>
                )}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titre">Titre de l'alerte</Label>
                    <FormField
                      control={form.control}
                      name="titre"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              id="titre"
                              placeholder="Ex: Développeur Full Stack"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="localisation">Localisation</Label>
                    <FormField
                      control={form.control}
                      name="localisation"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              id="localisation"
                              placeholder="Ex: Paris, Remote"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="typeContrat">Type de contrat</Label>
                    <FormField
                      control={form.control}
                      name="typeContrat"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CDI">CDI</SelectItem>
                                <SelectItem value="CDD">CDD</SelectItem>
                                <SelectItem value="Stage">Stage</SelectItem>
                                <SelectItem value="Alternance">
                                  Alternance
                                </SelectItem>
                                <SelectItem value="Freelance">
                                  Freelance
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Niveau d'expérience</Label>
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 an</SelectItem>
                                <SelectItem value="2">2 ans</SelectItem>
                                <SelectItem value="3">3 ans</SelectItem>
                                <SelectItem value="4">4 ans</SelectItem>
                                <SelectItem value="5">5 ans</SelectItem>
                                <SelectItem value="10+">10+ ans</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequence">Fréquence des alertes</Label>
                    <FormField
                      control={form.control}
                      name="frequence"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Quotidienne">
                                  Quotidienne
                                </SelectItem>
                                <SelectItem value="Hebdomadaire">
                                  Hebdomadaire
                                </SelectItem>
                                <SelectItem value="Mensuelle">
                                  Mensuelle
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Compétences</Label>
                    <FormField
                      control={form.control}
                      name="motsCles"
                      render={({ field }) => {
                        const [customSkill, setCustomSkill] = useState("");

                        const addCustomSkill = () => {
                          if (
                            customSkill.trim() &&
                            !field.value?.includes(
                              customSkill.trim().toLowerCase()
                            )
                          ) {
                            const currentSkills = field.value || [];
                            field.onChange([
                              ...currentSkills,
                              customSkill.trim().toLowerCase(),
                            ]);
                            setCustomSkill("");
                          }
                        };

                        const handleKeyPress = (e: React.KeyboardEvent) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomSkill();
                          }
                        };

                        return (
                          <FormItem>
                            <FormLabel>Compétences techniques</FormLabel>
                            <FormDescription>
                              Sélectionnez des compétences prédéfinies ou
                              ajoutez vos propres compétences
                            </FormDescription>

                            {/* Sélection de compétences prédéfinies */}
                            <Select
                              onValueChange={(value) => {
                                const currentSkills = field.value || [];
                                if (!currentSkills.includes(value)) {
                                  field.onChange([...currentSkills, value]);
                                }
                              }}
                              value=""
                            >
                              <FormControl>
                                <SelectTrigger className="w-full border bg-transparent shadow-none">
                                  <SelectValue placeholder="Sélectionnez des compétences prédéfinies" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="javascript">
                                  JavaScript
                                </SelectItem>
                                <SelectItem value="typescript">
                                  TypeScript
                                </SelectItem>
                                <SelectItem value="react">React</SelectItem>
                                <SelectItem value="nextjs">Next.js</SelectItem>
                                <SelectItem value="nodejs">Node.js</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="php">PHP</SelectItem>
                                <SelectItem value="sql">SQL</SelectItem>
                                <SelectItem value="mongodb">MongoDB</SelectItem>
                                <SelectItem value="git">Git</SelectItem>
                                <SelectItem value="docker">Docker</SelectItem>
                                <SelectItem value="aws">AWS</SelectItem>
                                <SelectItem value="uiux">
                                  UI/UX Design
                                </SelectItem>
                                <SelectItem value="agile">
                                  Méthodologies Agiles
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Ajout de compétences personnalisées */}
                            <div className="flex gap-2 mt-2">
                              <Input
                                placeholder="Ajouter une compétence personnalisée..."
                                value={customSkill}
                                onChange={(e) => setCustomSkill(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={addCustomSkill}
                                disabled={!customSkill.trim()}
                              >
                                Ajouter
                              </Button>
                            </div>

                            {/* Affichage des compétences sélectionnées */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {field.value?.map((skill) => (
                                <div
                                  key={skill}
                                  className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md"
                                >
                                  <span className="text-sm">
                                    {skill.charAt(0).toUpperCase() +
                                      skill.slice(1)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      field.onChange(
                                        field.value.filter((s) => s !== skill)
                                      );
                                    }}
                                    className="text-primary hover:text-primary/80"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>

                {/* Champs pour les salaires */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaireMin">Salaire minimum </Label>
                    <FormField
                      control={form.control}
                      name="salaireMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              id="salaireMin"
                              type="number"
                              placeholder="Ex: 30000"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaireMax">Salaire maximum </Label>
                    <FormField
                      control={form.control}
                      name="salaireMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              id="salaireMax"
                              type="number"
                              placeholder="Ex: 50000"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createAlerte.isPending}>
                    {createAlerte.isPending ? "Création..." : "Créer l'alerte"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Liste des alertes */}
      <div className="relative">
        <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une alerte..."
          className="pl-10 mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlertes.map((alerte) => (
          <Card key={alerte.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{alerte.titre}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{alerte.localisation}</span>
                    <Briefcase className="h-4 w-4 ml-2" />
                    <span>{alerte.typeContrat}</span>
                    {alerte.salaireMin && alerte.salaireMax && (
                      <>
                        <DollarSign className="h-4 w-4 ml-2" />
                        <span>
                          {alerte.salaireMin} - {alerte.salaireMax}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alerte.active}
                    onCheckedChange={(checked) =>
                      toggleAlerte.mutate({ id: alerte.id, active: checked })
                    }
                    disabled={toggleAlerte.isPending}
                  />
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAlerte.mutate(alerte.id)}
                    disabled={deleteAlerte.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Dernière mise à jour : </span>
                  <span className="font-medium">
                    {new Date(alerte.derniereMiseAJour).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span>Fréquence : </span>
                  <span className="font-medium">{alerte.frequence}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {alerte.nombreResultats || 0} nouvelles offres
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alerte.active
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {alerte.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {alerte.alerteMotsCles?.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Compétences :
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alerte.alerteMotsCles?.map((motCle: any, index: any) => (
                      <div key={index}>
                        {/* <span
                          key={index}
                          className="px-2 py-1 bg-muted rounded-full text-sm"
                        >
                          {motCle}
                        </span> */}

                        <Badge className="" variant="outline">
                          {motCle.motCle}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AlertesEmploiPage;
