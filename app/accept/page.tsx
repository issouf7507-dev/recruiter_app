"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, Mail, Users, Calendar } from "lucide-react";

interface InvitationData {
  valid: boolean;
  role: string;
  email: string;
  recruteur: {
    name: string;
    email: string;
  };
  expiresAt: string;
}

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(
    null
  );
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      router.push("/");
      return;
    }
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/invitation/validate?token=${token}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      const data = await response.json();
      console.log("data", data);
      setInvitationData(data);
    } catch (error) {
      toast.error("Cette invitation n'est plus valide ou a expiré");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/invitation/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          nom: formData.nom,
          prenom: formData.prenom,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const result = await response.json();
      toast.success(
        "Invitation acceptée avec succès ! Vous êtes maintenant collaborateur dans l'équipe !"
      );

      // Rediriger vers la page de connexion du recruteur (espace partagé)
      router.push("/auth/recruteur/connexion?message=collaborator-joined");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'acceptation de l'invitation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleDisplay = (role: string) => {
    const roleMap = {
      ADMIN: "Administrateur",
      MANAGER: "Manager",
      USER: "Collaborateur",
      VIEWER: "Lecteur",
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Vérification de l'invitation...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitationData?.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Invitation invalide
            </h2>
            <p className="text-muted-foreground">
              Cette invitation n'est plus valide ou a expiré. Veuillez contacter
              l'équipe pour obtenir une nouvelle invitation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Rejoindre l'équipe</CardTitle>
          <CardDescription>
            Vous avez été invité en tant que{" "}
            <span className="font-semibold text-blue-600">collaborateur</span>{" "}
            dans l'organisation de{" "}
            <span className="font-semibold">
              {invitationData.recruteur.name}
            </span>
          </CardDescription>
        </CardHeader>

        {/* Informations sur l'invitation */}
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-3 border border-blue-200">
            <div className="text-center mb-3">
              <p className="text-sm text-blue-700 font-medium">
                En tant que collaborateur, vous aurez accès à l'espace de
                travail de cette organisation
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Email :</span>
              <span>{invitationData.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Rôle dans l'équipe :</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                {getRoleDisplay(invitationData.role)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Expire le :</span>
              <span>
                {new Date(invitationData.expiresAt).toLocaleDateString(
                  "fr-FR",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="prenom" className="text-sm font-medium">
                  Prénom
                </label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                  required
                  placeholder="Votre prénom"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="nom" className="text-sm font-medium">
                  Nom
                </label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  required
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
                placeholder="Minimum 6 caractères"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmer le mot de passe
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                minLength={6}
                placeholder="Confirmez votre mot de passe"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Rejoindre l'équipe...
                </>
              ) : (
                "Rejoindre l'équipe"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
