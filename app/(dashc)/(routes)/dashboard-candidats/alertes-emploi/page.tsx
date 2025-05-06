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
import { Switch } from "@/components/ui/switch";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlerteNotification } from "@/app/components/notifications/alerte-notification";
import { AlerteService } from "@/app/services/alerte.service";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CompetenceAutocomplete,
  type Competence,
} from "@/app/components/ui/competence-autocomplete";
import { AlerteNotificationType } from "@/types/types";

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
}

// Liste des compétences disponibles
const competences: Competence[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "nodejs", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "php", label: "PHP" },
  { value: "sql", label: "SQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "git", label: "Git" },
  { value: "docker", label: "Docker" },
  { value: "aws", label: "AWS" },
  { value: "uiux", label: "UI/UX Design" },
  { value: "agile", label: "Méthodologies Agiles" },
  { value: "canva", label: "Canva" },
  { value: "rédaction", label: "Rédaction" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "figma", label: "Figma" },
  { value: "adobexd", label: "Adobe XD" },
  { value: "designthinking", label: "Design Thinking" },
  { value: "gestionprojet", label: "Gestion de projet" },
  { value: "scrum", label: "Scrum" },
  { value: "jira", label: "JIRA" },
  { value: "linux", label: "Linux" },
  { value: "windowsserver", label: "Windows Server" },
  { value: "securitenetwork", label: "Sécurité réseau" },
  { value: "socialmedia", label: "Social media" },
];

const AlertesEmploiPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const hasIncrementedViews = useRef(false);
  const queryClient = useQueryClient();

  const form = useForm<AlerteFormData>({
    resolver: zodResolver(alerteSchema),
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
  const { data: alertes = [], isLoading } = useQuery<Alerte[]>({
    queryKey: ["alertes"],
    queryFn: async () => {
      const response = await fetch("/api/candidat/alertes");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des alertes");
      }
      return response.json();
    },
  });

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

          const data = await response.json();
          console.log("Résultats de la vérification:", data);

          // Rafraîchir les notifications
          await refetchNotifications();
        } catch (error) {
          console.error("Erreur:", error);
        }
      };
      checkAlertes();
    }
  }, [refetchNotifications]);

  console.log(notifications);

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
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">Alertes emploi</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une alerte
          </Button>
          <AlerteNotification
            notifications={(notifications && notifications) || []}
            isLoading={notificationsLoading}
          />
        </div>
      </div>

      {/* Formulaire de création d'alerte */}
      {isCreating && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">Nouvelle alerte</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titre">Titre de l'alerte</Label>
                  <Input
                    id="titre"
                    {...form.register("titre")}
                    placeholder="Ex: Développeur Full Stack"
                  />
                  {form.formState.errors.titre && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.titre.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="localisation">Localisation</Label>
                  <Input
                    id="localisation"
                    {...form.register("localisation")}
                    placeholder="Ex: Paris, Remote"
                  />
                  {form.formState.errors.localisation && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.localisation.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="typeContrat">Type de contrat</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("typeContrat", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Alternance">Alternance</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.typeContrat && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.typeContrat.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Niveau d'expérience</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("experience", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Débutant">Débutant</SelectItem>
                      <SelectItem value="1-3 ans">1-3 ans</SelectItem>
                      <SelectItem value="3-5 ans">3-5 ans</SelectItem>
                      <SelectItem value="5+ ans">5+ ans</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.experience && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.experience.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequence">Fréquence des alertes</Label>
                  <Select
                    onValueChange={(value) => form.setValue("frequence", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quotidienne">Quotidienne</SelectItem>
                      <SelectItem value="Hebdomadaire">Hebdomadaire</SelectItem>
                      <SelectItem value="Mensuelle">Mensuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Compétences</Label>
                  <CompetenceAutocomplete
                    competences={competences}
                    selectedValues={form.watch("motsCles") || []}
                    onChange={(values) => form.setValue("motsCles", values)}
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
                          {alerte.salaireMin}€ - {alerte.salaireMax}€
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
                    {alerte.nombreResultats} nouvelles offres
                  </span>
                </div>
              </div>

              {alerte.motsCles.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Compétences :
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alerte.motsCles.map((motCle, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted rounded-full text-sm"
                      >
                        {motCle}
                      </span>
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
