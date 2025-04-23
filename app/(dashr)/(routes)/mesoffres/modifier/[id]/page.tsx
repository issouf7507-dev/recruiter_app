"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchData, putData } from "@/utils/utilts";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";

// Schéma de validation pour le formulaire
const offerFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  company: z.string().min(1, "L'entreprise est requise"),
  location: z.string().min(1, "La localisation est requise"),
  type: z.string().min(1, "Le type de contrat est requis"),
  experience: z.string().min(1, "L'expérience requise est requise"),
  education: z.string().min(1, "Le niveau d'études est requis"),
  description: z.string().min(1, "La description est requise"),
  responsibilities: z.string().min(1, "Les responsabilités sont requises"),
  requirements: z.string().min(1, "Les prérequis sont requis"),
  skills: z.string().min(1, "Les compétences sont requises"),
  benefits: z.string().min(1, "Les avantages sont requis"),
  salaryMin: z.string().min(1, "Le salaire minimum est requis"),
  salaryMax: z.string().min(1, "Le salaire maximum est requis"),
  salaryCurrency: z.string().min(1, "La devise est requise"),
  salaryPeriod: z.string().min(1, "La période est requise"),
  etat: z.string().optional(),
});

export default function ModifierOffre({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, loading } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { id } = use(params);

  const form = useForm<z.infer<typeof offerFormSchema>>({
    defaultValues: {
      type: "CDI",
      salaryCurrency: "EUR",
      salaryPeriod: "an",
    },
  });

  // Récupérer les données de l'offre existante
  const { data: offerData, isLoading } = useQuery({
    queryKey: ["offerbyid", id],
    queryFn: () => fetchData(`/api/recruteur/offres/${id}`),
  });

  console.log(offerData?.data);

  // Mettre à jour le formulaire avec les données de l'offre
  useEffect(() => {
    if (offerData?.data) {
      const offer = offerData?.data?.[0];
      form.reset({
        title: offer.title,
        company: offer.company,
        location: offer.location,
        type: offer.type,
        experience: offer.experience,
        education: offer.education,
        description: offer.description,
        responsibilities: offer.responsibilities,
        requirements: offer.requirements,
        skills: offer.skills,
        benefits: offer.benefits,
        salaryMin: offer.salaryMin,
        salaryMax: offer.salaryMax,
        salaryCurrency: offer.salaryCurrency,
        salaryPeriod: offer.salaryPeriod,
        etat: offer.etat,
      });
    }
  }, [offerData, form]);

  const onSubmit = async (data: z.infer<typeof offerFormSchema>) => {
    try {
      setIsSubmitting(true);
      const newdata = { ...data, recruteurId: user?.id };

      await putData(newdata, `/api/recruteur/offres/${id}`).then((res) => {
        if (res.success) {
          toast("Super ! Vous venez de modifier l'offre.");
          router.push("/mesoffres");
        }
      });
    } catch (error) {
      console.error("Erreur lors de la requête:", error);
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
      <div className="flex items-center gap-4">
        <Link href="/mesoffres">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Modifier une offre</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                Les informations principales de l'offre d'emploi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du poste</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ex: Développeur Full Stack"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entreprise</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'entreprise" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localisation</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Paris, France" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de contrat</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type de contrat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CDI">CDI</SelectItem>
                          <SelectItem value="CDD">CDD</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                          <SelectItem value="Stage">Stage</SelectItem>
                          <SelectItem value="Alternance">Alternance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expérience requise</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez l'expérience requise" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0-1">0-1 an</SelectItem>
                          <SelectItem value="1-2">1-2 ans</SelectItem>
                          <SelectItem value="2-5">2-5 ans</SelectItem>
                          <SelectItem value="5-10">5-10 ans</SelectItem>
                          <SelectItem value="10+">10+ ans</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salaire minimum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ex: 35000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salaire maximum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="ex: 45000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Devise</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Devise" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Période</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Période" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="an">Par an</SelectItem>
                          <SelectItem value="mois">Par mois</SelectItem>
                          <SelectItem value="jour">Par jour</SelectItem>
                          <SelectItem value="heure">Par heure</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description du poste</CardTitle>
              <CardDescription>
                Décrivez le poste, les responsabilités et les exigences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez le poste en détail..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsabilités</FormLabel>
                    <FormDescription>
                      Listez les responsabilités principales (une par ligne)
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="- Développer des applications web
- Collaborer avec l'équipe design
- Participer aux réunions d'équipe"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prérequis</FormLabel>
                    <FormDescription>
                      Listez les prérequis pour le poste (un par ligne)
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="- 3 ans d'expérience minimum
- Maîtrise de React
- Bon niveau d'anglais"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compétences techniques</FormLabel>
                    <FormDescription>
                      Listez les compétences requises (séparées par des
                      virgules)
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="React, Node.js, TypeScript, MongoDB"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avantages</FormLabel>
                    <FormDescription>
                      Listez les avantages proposés (un par ligne)
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="- Télétravail partiel
- Mutuelle d'entreprise
- RTT"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/mesoffres">Annuler</Link>
            </Button>
            <Button type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {"Modification..."}
                </>
              ) : (
                "Modifier l'offre"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
