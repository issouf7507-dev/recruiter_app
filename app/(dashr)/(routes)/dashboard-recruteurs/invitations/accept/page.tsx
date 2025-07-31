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

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
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

      toast.success("Invitation acceptée avec succès");
      router.push("/recruteur/connexion");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'acceptation de l'invitation"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 w-full overflow-y-auto">
        <Card>
          <CardContent className="py-6">
            <p className="text-center">Vérification de l'invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="container mx-auto py-6 w-full overflow-y-auto">
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-red-600">
              Cette invitation n'est plus valide ou a expiré
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 w-full overflow-y-auto">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Accepter l'invitation</CardTitle>
          <CardDescription>
            Complétez vos informations pour rejoindre l'équipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="prenom">Prénom</label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) =>
                  setFormData({ ...formData, prenom: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="nom">Nom</label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) =>
                  setFormData({ ...formData, nom: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password">Mot de passe</label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full">
              Accepter l'invitation
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
