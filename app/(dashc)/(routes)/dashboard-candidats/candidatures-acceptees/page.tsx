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
  CheckCircle2,
  Mail,
  Phone,
} from "lucide-react";

const candidaturesAcceptees = [
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
    dateAcceptation: "20/03/2024",
    dateDebut: "01/04/2024",
    contact: {
      nom: "Jean Dupont",
      email: "jean.dupont@techcorp.com",
      telephone: "+225 07 07 07 07 07",
      poste: "Responsable RH",
    },
    documents: [
      { nom: "Contrat de travail", statut: "à signer" },
      { nom: "Fiche de poste", statut: "à consulter" },
      { nom: "Guide d'intégration", statut: "à consulter" },
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
    dateAcceptation: "19/03/2024",
    dateDebut: "01/04/2024",
    contact: {
      nom: "Marie Martin",
      email: "marie.martin@aisolutions.com",
      telephone: "+225 07 08 08 08 08",
      poste: "Responsable RH",
    },
    documents: [
      { nom: "Contrat de travail", statut: "à signer" },
      { nom: "Fiche de poste", statut: "à consulter" },
      { nom: "Guide d'intégration", statut: "à consulter" },
    ],
  },
];

const CandidaturesAccepteesPage = () => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState({
    date: "all",
  });

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Candidatures acceptées</h1>
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
            <SelectValue placeholder="Date d'acceptation" />
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
          {candidaturesAcceptees.map((candidature) => (
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
                      <Badge className="ml-2">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Acceptée
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
                        Début le {candidature.dateDebut}
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
                        Voir les documents
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Contact RH</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {candidature.contact.nom}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {candidature.contact.poste}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${candidature.contact.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {candidature.contact.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <a
                          href={`tel:${candidature.contact.telephone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {candidature.contact.telephone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">
                    Documents à traiter
                  </h3>
                  <div className="grid gap-2">
                    {candidature.documents.map((document, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <span className="text-sm">{document.nom}</span>
                        <Badge
                          variant={
                            document.statut === "à signer"
                              ? "default"
                              : "outline"
                          }
                        >
                          {document.statut}
                        </Badge>
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
          {candidaturesAcceptees.map((candidature) => (
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
                    <Badge className="ml-2">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Acceptée
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
                      Début le {candidature.dateDebut}
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
                      Voir les documents
                    </Button>
                  </div>
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Contact RH</h3>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {candidature.contact.nom}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {candidature.contact.poste}
                      </p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${candidature.contact.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {candidature.contact.email}
                        </a>
                      </div>
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

export default CandidaturesAccepteesPage;
