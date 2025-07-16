"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { postData } from "@/utils/utilts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  Globe,
  Users,
  Car,
  MapPin,
} from "lucide-react";

const formSchema = z
  .object({
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string(),
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    telephone: z.string().min(8, "Numéro de téléphone invalide"),
    pays: z.string().min(1, "Veuillez sélectionner un pays"),
    dateNaissance: z.string().min(1, "Veuillez entrer votre date de naissance"),
    nationalite: z.string().min(1, "Veuillez entrer votre nationalité"),
    situationFamiliale: z
      .string()
      .min(1, "Veuillez sélectionner votre situation familiale"),
    permisConduire: z
      .string()
      .min(1, "Veuillez indiquer si vous avez le permis de conduire"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export default function Inscription() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      nom: "",
      prenom: "",
      telephone: "",
      pays: "",
      dateNaissance: "",
      nationalite: "",
      situationFamiliale: "",
      permisConduire: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const response = await postData(
        {
          ...values,
          type: "CANDIDAT",
        },
        "/api/auth/register/candidat"
      );

      if (response.success) {
        toast.success("Inscription réussie");
        router.push("/candidat/connexion");
      } else {
        toast.error(response.message || "Erreur lors de l'inscription");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile: Full width, Desktop: Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-screen">
        {/* Form Section */}
        <div className="col-span-1 lg:col-span-2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <Card className="w-full max-w-2xl shadow-none border-0 lg:border">
            <CardHeader className="space-y-1 px-4 sm:px-6 lg:px-8 pt-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-center">
                Inscription
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">
                Créez votre compte candidat
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 lg:px-8 pb-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 sm:space-y-6"
                >
                  {/* Nom, Prénom, Email - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="nom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4" />
                            Nom
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="prenom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4" />
                            Prénom
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Votre prénom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2 lg:col-span-1">
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Téléphone - Full width */}
                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4" />
                          Téléphone
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Votre numéro de téléphone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mots de passe - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Lock className="h-4 w-4" />
                            Mot de passe
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Lock className="h-4 w-4" />
                            Confirmer le mot de passe
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Date de naissance et Nationalité - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="dateNaissance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            Date de naissance
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nationalite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Globe className="h-4 w-4" />
                            Nationalité
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nationalité" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Pays, Situation familiale, Permis - Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="pays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            Pays
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez votre pays" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CI">Côte d'Ivoire</SelectItem>
                              <SelectItem value="FR">France</SelectItem>
                              <SelectItem value="SN">Sénégal</SelectItem>
                              <SelectItem value="ML">Mali</SelectItem>
                              <SelectItem value="BF">Burkina Faso</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="situationFamiliale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4" />
                            Situation familiale
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez votre situation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="celibataire">
                                Célibataire
                              </SelectItem>
                              <SelectItem value="marie">Marié(e)</SelectItem>
                              <SelectItem value="divorce">
                                Divorcé(e)
                              </SelectItem>
                              <SelectItem value="veuf">Veuf(ve)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="permisConduire"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2 lg:col-span-1">
                          <FormLabel className="flex items-center gap-2 text-sm">
                            <Car className="h-4 w-4" />
                            Permis de conduire
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Avez-vous le permis ?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="oui">Oui</SelectItem>
                              <SelectItem value="non">Non</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Inscription..." : "S'inscrire"}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                <span className="text-gray-600">Déjà un compte ? </span>
                <Link
                  href="/candidat/connexion"
                  className="text-primary hover:underline"
                >
                  Se connecter
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Background Section - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block col-span-1 bg-primary"></div>
      </div>
    </div>
  );
}
