"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TestAccessPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <div>Non authentifié</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Test d'accès - Informations utilisateur
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'utilisateur connecté</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Nom:</strong> {user.name}
          </div>
          <div>
            <strong>Type:</strong>{" "}
            <Badge
              variant={user.type === "RECRUTEUR" ? "default" : "secondary"}
            >
              {user.type}
            </Badge>
          </div>

          {user.type === "RECRUTEUR" && user.recruteur && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Informations Recruteur:</h3>
              <div>
                <strong>ID Recruteur:</strong> {user.recruteur.id}
              </div>
              <div>
                <strong>Nom:</strong> {user.recruteur.name}
              </div>
              <div>
                <strong>Entreprise:</strong>{" "}
                {user.recruteur.entreprise || "Non spécifié"}
              </div>
            </div>
          )}

          {user.type === "COLLABORATEUR" && user.collaborateur && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold mb-2">
                Informations Collaborateur:
              </h3>
              <div>
                <strong>ID Collaborateur:</strong> {user.collaborateur.id}
              </div>
              <div>
                <strong>Nom:</strong> {user.collaborateur.nom}
              </div>
              <div>
                <strong>Prénom:</strong> {user.collaborateur.prenom}
              </div>
              <div>
                <strong>Rôle:</strong> {user.collaborateur.role}
              </div>
              <div>
                <strong>ID Recruteur associé:</strong>{" "}
                {user.collaborateur.recruteurId}
              </div>
              {user.collaborateur.recruteur && (
                <div className="mt-2 p-2 bg-white rounded">
                  <strong>Recruteur associé:</strong>{" "}
                  {user.collaborateur.recruteur.name}
                  {user.collaborateur.recruteur.entreprise && (
                    <span> ({user.collaborateur.recruteur.entreprise})</span>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test d'accès aux données</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cette page confirme que vous avez accès au dashboard recruteur.
            {user.type === "COLLABORATEUR"
              ? " En tant que collaborateur, vous ne verrez que les données du recruteur qui vous a invité."
              : " En tant que recruteur principal, vous avez accès à toutes vos données."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
