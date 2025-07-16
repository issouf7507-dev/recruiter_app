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
      <div className="hidden lg:block bg-primary">
        {/* Contenu optionnel pour la sidebar */}
        <div className="h-full flex items-center justify-center">
          <div className="text-white text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Bienvenue</h2>
            <p className="text-lg opacity-90">
              Connectez-vous à votre espace recruteur
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
