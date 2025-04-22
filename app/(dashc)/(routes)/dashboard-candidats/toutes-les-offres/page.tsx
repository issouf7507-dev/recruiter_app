"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const offres = [
  {
    id: 1,
    titre: "Développeur Full Stack",
    entreprise: "TechCorp Inc.",
    localisation: "Abidjan, Côte d'Ivoire",
    type: "CDI",
    salaire: "1 500 000 - 2 000 000 FCFA",
    date: "Il y a 2 jours",
    competences: ["React", "Node.js", "MongoDB"],
    description:
      "Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe de développement agile.",
    match: 95,
  },
  {
    id: 2,
    titre: "Designer UI/UX",
    entreprise: "Digital Solutions",
    localisation: "Abidjan, Côte d'Ivoire",
    type: "CDI",
    salaire: "1 200 000 - 1 800 000 FCFA",
    date: "Il y a 3 jours",
    competences: ["Figma", "Adobe XD", "UI/UX"],
    description:
      "Rejoignez notre équipe créative en tant que Designer UI/UX pour créer des expériences utilisateur exceptionnelles.",
    match: 88,
  },
  {
    id: 3,
    titre: "Data Scientist",
    entreprise: "AI Solutions",
    localisation: "Abidjan, Côte d'Ivoire",
    type: "CDI",
    salaire: "2 000 000 - 2 500 000 FCFA",
    date: "Il y a 1 jour",
    competences: ["Python", "Machine Learning", "TensorFlow"],
    description:
      "Nous recherchons un Data Scientist passionné pour travailler sur des projets innovants d'intelligence artificielle.",
    match: 92,
  },
  {
    id: 4,
    titre: "Chef de Projet IT",
    entreprise: "TechVision",
    localisation: "Yamoussoukro, Côte d'Ivoire",
    type: "CDI",
    salaire: "2 500 000 - 3 000 000 FCFA",
    date: "Il y a 5 jours",
    competences: ["Gestion de projet", "Agile", "Scrum"],
    description:
      "Nous recherchons un Chef de Projet IT pour piloter nos projets digitaux et assurer leur succès.",
    match: 85,
  },
  {
    id: 5,
    titre: "Développeur Mobile",
    entreprise: "AppTech",
    localisation: "Bouaké, Côte d'Ivoire",
    type: "CDD",
    salaire: "1 800 000 - 2 200 000 FCFA",
    date: "Il y a 4 jours",
    competences: ["React Native", "Flutter", "iOS", "Android"],
    description:
      "Rejoignez notre équipe en tant que Développeur Mobile pour créer des applications innovantes.",
    match: 90,
  },
  {
    id: 6,
    titre: "DevOps Engineer",
    entreprise: "CloudTech",
    localisation: "Abidjan, Côte d'Ivoire",
    type: "CDI",
    salaire: "2 200 000 - 2 800 000 FCFA",
    date: "Il y a 6 jours",
    competences: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    description:
      "Nous recherchons un DevOps Engineer pour optimiser nos processus de déploiement et d'infrastructure.",
    match: 87,
  },
];

const ToutesLesOffresPage = () => {
  const { user, loading: authLoading } = useUserStore();
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
  if (user?.candidat?.nom) {
    matchOffersWithUser = matchUserWithOffers2(user, offertData?.data);
  }
  console.log();

  const handlePostuler = async (jobOfferId: number) => {
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
            matchOffersWithUser?.map((offre: JobOffer) => (
              <Card
                key={offre.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">{offre.title}</h2>
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
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offertData &&
            matchOffersWithUser?.map((offre) => (
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
            ))}
        </div>
      )}
    </div>
  );
};

export default ToutesLesOffresPage;
