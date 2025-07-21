"use client";

import React, { useState, useEffect } from "react";
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
  FileText,
  Calendar,
  Loader2,
} from "lucide-react";
import { useAuthCandidat } from "@/hooks/useAuthCandidat";

interface Etape {
  nom: string;
  date: string;
  statut: "complete" | "current" | "pending";
  colonneId: string;
}

interface Candidature {
  id: string;
  titre: string;
  entreprise: string;
  localisation: string;
  type: string;
  salaire: string;
  description: string;
  dateCandidature: string;
  status: string;
  etapes: Etape[];
  message: string;
  colonneActuelle: {
    id: string;
    name: string;
    order: number;
    color: string;
  };
}

const CandidaturesEnCoursPage = () => {
  const { candidat } = useAuthCandidat();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState({
    status: "all",
    date: "all",
  });
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (candidat?.candidat?.id) {
      fetchCandidatures();
    }
  }, [candidat]);

  const fetchCandidatures = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/candidat/candidatures");
      const data = await response.json();

      if (data.success) {
        setCandidatures(data.data);
      } else {
        console.error(
          "Erreur lors du chargement des candidatures:",
          data.error
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des candidatures:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "nouvelles":
        return <Badge variant="secondary">Nouvelles</Badge>;
      case "en_revue":
        return <Badge variant="secondary">En revue</Badge>;
      case "entretien":
        return <Badge variant="default">Entretien programmé</Badge>;
      case "en_attente":
        return <Badge variant="outline">En attente</Badge>;
      case "acceptées":
        return (
          <Badge variant="default" className="bg-green-500">
            Acceptées
          </Badge>
        );
      case "refusées":
        return <Badge variant="destructive">Refusées</Badge>;
      default:
        return <Badge variant="secondary">En cours</Badge>;
    }
  };

  const filteredCandidatures = candidatures.filter((candidature) => {
    const matchesSearch =
      candidature.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidature.entreprise.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filters.status === "all" || candidature.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Candidatures en cours</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une candidature..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="nouvelles">Nouvelles</SelectItem>
            <SelectItem value="en_revue">En revue</SelectItem>
            <SelectItem value="entretien">Entretien programmé</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
            <SelectItem value="acceptées">Acceptées</SelectItem>
            <SelectItem value="refusées">Refusées</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.date}
          onValueChange={(value) => setFilters({ ...filters, date: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date de candidature" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les dates</SelectItem>
            <SelectItem value="today">Aujourd'hui</SelectItem>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCandidatures.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Aucune candidature trouvée
          </h3>
          <p className="text-muted-foreground">
            {candidatures.length === 0
              ? "Vous n'avez pas encore postulé à des offres d'emploi."
              : "Aucune candidature ne correspond à vos critères de recherche."}
          </p>
        </div>
      ) : viewMode === "list" ? (
        <div className="grid gap-6">
          {filteredCandidatures.map((candidature) => (
            <Card
              key={candidature.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">
                        {candidature.titre}
                      </h2>
                      {getStatusBadge(candidature.status)}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {candidature.entreprise}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {candidature.localisation}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {candidature.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Candidature du {candidature.dateCandidature}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {candidature.salaire}
                    </p>
                    {candidature.message && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Message :</strong> {candidature.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col justify-between gap-4">
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Voir la candidature
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">
                      Progression de la candidature
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    {candidature.etapes.map((etape, index) => (
                      <div
                        key={index}
                        className={`flex flex-col items-center ${
                          index < candidature.etapes.length - 1 ? "flex-1" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            etape.statut === "complete"
                              ? "bg-green-500 text-white"
                              : etape.statut === "current"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="text-xs text-center mt-1">
                          {etape.nom}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {etape.date}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidatures.map((candidature) => (
            <Card
              key={candidature.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">
                      {candidature.titre}
                    </h2>
                    {getStatusBadge(candidature.status)}
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {candidature.entreprise}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {candidature.localisation}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {candidature.type}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Candidature du {candidature.dateCandidature}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {candidature.salaire}
                  </p>
                  {candidature.message && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Message :</strong> {candidature.message}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Voir la candidature
                    </Button>
                  </div>
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Progression</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      {candidature.etapes.map((etape, index) => (
                        <div
                          key={index}
                          className={`flex flex-col items-center ${
                            index < candidature.etapes.length - 1
                              ? "flex-1"
                              : ""
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              etape.statut === "complete"
                                ? "bg-green-500 text-white"
                                : etape.statut === "current"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="text-xs text-center mt-1">
                            {etape.nom}
                          </div>
                        </div>
                      ))}
                    </div>
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

export default CandidaturesEnCoursPage;
