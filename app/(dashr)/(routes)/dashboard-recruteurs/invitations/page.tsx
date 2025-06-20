"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Invitation {
  id: string;
  email: string;
  role: string;
  accepted: boolean;
  createdAt: string;
  collaborateur?: {
    nom: string;
    prenom: string;
  };
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: "",
    role: "",
  });

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch("/api/invitation");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des invitations");
      const data = await response.json();
      setInvitations(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des invitations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    try {
      const response = await fetch("/api/invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newInvitation),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success("Invitation envoyée avec succès");
      setIsDialogOpen(false);
      setNewInvitation({ email: "", role: "" });
      fetchInvitations();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de l'invitation"
      );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des invitations</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Inviter un collaborateur</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inviter un collaborateur</DialogTitle>
              <DialogDescription>
                Envoyez une invitation à un nouveau collaborateur
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={newInvitation.email}
                  onChange={(e) =>
                    setNewInvitation({
                      ...newInvitation,
                      email: e.target.value,
                    })
                  }
                  placeholder="collaborateur@example.com"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="role">Rôle</label>
                <Select
                  value={newInvitation.role}
                  onValueChange={(value) =>
                    setNewInvitation({ ...newInvitation, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrateur</SelectItem>
                    <SelectItem value="COLLABORATEUR">Collaborateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateInvitation}>
                Envoyer l'invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div>Chargement...</div>
        ) : invitations.length === 0 ? (
          <Card>
            <CardContent className="py-6">
              <p className="text-center text-muted-foreground">
                Aucune invitation en attente
              </p>
            </CardContent>
          </Card>
        ) : (
          invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{invitation.email}</span>
                  <span
                    className={`text-sm ${
                      invitation.accepted ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {invitation.accepted ? "Acceptée" : "En attente"}
                  </span>
                </CardTitle>
                <CardDescription>
                  Rôle : {invitation.role}
                  {invitation.collaborateur &&
                    ` • ${invitation.collaborateur.prenom} ${invitation.collaborateur.nom}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Invitée le{" "}
                  {new Date(invitation.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
