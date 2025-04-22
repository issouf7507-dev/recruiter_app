"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  Building,
  MapPin,
  Calendar,
  Users,
  LayoutGrid,
  List,
  Search,
  Filter,
  Loader2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchData, deleteData } from "@/utils/utilts";
import { JobOffer } from "@/types/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/store/userStore";

// Type pour une offre d'emploi

type ViewMode = "grid" | "list";

export default function MesOffres() {
  // const { user, loading } = useAuth();
  const { user, loading } = useUserStore();

  const {
    data: offertData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["offertData123"],
    queryFn: () =>
      fetchData(`/api/recruteur/offresbyuser/${user?.recruteur?.id}`),
  });

  // console.log("bb:", ss);
  // console.log("aa:", user);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const deleteOffer = async (offer: JobOffer) => {
    try {
      await deleteData(`/api/recruteur/offres/${offer.id}`).then((res) => {
        if (res.success) {
          toast("L'offre a été supprimée avec succès");
          refetch();
        }
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    }
  };

  const filteredOffers = offertData?.data.filter((offer: JobOffer) => {
    const matchesSearch =
      offer?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer?.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer?.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || offer.etat === statusFilter;

    // return matchesSearch;
    return matchesSearch && matchesStatus;
  });

  if (isLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const OfferCard = ({ offer }: { offer: JobOffer }) => (
    <Card className="flex flex-col bg-background">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{offer.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{offer.type}</p>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs ${
              offer.etat === "active"
                ? "bg-green-100 text-green-800"
                : offer.etat === "draft"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {offer.etat === "active"
              ? "Active"
              : offer.etat === "draft"
              ? "Brouillon"
              : "Fermée"}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4" />
            {offer.company}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {offer.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date(offer.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {offer.applications?.length} candidat
            {offer.applications?.length > 1 ? "s" : ""}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => (window.location.href = `/mesoffres/${offer.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() =>
            (window.location.href = `/mesoffres/modifier/${offer.id}`)
          }
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Cela supprimera définitivement
                l'offre "{offer.title}" et toutes les données associées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteOffer(offer)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );

  const OfferListItem = ({ offer }: { offer: JobOffer }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
      <div className="flex items-center gap-6 flex-1">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">{offer.title}</h3>
            <span className="text-sm text-muted-foreground">{offer.type}</span>
            <div
              className={`px-2 py-1 rounded-full text-xs ${
                offer.etat === "active"
                  ? "bg-green-100 text-green-800"
                  : offer.etat === "draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {offer.etat === "active"
                ? "Active"
                : offer.etat === "draft"
                ? "Brouillon"
                : "Fermée"}
            </div>
          </div>
          <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              {offer.company}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {offer.location}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(offer.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {offer.applications?.length} candidat
              {offer.applications?.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => (window.location.href = `/mesoffres/${offer.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() =>
            (window.location.href = `/mesoffres/modifier/${offer.id}`)
          }
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Cela supprimera définitivement
                l'offre "{offer.title}" et toutes les données associées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteOffer(offer)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mes Offres d'Emploi</h1>
        <Link href="/mesoffres/creer">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Créer une offre
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une offre..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="closed">Fermée</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* {filteredOffers.map((offer) => ( */}
          {filteredOffers?.map((offer: any) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOffers.map((offer: JobOffer) => (
            <OfferListItem key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
