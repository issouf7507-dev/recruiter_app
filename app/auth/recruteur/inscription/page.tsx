"use client";

import { useState } from "react";
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
import {
  Mail,
  Lock,
  User,
  Building2,
  Briefcase,
  FileText,
  UserCheck,
  Eye,
  EyeOff,
} from "lucide-react";

import { signUp } from "../../../../lib/auth-client";
import { completeSignupRecruteur } from "@/action/signup";
// import { RecruteurType, UserType } from "@prisma/client";

const recruteurSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  name: z.string().optional(),
  type: z.enum(["PARTICULIER", "ENTREPRISE", "ENTITE"]),
  entreprise: z.string().optional(),
  description: z.string().optional(),
  typeUser: z.enum(["RECRUTEUR", "COLLABORATEUR", "CANDIDAT"]).optional(),
});

type RecruteurFormData = z.infer<typeof recruteurSchema>;

export default function InscriptionRecruteur() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecruteurFormData>({
    // resolver: zodResolver(recruteurSchema),
    defaultValues: {
      type: "ENTREPRISE",
      typeUser: "RECRUTEUR",
    },
  });

  const onSubmit = async (data: RecruteurFormData) => {
    // console.log(data);

    const res = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.name || "",
    });

    // console.log(res);
    if (res.data) {
      await completeSignupRecruteur({
        description: data.description || "",
        email: data.email,
        entreprise: data.entreprise || "",
        name: data.name || "",
        type:
          (data.type as "ENTREPRISE" | "PARTICULIER" | "ENTITE") ||
          "ENTREPRISE",
        typeUser:
          (data.typeUser as "RECRUTEUR" | "COLLABORATEUR" | "CANDIDAT") ||
          "RECRUTEUR",
      });

      router.push("/auth/recruteur/connexion");
      // console.log(res.data);
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
                <div className="relative">
                  <CustomInput
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`${
                      errors.password ? "border-red-500" : ""
                    } pr-10`}
                    placeholder="Mot de passe"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Masquer" : "Afficher"} le mot de passe
                    </span>
                  </button>
                </div>
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
                    href="/auth/recruteur/connexion"
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
                  <UserCheck className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Rejoignez notre réseau
              </h2>
              <p className="text-white/80 text-lg font-medium">de recruteurs</p>
            </div>

            {/* Liste des avantages avec style amélioré */}
            <div className="space-y-5 text-sm leading-relaxed mb-8">
              <div className="flex items-start gap-4 group">
                <div className="relative">
                  <div className="w-3 h-3 bg-white rounded-full mt-2 flex-shrink-0 shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-20"></div>
                </div>
                <p className="text-white/90 group-hover:text-white transition-colors duration-200">
                  Publiez vos offres d'emploi en quelques clics
                </p>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="relative">
                  <div className="w-3 h-3 bg-white rounded-full mt-2 flex-shrink-0 shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-20 animation-delay-200"></div>
                </div>
                <p className="text-white/90 group-hover:text-white transition-colors duration-200">
                  Accédez à une base de candidats qualifiés
                </p>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="relative">
                  <div className="w-3 h-3 bg-white rounded-full mt-2 flex-shrink-0 shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-20 animation-delay-400"></div>
                </div>
                <p className="text-white/90 group-hover:text-white transition-colors duration-200">
                  Gérez vos candidatures avec notre outil Kanban
                </p>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="relative">
                  <div className="w-3 h-3 bg-white rounded-full mt-2 flex-shrink-0 shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping opacity-20 animation-delay-600"></div>
                </div>
                <p className="text-white/90 group-hover:text-white transition-colors duration-200">
                  Bénéficiez d'analyses et statistiques détaillées
                </p>
              </div>
            </div>

            {/* Témoignage avec style amélioré */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-white/20 rounded-full border-2 border-white/30 flex items-center justify-center"
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-white/90 font-medium leading-relaxed">
                  "Plus de{" "}
                  <span className="text-white font-bold">500 entreprises</span>{" "}
                  nous font confiance pour leurs recrutements"
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
                Commencez dès maintenant
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
