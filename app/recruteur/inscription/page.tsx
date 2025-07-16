"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { z } from "zod";
import {
  CustomForm,
  FormGroup,
  CustomInput,
  CustomButton,
} from "@/components/custom-form";
import Link from "next/link";
import { Mail, Lock, User, Building2, Briefcase, FileText } from "lucide-react";

const recruteurSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  name: z.string().optional(),
  type: z.enum(["PARTICULIER", "ENTREPRISE", "ENTITE"]),
  entreprise: z.string().optional(),
  description: z.string().optional(),
});

type RecruteurFormData = z.infer<typeof recruteurSchema>;

export default function InscriptionRecruteur() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecruteurFormData>({
    // resolver: zodResolver(recruteurSchema),
    defaultValues: {
      type: "ENTREPRISE",
    },
  });

  const onSubmit = async (data: RecruteurFormData) => {
    try {
      const response = await fetch("/api/auth/register/recruteur", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Une erreur est survenue");
      }

      router.push("/recruteur/connexion");
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-3">
      {/* Formulaire principal */}
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 lg:col-span-2">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-2xl font-bold text-center mb-8">Inscription</h1>

          <div className="bg-card dark:bg-card py-6 px-4 sm:py-8 sm:px-6 lg:px-8 sm:rounded-lg border">
            <CustomForm onSubmit={handleSubmit(onSubmit)}>
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
                  type="password"
                  {...register("password")}
                  className={errors.password ? "border-red-500" : ""}
                  placeholder="Mot de passe"
                />
              </FormGroup>

              <FormGroup
                label={
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nom
                  </div>
                }
                error={errors.name?.message}
              >
                <CustomInput
                  type="text"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="Nom"
                />
              </FormGroup>

              <FormGroup
                label={
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Type de recruteur
                  </div>
                }
                error={errors.type?.message}
              >
                <select
                  {...register("type")}
                  className="block w-full rounded-md border-gray-300 p-[9px] border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-1"
                >
                  <option value="PARTICULIER">Particulier</option>
                  <option value="ENTREPRISE">Entreprise</option>
                  <option value="ENTITE">Entité</option>
                </select>
              </FormGroup>

              <FormGroup
                label={
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Entreprise
                  </div>
                }
                error={errors.entreprise?.message}
              >
                <CustomInput
                  type="text"
                  {...register("entreprise")}
                  className={errors.entreprise ? "border-red-500" : ""}
                  placeholder="Entreprise"
                />
              </FormGroup>

              <FormGroup
                label={
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </div>
                }
                error={errors.description?.message}
              >
                <textarea
                  {...register("description")}
                  className="block w-full rounded-md border-gray-300 border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
                  rows={3}
                  placeholder="Expliquez nous un peu"
                />
              </FormGroup>

              <div className="mt-6">
                <CustomButton
                  type="submit"
                  className="bg-primary hover:bg-primary/90 w-full"
                  isLoading={isSubmitting}
                >
                  S'inscrire
                </CustomButton>
              </div>
            </CustomForm>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card">Déjà inscrit ?</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className="text-sm">
                  Vous avez déjà un compte ?{" "}
                  <Link
                    href="/recruteur/connexion"
                    className="hover:text-primary hover:underline font-bold"
                  >
                    Connectez-vous
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section décorative - cachée sur mobile, visible sur desktop */}
      <div className="hidden lg:block lg:col-span-1 bg-primary"></div>
    </div>
  );
}
