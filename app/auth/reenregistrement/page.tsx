"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { toast } from "sonner";
import { Lock, Eye, EyeOff, AlertCircle, Mail } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { Suspense } from "react";
import { completeSignupCandidat, completeSignupRecruteur } from "@/action/signup";

const formSchema = z
  .object({
    email: z.string().email("Email invalide"),
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

function ReenregistrementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [backupEmail, setBackupEmail] = useState("");

  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const email = searchParams.get("email");
    if (email) {
      setBackupEmail(email);
      form.setValue("email", email);
    }
  }, [searchParams, form]);

  async function onSubmit(values: FormValues) {
    // Validation manuelle
    if (!values.password || values.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (values.password !== values.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setIsLoading(true);

      // Supprimer l'ancien utilisateur avant de le réenregistrer
      const deleteResponse = await fetch("/api/auth/delete-old-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
        }),
      });

      if (!deleteResponse.ok) {
        console.error("Erreur lors de la suppression de l'ancien compte");
      }

      // S'inscrire avec Better Auth
      const result = await signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      if (result.error) {
        toast.error(result.error.message || "Erreur lors de l'inscription");
        return;
      }

      // Marquer l'utilisateur comme migré dans BackupUser
      const markResponse = await fetch("/api/auth/mark-migrated", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
        }),
      });
      

      if (!markResponse.ok) {
        console.error("Erreur lors du marquage de migration");
      }

      const backupCheckResponse = await fetch("/api/auth/check-backup-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
        }),
      });

      const backupCheck = await backupCheckResponse.json();
      console.log("backupCheck:", backupCheck);
      
      const userData = backupCheck.backupUser?.userData ? JSON.parse(backupCheck.backupUser.userData) : {};
      console.log("userData:", userData);

      // Gérer selon le type d'utilisateur
      if (backupCheck.backupUser.type === "RECRUTEUR") {
        await completeSignupRecruteur({
          description: userData?.recruteur?.description || "",
          email: backupCheck.backupUser.email,
          entreprise: userData?.recruteur?.entreprise || "",
          name: backupCheck.backupUser.name || "",
          type: (userData?.recruteur?.type as "ENTREPRISE" | "PARTICULIER" | "ENTITE") || "ENTREPRISE",
          typeUser: "RECRUTEUR",
        });
      } else if (backupCheck.backupUser.type === "CANDIDAT") {
        // TODO: Gérer la création du profil candidat
        console.log("Migration candidat - à implémenter");
       await completeSignupCandidat({
        email: backupCheck.backupUser.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        nom: userData?.candidat?.nom || "",
        prenom: userData?.candidat?.prenom || "",
        telephone: userData?.candidat?.telephone || "",
        pays: userData?.candidat?.pays || "",
        dateNaissance: userData?.candidat?.dateNaissance || new Date().toISOString(),
        nationalite: userData?.candidat?.nationalite || "",
        situationFamiliale: userData?.candidat?.situationFamiliale || "",
        permisConduire: userData?.candidat?.permisConduire || "",
        type: "CANDIDAT",
       });
      }



 
      // Rediriger vers la page de connexion
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
      console.error("Erreur:", error);
      window.location.reload();
    } finally {
      setIsLoading(false);
      // window.location.reload();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 px-6 pt-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-amber-100">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Réenregistrement Requis
          </CardTitle>
          <CardDescription className="text-center">
            Suite à la migration de notre système, vous devez créer un nouveau compte.
            {backupEmail && (
              <span className="block mt-2 text-sm font-medium">
                Email: {backupEmail}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="votre@email.com"
                        {...field}
                        disabled={!!backupEmail}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Votre nom"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Nouveau mot de passe
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Entrez votre mot de passe"
                          {...field}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
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
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirmer le mot de passe
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirmez votre mot de passe"
                          {...field}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg p-3 mt-4 bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Important :</strong> Créez un nouveau mot de passe sécurisé
                  (minimum 6 caractères). Vos anciennes données seront préservées.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Création..." : "Créer mon nouveau compte"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReenregistrementPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ReenregistrementContent />
    </Suspense>
  );
}


