"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CustomForm,
  FormGroup,
  CustomInput,
  CustomButton,
} from "@/components/custom-form";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function ConnexionRecruteur() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch("/api/auth/login/recruteur", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError("root", {
          type: "manual",
          message: responseData.error || "Une erreur est survenue",
        });
        return;
      }

      // Redirection vers le tableau de bord après connexion réussie
      router.push("/dashboard-recruteurs");
    } catch (error) {
      setError("root", {
        type: "manual",
        message: "Une erreur est survenue lors de la connexion",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-3">
      {/* Contenu principal - responsive */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 lg:col-span-2">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-8">Connexion</h1>

          <div className="bg-card py-6 px-4 sm:py-8 sm:px-6 rounded-lg border shadow-sm">
            <CustomForm onSubmit={handleSubmit(onSubmit)}>
              {errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                  {errors.root.message}
                </div>
              )}

              <FormGroup
                label={
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                }
                error={errors.email?.message}
              >
                <CustomInput
                  type="email"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                  placeholder="Email"
                />
              </FormGroup>

              <FormGroup
                label={
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Mot de passe
                  </div>
                }
                error={errors.password?.message}
              >
                <CustomInput
                  placeholder="Mot de passe"
                  type="password"
                  {...register("password")}
                  className={errors.password ? "border-red-500" : ""}
                />
              </FormGroup>

              <div className="mt-6">
                <CustomButton
                  type="submit"
                  className="bg-primary hover:bg-primary/90 w-full"
                  isLoading={isSubmitting}
                >
                  Se connecter
                </CustomButton>
              </div>
            </CustomForm>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">
                    Pas encore inscrit ?
                  </span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className="text-sm text-muted-foreground">
                  Vous n'avez pas de compte?{" "}
                  <Link
                    href="/recruteur/inscription"
                    className="text-primary hover:underline font-medium"
                  >
                    Inscrivez-vous
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar colorée - cachée sur mobile, visible sur desktop */}
      <div className="hidden lg:block lg:col-span-1 bg-gradient-to-br from-primary via-primary/90 to-primary/80 dark:from-primary/30 dark:via-primary/20 dark:to-primary/10 relative overflow-hidden">
        {/* Effet de fond décoratif */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute top-20 right-16 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-16 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full"></div>
        </div>

        {/* Contenu principal */}
        <div className="relative flex items-center justify-center h-full p-8">
          <div className="text-center text-white dark:text-primary-foreground max-w-sm">
            {/* Icône avec animation */}
            <div className="mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Bienvenue
              </h2>
              <p className="text-white/80 text-lg font-medium">
                dans votre espace recruteur
              </p>
            </div>

            {/* Liste des fonctionnalités */}
            <div className="space-y-5 text-sm leading-relaxed mb-8">
              <div className="flex items-start gap-4 group">
                <div className="relative">
                  <div className="w-3 h-3 bg-white rounded-full mt-2 flex-shrink-0 shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-20"></div>
                </div>
                <p className="text-white/90 group-hover:text-white transition-colors duration-200">
                  Accédez à votre tableau de bord complet
                </p>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="relative">
                  <div className="w-3 h-3 bg-white rounded-full mt-2 flex-shrink-0 shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-20 animation-delay-200"></div>
                </div>
                <p className="text-white/90 group-hover:text-white transition-colors duration-200">
                  Gérez vos offres et candidatures
                </p>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="relative">
                  <div className="w-3 h-3 bg-white rounded-full mt-2 flex-shrink-0 shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-20 animation-delay-400"></div>
                </div>
                <p className="text-white/90 group-hover:text-white transition-colors duration-200">
                  Consultez vos statistiques détaillées
                </p>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="relative">
                  <div className="w-3 h-3 bg-white rounded-full mt-2 flex-shrink-0 shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-20 animation-delay-600"></div>
                </div>
                <p className="text-white/90 group-hover:text-white transition-colors duration-200">
                  Communiquez avec vos candidats
                </p>
              </div>
            </div>

            {/* Section de statistiques */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <span className="text-white/90 text-sm font-medium">
                      Accès sécurisé
                    </span>
                  </div>
                </div>
                <p className="text-sm text-white/90 font-medium leading-relaxed">
                  Votre espace est protégé par un chiffrement de niveau bancaire
                </p>
                <div className="mt-3 flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 bg-white/60 rounded-full"
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Call-to-action subtil */}
            <div className="mt-6">
              <div className="inline-flex items-center gap-2 text-white/70 text-xs">
                <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                Connexion sécurisée
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
