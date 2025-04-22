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
  XCircle,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

const candidaturesRefusees = [
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
    dateRefus: "20/03/2024",
    feedback: {
      raison: "Expérience insuffisante dans le domaine",
      suggestions: [
        "Renforcer vos compétences en React et Node.js",
        "Participer à des projets open source",
        "Obtenir des certifications pertinentes",
      ],
      commentaire:
        "Votre profil est intéressant mais nous recherchons quelqu'un avec plus d'expérience dans le développement d'applications à grande échelle.",
    },
    offresSimilaires: [
      {
        id: 101,
        titre: "Développeur Frontend Junior",
        entreprise: "WebTech",
        localisation: "Abidjan, Côte d'Ivoire",
        type: "CDI",
        salaire: "1 000 000 - 1 500 000 FCFA",
      },
      {
        id: 102,
        titre: "Développeur Backend",
        entreprise: "DataFlow",
        localisation: "Abidjan, Côte d'Ivoire",
        type: "CDI",
        salaire: "1 200 000 - 1 800 000 FCFA",
      },
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
    dateRefus: "19/03/2024",
    feedback: {
      raison: "Profil trop junior pour le poste",
      suggestions: [
        "Acquérir plus d'expérience en Machine Learning",
        "Développer des projets personnels en IA",
        "Participer à des compétitions de data science",
      ],
      commentaire:
        "Votre profil montre un bon potentiel, mais nous recherchons quelqu'un avec plus d'expérience pratique en Machine Learning.",
    },
    offresSimilaires: [
      {
        id: 201,
        titre: "Data Analyst",
        entreprise: "Analytics Pro",
        localisation: "Abidjan, Côte d'Ivoire",
        type: "CDI",
        salaire: "1 500 000 - 2 000 000 FCFA",
      },
      {
        id: 202,
        titre: "Machine Learning Engineer Junior",
        entreprise: "AI Start",
        localisation: "Abidjan, Côte d'Ivoire",
        type: "CDI",
        salaire: "1 800 000 - 2 200 000 FCFA",
      },
    ],
  },
];

const CandidaturesRefuseesPage = () => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState({
    date: "all",
  });

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Candidatures refusées</h1>
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
          value={filters.date}
          onValueChange={(value) => setFilters({ ...filters, date: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date de refus" />
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
          {candidaturesRefusees.map((candidature) => (
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
                      <Badge variant="destructive" className="ml-2">
                        <XCircle className="h-4 w-4 mr-1" />
                        Refusée
                      </Badge>
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
                        Refus le {candidature.dateRefus}
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
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Feedback de l'entreprise
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Raison du refus :</p>
                      <p className="text-sm text-muted-foreground">
                        {candidature.feedback.raison}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Commentaire :</p>
                      <p className="text-sm text-muted-foreground">
                        {candidature.feedback.commentaire}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Suggestions d'amélioration :
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {candidature.feedback.suggestions.map(
                          (suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Offres similaires suggérées
                  </h3>
                  <div className="grid gap-2">
                    {candidature.offresSimilaires.map((offre) => (
                      <div
                        key={offre.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div>
                          <p className="text-sm font-medium">{offre.titre}</p>
                          <p className="text-xs text-muted-foreground">
                            {offre.entreprise} - {offre.localisation}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Voir l'offre
                        </Button>
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
          {candidaturesRefusees.map((candidature) => (
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
                    <Badge variant="destructive" className="ml-2">
                      <XCircle className="h-4 w-4 mr-1" />
                      Refusée
                    </Badge>
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
                      Refus le {candidature.dateRefus}
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
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">
                      Raison du refus
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {candidature.feedback.raison}
                    </p>
                  </div>
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">
                      Offres similaires
                    </h3>
                    <div className="space-y-2">
                      {candidature.offresSimilaires.map((offre) => (
                        <div
                          key={offre.id}
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <div>
                            <p className="text-sm font-medium">{offre.titre}</p>
                            <p className="text-xs text-muted-foreground">
                              {offre.entreprise}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
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

export default CandidaturesRefuseesPage;
