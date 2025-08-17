"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Filter,
  Users,
  Loader2,
  Eye,
  Mail,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CandidatDetailsModal from "@/app/components/CandidatDetailsModal";
import SearchSuggestions from "@/app/components/SearchSuggestions";

interface Candidat {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  ville: string;
  pays: string;
  bio: string;
  image: string;
  user: {
    email: string;
    image: string;
  };
  candidatCompetences: Array<{
    competence: string;
  }>;
  experiences: Array<{
    poste: string;
    entreprise: string;
    dateDebut: string;
    dateFin: string;
  }>;
  formations: Array<{
    diplome: string;
    etablissement: string;
    dateDebut: string;
    dateFin: string;
  }>;
}

interface SearchResponse {
  candidats: Candidat[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: Array<{
    competence: string;
    _count: {
      competence: number;
    };
  }>;
}

const competencesList = [
  "javascript",
  "typescript",
  "react",
  "nextjs",
  "nodejs",
  "python",
  "java",
  "php",
  "sql",
  "mongodb",
  "git",
  "docker",
  "aws",
  "uiux",
  "agile",
  "canva",
  "rédaction",
];

const paysList = [
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "BF", label: "Burkina Faso" },
  { value: "ML", label: "Mali" },
  { value: "SN", label: "Sénégal" },
  { value: "GN", label: "Guinée" },
  { value: "TG", label: "Togo" },
  { value: "BJ", label: "Bénin" },
  { value: "NE", label: "Niger" },
  { value: "CM", label: "Cameroun" },
  { value: "FR", label: "France" },
];

const RechercheCandidatsPage = () => {
  const [selectedCompetences, setSelectedCompetences] = useState<string[]>([]);
  const [competencesm, setCompetencesm] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useState("");
  const [selectedCandidat, setSelectedCandidat] = useState<Candidat | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Construire les paramètres de recherche
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCompetences.length > 0) {
      params.append("competences", selectedCompetences.join(","));
    }
    if (ville) {
      params.append("ville", ville);
    }
    if (pays) {
      params.append("pays", pays);
    }
    params.append("page", page.toString());
    if (competencesm) {
      params.append("competencesm", competencesm);
    }
    setSearchParams(params.toString());
  }, [selectedCompetences, ville, pays, page, competencesm]);

  // Requête de recherche
  const { data, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ["search-candidats", searchParams],
    queryFn: async () => {
      const response = await fetch(
        `/api/recruteur/search-candidats?${searchParams}`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }
      return response.json();
    },
    enabled: searchParams.length > 0,
  });

  const handleCompetenceToggle = (competence: string) => {
    setSelectedCompetences((prev) =>
      prev.includes(competence)
        ? prev.filter((c) => c !== competence)
        : [...prev, competence]
    );
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCompetences([]);
    setVille("");
    setPays("");
    setPage(1);
  };

  const getCompetenceMatchCount = (candidat: Candidat) => {
    if (selectedCompetences.length === 0) return 0;
    const candidatCompetences = candidat.candidatCompetences.map(
      (c) => c.competence
    );
    return selectedCompetences.filter((c) => candidatCompetences.includes(c))
      .length;
  };

  const getMatchPercentage = (candidat: Candidat) => {
    if (selectedCompetences.length === 0) return 0;
    const matchCount = getCompetenceMatchCount(candidat);
    return Math.round((matchCount / selectedCompetences.length) * 100);
  };

  if (error) {
    toast.error("Erreur lors de la recherche de candidats");
  }

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="text-2xl font-bold">Recherche de candidats</h1>
          <p className="text-muted-foreground">
            Trouvez les meilleurs talents selon vos critères
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {data?.pagination.total || 0} candidats trouvés
          </span>
        </div>
      </div>

      {/* Filtres de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 w-full">
            <Filter className="h-5 w-5" />
            Filtres de recherche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Compétences */}
          <div className="space-y-2">
            <Label>Compétences recherchées</Label>
            <div className="flex flex-wrap gap-2">
              {competencesList.map((competence) => (
                <Badge
                  key={competence}
                  variant={
                    selectedCompetences.includes(competence)
                      ? "default"
                      : "outline"
                  }
                  className={cn(
                    "cursor-pointer hover:bg-primary/10",
                    selectedCompetences.includes(competence) &&
                      "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handleCompetenceToggle(competence)}
                >
                  {competence.charAt(0).toUpperCase() + competence.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Compétences recherchées(manuel)</Label>
            <Input
              id="competencesm"
              placeholder="Ex: Javascript, React, Nodejs"
              value={competencesm}
              onChange={(e) => setCompetencesm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ville */}
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input
                id="ville"
                placeholder="Ex: Abidjan"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
              />
            </div>

            {/* Pays */}
            <div className="space-y-2">
              <Label htmlFor="pays">Pays</Label>
              <Select value={pays} onValueChange={setPays}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez un pays" />
                </SelectTrigger>
                <SelectContent>
                  {paysList.map((pays) => (
                    <SelectItem key={pays.value} value={pays.value}>
                      {pays.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recherche...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Effacer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions et statistiques */}
      <SearchSuggestions
        selectedCompetences={selectedCompetences}
        onCompetenceToggle={handleCompetenceToggle}
        stats={data?.stats}
      />

      {/* Résultats */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : data?.candidats && data.candidats.length > 0 ? (
          <>
            <div className="grid gap-4">
              {data.candidats.map((candidat) => (
                <Card
                  key={candidat.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar et infos principales */}
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={candidat.image || candidat.user.image}
                        />
                        <AvatarFallback>
                          {candidat.prenom?.[0]}
                          {candidat.nom?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        {/* En-tête avec nom et score de correspondance */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {candidat.prenom} {candidat.nom}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {candidat.ville},{" "}
                              {
                                paysList.find((p) => p.value === candidat.pays)
                                  ?.label
                              }
                            </div>
                          </div>
                          {selectedCompetences.length > 0 && (
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="font-semibold">
                                  {getMatchPercentage(candidat)}%
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getCompetenceMatchCount(candidat)}/
                                {selectedCompetences.length} compétences
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Compétences */}
                        {candidat.candidatCompetences.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {candidat.candidatCompetences
                              .slice(0, 6)
                              .map((comp) => (
                                <Badge
                                  key={comp.competence}
                                  variant={
                                    selectedCompetences.includes(
                                      comp.competence
                                    )
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {comp.competence.charAt(0).toUpperCase() +
                                    comp.competence.slice(1)}
                                </Badge>
                              ))}
                            {candidat.candidatCompetences.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{candidat.candidatCompetences.length - 6}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Bio */}
                        {candidat.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {candidat.bio}
                          </p>
                        )}

                        {/* Expériences récentes */}
                        {candidat.experiences.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Briefcase className="h-4 w-4" />
                              Expérience récente
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {candidat.experiences[0].poste} chez{" "}
                              {candidat.experiences[0].entreprise}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCandidat(candidat);
                              setIsModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir le profil
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4 mr-2" />
                            Contacter
                          </Button>
                          {candidat.telephone && (
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4 mr-2" />
                              Appeler
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={
                          page === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from(
                      { length: data.pagination.totalPages },
                      (_, i) => i + 1
                    ).map((pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPage(pageNum)}
                          isActive={pageNum === page}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setPage(
                            Math.min(data.pagination.totalPages, page + 1)
                          )
                        }
                        className={
                          page === data.pagination.totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucun candidat trouvé
              </h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche pour trouver plus
                de candidats.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de détails du candidat */}
      <CandidatDetailsModal
        candidat={selectedCandidat}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCandidat(null);
        }}
        selectedCompetences={selectedCompetences}
      />
    </div>
  );
};

export default RechercheCandidatsPage;
