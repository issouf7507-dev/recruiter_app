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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Loader2,
  UserPlus,
  Mail,
  Lock,
  User,
  Calendar,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [invitationData, setInvitationData] = useState<{
    email: string;
    role: string;
    entreprise?: string;
  } | null>(null);
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
        throw new Error("Token invalide");
      }
      const data = await response.json();
      console.log("data", data);
      setInvitationData(data);
      console.log("invitationData", invitationData);
      setIsValid(true);
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

    if (formData.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

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

      toast.success(
        "Invitation acceptée avec succès ! Bienvenue dans l'équipe"
      );
      router.push("/recruteur/connexion");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'acceptation de l'invitation"
      );
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      ADMIN: "bg-red-100 text-red-800",
      COLLABORATEUR: "bg-blue-100 text-blue-800",
    };

    return (
      <Badge
        className={
          roleColors[role as keyof typeof roleColors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {role === "ADMIN" ? "Administrateur" : "Collaborateur"}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Vérification de l'invitation
            </h2>
            <p className="text-muted-foreground">
              Nous vérifions la validité de votre invitation...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-red-600">
              Invitation invalide
            </h2>
            <p className="text-muted-foreground mb-6">
              Cette invitation n'est plus valide ou a expiré. Veuillez contacter
              l'administrateur.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 w-fit">
            <UserPlus className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Accepter l'invitation</CardTitle>
          <CardDescription className="text-base">
            Complétez vos informations pour rejoindre l'équipe
          </CardDescription>
        </CardHeader>

        {invitationData && (
          <div className="px-6 pb-4">
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-medium text-blue-900">
                  Détails de l'invitation
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email :</span>
                  <span className="font-medium">{invitationData.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rôle :</span>
                  {getRoleBadge(invitationData.role)}
                </div>
                {invitationData.entreprise && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Entreprise :</span>
                    <span className="font-medium">
                      {invitationData.entreprise}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Prénom
                </Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                  placeholder="Votre prénom"
                  required
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nom
                </Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  placeholder="Votre nom"
                  required
                  className=" bg-transparent shadow-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Minimum 8 caractères"
                  required
                  minLength={8}
                  className="pr-10 transition-all focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formData.password.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {formData.password.length >= 8 ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Mot de passe valide
                    </span>
                  ) : (
                    <span className="text-yellow-600">
                      Le mot de passe doit contenir au moins 8 caractères
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirmez votre mot de passe"
                  required
                  minLength={8}
                  className="pr-10 transition-all focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formData.confirmPassword.length > 0 && (
                <div className="text-xs">
                  {formData.password === formData.confirmPassword ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Les mots de passe correspondent
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Les mots de passe ne correspondent pas
                    </span>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-primary to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3"
              size="lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accepter l'invitation
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              En acceptant cette invitation, vous acceptez les conditions
              d'utilisation de la plateforme.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
