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
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { postData } from "@/utils/utilts";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Suspense } from "react";
import { signIn } from "@/lib/auth-client";
import { redirectRecruteur } from "@/action/redirectusers";

const formSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

function Connexion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // setIsLoading(true);
      // const response = await postData(values, "/api/auth/login/candidat");
      // if (response.success) {
      //   toast.success("Connexion réussie");
      //   const redirectTo = searchParams.get("redirect");
      //   if (redirectTo) {
      //     window.location.href = redirectTo;
      //   } else {
      //     window.location.href = "/";
      //   }
      // }

      // console.log(data);

      const res = await signIn.email({
        email: values.email,
        password: values.password,
      });

      if (res.data) {
        // La redirection sera gérée automatiquement par useAutoRedirect
        console.log("Connexion réussie:", res.data);
        redirectRecruteur(res.data.user.id);

        // resetForm();
      }

      console.log(res);
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
      console.error("Erreur de connexion:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar colorée - cachée sur mobile */}
      <div className="hidden lg:block lg:w-1/3 bg-primary"></div>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <Card className="w-full max-w-md shadow-lg lg:shadow-none">
          <CardHeader className="space-y-1 px-6 pt-6 lg:px-8 lg:pt-8">
            <CardTitle className="text-xl lg:text-2xl font-bold text-center">
              Connexion
            </CardTitle>
            <CardDescription className="text-center text-sm lg:text-base">
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 lg:px-8 lg:pb-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 lg:space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm lg:text-base">
                        <Mail className="h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="votre@email.com"
                          {...field}
                          className="h-10 lg:h-11"
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
                      <FormLabel className="flex items-center gap-2 text-sm lg:text-base">
                        <Lock className="h-4 w-4" />
                        Mot de passe
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="h-10 lg:h-11 pr-10"
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
                            <span className="sr-only">
                              {showPassword ? "Masquer" : "Afficher"} le mot de
                              passe
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-10 lg:h-11 text-sm lg:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </Form>
            <div className="mt-4 lg:mt-6 text-center text-xs lg:text-sm">
              <span className="text-gray-600">Pas encore de compte ? </span>
              <Link
                href="/auth/candidat/inscription"
                className="text-primary hover:underline font-medium"
              >
                S'inscrire
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ConnexionPageWrapper() {
  return (
    <Suspense fallback={null}>
      <Connexion />
    </Suspense>
  );
}
