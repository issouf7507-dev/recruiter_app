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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  UserPlus,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  MoreVertical,
  Calendar,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
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

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitation/${invitationId}/resend`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors du renvoi de l'invitation");
      }

      toast.success("Invitation renvoyée avec succès");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors du renvoi de l'invitation"
      );
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitation/${invitationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la suppression de l'invitation"
        );
      }

      toast.success("Invitation supprimée avec succès");
      fetchInvitations();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message + "sd"
          : "Erreur lors de la suppression de l'invitation"
      );
    }
  };

  const getStatusBadge = (accepted: boolean) => {
    if (accepted) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Acceptée
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
        <Clock className="h-3 w-3 mr-1" />
        En attente
      </Badge>
    );
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

  const filteredInvitations = invitations.filter((invitation) => {
    const matchesSearch =
      invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invitation.collaborateur &&
        `${invitation.collaborateur.prenom} ${invitation.collaborateur.nom}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "accepted" && invitation.accepted) ||
      (statusFilter === "pending" && !invitation.accepted);

    const matchesRole = roleFilter === "all" || invitation.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const stats = {
    total: invitations.length,
    accepted: invitations.filter((inv) => inv.accepted).length,
    pending: invitations.filter((inv) => !inv.accepted).length,
  };

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des invitations</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter un collaborateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
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
                    <SelectItem value="USER">Collaborateur</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="VIEWER">Lecteur</SelectItem>
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

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex flex-col flex-grow">
              <span className="text-sm text-muted-foreground">
                Total invitations
              </span>
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex flex-col flex-grow">
              <span className="text-sm text-muted-foreground">Acceptées</span>
              <span className="text-2xl font-bold text-green-600">
                {stats.accepted}
              </span>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex flex-col flex-grow">
              <span className="text-sm text-muted-foreground">En attente</span>
              <span className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </span>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email ou nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="accepted">Acceptées</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="ADMIN">Administrateur</SelectItem>
                <SelectItem value="COLLABORATEUR">Collaborateur</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchInvitations}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des invitations */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredInvitations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || roleFilter !== "all"
                  ? "Aucune invitation ne correspond aux critères de recherche"
                  : "Aucune invitation en attente"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInvitations.map((invitation) => (
            <Card
              key={invitation.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-lg">
                        {invitation.email}
                      </CardTitle>
                      {getStatusBadge(invitation.accepted)}
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(invitation.role)}
                      </div>
                      {invitation.collaborateur && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {invitation.collaborateur.prenom}{" "}
                          {invitation.collaborateur.nom}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!invitation.accepted && (
                        <DropdownMenuItem
                          onClick={() => handleResendInvitation(invitation.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renvoyer l'invitation
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDeleteInvitation(invitation.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Invitée le{" "}
                  {new Date(invitation.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
