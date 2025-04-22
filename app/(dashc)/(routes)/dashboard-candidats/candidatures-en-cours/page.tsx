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
  FileText,
  Calendar,
} from "lucide-react";

const candidaturesEnCours = [
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
    status: "en_revue",
    dateCandidature: "15/03/2024",
    etapes: [
      { nom: "Candidature envoyée", date: "15/03/2024", statut: "complete" },
      { nom: "En revue", date: "En cours", statut: "current" },
      { nom: "Entretien", date: "À venir", statut: "pending" },
      { nom: "Décision", date: "À venir", statut: "pending" },
    ],
  },
  {
    id: 2,
    titre: "Data Scientist",
    entreprise: "AI Solutions",
    localisation: "Abidjan, Côte d'Ivoire",
    type: "CDI",
    salaire: "2 000 000 - 2 500 000 FCFA",
    date: "Il y a 1 jour",
    competences: ["Python", "Machine Learning", "TensorFlow"],
    description:
      "Nous recherchons un Data Scientist passionné pour travailler sur des projets innovants d'intelligence artificielle.",
    status: "entretien",
    dateCandidature: "14/03/2024",
    etapes: [
      { nom: "Candidature envoyée", date: "14/03/2024", statut: "complete" },
      { nom: "En revue", date: "14/03/2024", statut: "complete" },
      { nom: "Entretien", date: "20/03/2024", statut: "current" },
      { nom: "Décision", date: "À venir", statut: "pending" },
    ],
  },
];

const CandidaturesEnCoursPage = () => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState({
    status: "all",
    date: "all",
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "en_revue":
        return <Badge variant="secondary">En revue</Badge>;
      case "entretien":
        return <Badge variant="default">Entretien programmé</Badge>;
      case "en_attente":
        return <Badge variant="outline">En attente</Badge>;
      default:
        return <Badge variant="secondary">En cours</Badge>;
    }
  };

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
            <SelectItem value="en_revue">En revue</SelectItem>
            <SelectItem value="entretien">Entretien programmé</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
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

      {viewMode === "list" ? (
        <div className="grid gap-6">
          {candidaturesEnCours.map((candidature) => (
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
                  </div>
                  <div className="flex flex-col justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {candidature.competences.map((competence, index) => (
                        <Badge key={index} variant="outline">
                          {competence}
                        </Badge>
                      ))}
                    </div>
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
          {candidaturesEnCours.map((candidature) => (
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
                  <div className="flex flex-wrap gap-2">
                    {candidature.competences.map((competence, index) => (
                      <Badge key={index} variant="outline">
                        {competence}
                      </Badge>
                    ))}
                  </div>
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
