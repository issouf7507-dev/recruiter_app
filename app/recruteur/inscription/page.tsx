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
    <div className="grid grid-cols-3 min-h-screen">
      <div className="col-span-2  flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className=" bg-card dark:bg-card py-8 px-4  sm:rounded-lg sm:px-10">
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

              <div>
                <CustomButton type="submit" isLoading={isSubmitting}>
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
                  <span className="px-2 bg-card ">Déjà inscrit ?</span>
                </div>
              </div>

              <div className="mt-2">
                <div className="text-xs text-center">
                  Vous avez deja un compte?{" "}
                  <Link href="/recruteur/connexion" className="hover:underline">
                    Connectez-vous{" "}
                  </Link>
                </div>
              </div>

              {/* <div className="mt-6">
                <CustomButton
                  variant="secondary"
                  onClick={() => router.push("/recruteur/connexion")}
                >
                  Se connecter
                </CustomButton>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-1 bg-card"></div>
    </div>
  );
}
