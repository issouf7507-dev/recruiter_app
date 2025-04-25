"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Building,
  List,
  Grid,
  Filter,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/utils/utilts";
import { JobOffer } from "@/types/types";
import { matchUserWithOffers2 } from "@/utils/matchUserWithOffers";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import Link from "next/link";

const ToutesLesOffresPage = () => {
  const { candidat, loading: authLoading } = useUserStore();
  const [showCvAlert, setShowCvAlert] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState({
    type: "all",
    localisation: "all",
    experience: "all",
    salaire: "all",
  });

  const {
    data: offertData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["offertData"],
    queryFn: () => fetchData("/api/recruteur/offres"),
  });
  let matchOffersWithUser;

  console.log(candidat);

  if (candidat?.candidat?.nom) {
    matchOffersWithUser = matchUserWithOffers2(candidat, offertData?.data);
  }

  // console.log(matchOffersWithUser);

  const handlePostuler = async (jobOfferId: number) => {
    if (!candidat?.candidat?.cv || !candidat?.candidat?.letterm) {
      setShowCvAlert(true);
      return;
    }
    try {
      const response = await fetch("/api/candidat/postuler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobOfferId,
          message: "Je suis intéressé par cette offre",
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Candidature envoyée avec succès");
      } else {
        toast.error(result.error || "Erreur lors de la candidature");
      }
    } catch (error) {
      console.error("Erreur lors de la candidature:", error);
      toast.error("Erreur lors de la candidature");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Toutes les offres</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher une offre..." className="pl-8" />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-accent" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-accent" : ""}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select
          value={filters.type}
          onValueChange={(value) => setFilters({ ...filters, type: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type de contrat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="cdi">CDI</SelectItem>
            <SelectItem value="cdd">CDD</SelectItem>
            <SelectItem value="stage">Stage</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.localisation}
          onValueChange={(value) =>
            setFilters({ ...filters, localisation: value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Localisation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les localisations</SelectItem>
            <SelectItem value="abidjan">Abidjan</SelectItem>
            <SelectItem value="yamoussoukro">Yamoussoukro</SelectItem>
            <SelectItem value="bouake">Bouaké</SelectItem>
            <SelectItem value="remote">Télétravail</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.experience}
          onValueChange={(value) =>
            setFilters({ ...filters, experience: value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Expérience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les niveaux</SelectItem>
            <SelectItem value="debutant">Débutant</SelectItem>
            <SelectItem value="intermediaire">Intermédiaire</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.salaire}
          onValueChange={(value) => setFilters({ ...filters, salaire: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Salaire" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les salaires</SelectItem>
            <SelectItem value="0-1">0 - 1M FCFA</SelectItem>
            <SelectItem value="1-2">1M - 2M FCFA</SelectItem>
            <SelectItem value="2-3">2M - 3M FCFA</SelectItem>
            <SelectItem value="3+">3M+ FCFA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {viewMode === "list" ? (
        <div className="grid gap-6">
          {offertData &&
          matchOffersWithUser &&
          matchOffersWithUser.length > 0 ? (
            matchOffersWithUser.map((offre: JobOffer) => (
              <Card
                key={offre.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard-candidats/toutes-les-offres/${offre.id}`}
                          className="hover:underline"
                        >
                          <h2 className="text-xl font-semibold">
                            {offre.title}
                          </h2>
                        </Link>
                        <Badge variant="secondary" className="ml-2">
                          {offre.matchingPercentage} % match
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {offre.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {offre.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {offre.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(offre.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {offre.salaryMin} - {offre.salaryMax}{" "}
                        {offre.salaryCurrency}
                      </p>
                    </div>
                    <div className="flex flex-col justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {offre.competences.map((competence, index) => (
                          <Badge key={index} variant="outline">
                            {competence}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 items-center justify-end">
                        <Button variant="outline">Sauvegarder</Button>
                        <Button onClick={() => handlePostuler(offre.id)}>
                          Postuler
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {offre.description}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex min-h-[60vh] w-full items-center justify-center">
              <div className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Aucune offre disponible
                </h3>
                <p className="text-muted-foreground text-center">
                  Il n'y a actuellement aucune offre d'emploi correspondant à
                  votre profil.
                  <br />
                  Revenez plus tard pour découvrir de nouvelles opportunités.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offertData &&
          matchOffersWithUser &&
          matchOffersWithUser.length > 0 ? (
            matchOffersWithUser.map((offre) => (
              <Card
                key={offre.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">{offre.title}</h2>
                      <Badge variant="secondary" className="ml-2">
                        {offre.matchingPercentage}% match
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {offre.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {offre.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {offre.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(offre.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {offre.salaryMin} - {offre.salaryMax}{" "}
                      {offre.salaryCurrency}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {offre.competences.map((competence, index) => (
                        <Badge key={index} variant="outline">
                          {competence}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {offre.description}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Sauvegarder
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handlePostuler(offre.id)}
                      >
                        Postuler
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Aucune offre disponible
              </h3>
              <p className="text-muted-foreground text-center">
                Il n'y a actuellement aucune offre d'emploi correspondant à
                votre profil.
                <br />
                Revenez plus tard pour découvrir de nouvelles opportunités.
              </p>
            </div>
          )}
        </div>
      )}

      <Dialog open={showCvAlert} onOpenChange={setShowCvAlert}>
        <DialogContent className="w-lg">
          <DialogHeader>
            <DialogTitle>Documents importants manquants</DialogTitle>
            <DialogDescription>
              Pour maximiser vos chances de trouver un emploi, il est important
              de compléter votre profil en ajoutant votre CV et votre lettre de
              motivation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Ces documents sont essentiels pour que les recruteurs puissent
              vous connaître et vous contacter.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCvAlert(false)}>
              Plus tard
            </Button>
            <Button asChild>
              <Link href="/dashboard-candidats/informations-personnelles">
                Compléter mon profil
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ToutesLesOffresPage;
