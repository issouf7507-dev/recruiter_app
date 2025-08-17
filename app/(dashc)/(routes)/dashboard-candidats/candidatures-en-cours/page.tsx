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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  TrendingUp,
  Eye,
  ExternalLink,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  Star,
  Users,
  Target,
  X,
  Download,
  MessageSquare,
  Phone,
  Mail,
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
  jobOfferId: number;
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
  const [selectedCandidature, setSelectedCandidature] =
    useState<Candidature | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        console.log("data", data.data);
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
        return (
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Nouvelles
          </Badge>
        );
      case "en_revue":
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800">
            <Eye className="w-3 h-3 mr-1" />
            En revue
          </Badge>
        );
      case "entretien":
        return (
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 border-purple-200 dark:border-purple-800">
            <Users className="w-3 h-3 mr-1" />
            Entretien programmé
          </Badge>
        );
      case "en_attente":
        return (
          <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case "acceptées":
        return (
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Acceptées
          </Badge>
        );
      case "refusées":
        return (
          <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 border-red-200 dark:border-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Refusées
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700">
            <Target className="w-3 h-3 mr-1" />
            En cours
          </Badge>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nouvelles":
        return "border-l-blue-500 dark:border-l-blue-400";
      case "en_revue":
        return "border-l-yellow-500 dark:border-l-yellow-400";
      case "entretien":
        return "border-l-purple-500 dark:border-l-purple-400";
      case "en_attente":
        return "border-l-orange-500 dark:border-l-orange-400";
      case "acceptées":
        return "border-l-green-500 dark:border-l-green-400";
      case "refusées":
        return "border-l-red-500 dark:border-l-red-400";
      default:
        return "border-l-gray-500 dark:border-l-gray-400";
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

  const handleViewDetails = (candidature: Candidature) => {
    setSelectedCandidature(candidature);
    console.log(candidature);
    setIsModalOpen(true);
  };

  const stats = {
    total: candidatures.length,
    nouvelles: candidatures.filter((c) => c.status === "nouvelles").length,
    enRevue: candidatures.filter((c) => c.status === "en_revue").length,
    entretien: candidatures.filter((c) => c.status === "entretien").length,
    acceptees: candidatures.filter((c) => c.status === "acceptées").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center w-full">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full blur-xl opacity-20 animate-pulse"></div>
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            Chargement de vos candidatures...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full overflow-y-auto">
      <div className="p-6 space-y-8 mx-auto">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/20 rounded-2xl opacity-50"></div>
          <div className="relative p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-xl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Mes Candidatures
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  Suivez l'évolution de vos candidatures et restez informé de
                  chaque étape de votre parcours professionnel.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchCandidatures}
                  className="hover:bg-accent hover:border-accent-foreground transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card border border-border shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une candidature..."
                  className="pl-10 bg-background border-border focus:border-primary focus:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger className="w-[160px] bg-background border-border">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="nouvelles">Nouvelles</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>

                      <SelectItem value="finalisées">Finalisées</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.date}
                    onValueChange={(value) =>
                      setFilters({ ...filters, date: value })
                    }
                  >
                    <SelectTrigger className="w-[160px] bg-background border-border">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les dates</SelectItem>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-1 bg-muted p-1 rounded-lg">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={
                      viewMode === "list"
                        ? "bg-background shadow-sm"
                        : "hover:bg-muted/50"
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={
                      viewMode === "grid"
                        ? "bg-background shadow-sm"
                        : "hover:bg-muted/50"
                    }
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredCandidatures.length === 0 ? (
          <Card className="bg-card border border-border shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="relative">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full blur-2xl opacity-10"></div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucune candidature trouvée
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {candidatures.length === 0
                  ? "Commencez votre recherche d'emploi en postulant à des offres qui correspondent à votre profil."
                  : "Aucune candidature ne correspond à vos critères de recherche."}
              </p>
              {candidatures.length === 0 && (
                <Button className="mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground">
                  <Target className="h-4 w-4 mr-2" />
                  Découvrir des offres
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "list" ? (
          <div className="space-y-4">
            {filteredCandidatures.map((candidature, index) => (
              <Card
                key={candidature.id}
                className={`bg-card border-l-4 ${getStatusColor(
                  candidature.status
                )} border-border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                              {candidature.titre}
                            </h2>
                            {getStatusBadge(candidature.status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full">
                              <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium text-foreground">
                                {candidature.entreprise}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-full">
                              <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="text-foreground">
                                {candidature.localisation}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/30 px-3 py-1 rounded-full">
                              <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <span className="text-foreground">
                                {candidature.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/30 px-3 py-1 rounded-full">
                              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              <span className="text-foreground">
                                Candidature du {candidature.dateCandidature}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {candidature.salaire && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {candidature.salaire}
                          </span>
                        </div>
                      )}

                      {candidature.message && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">
                              Message :
                            </strong>{" "}
                            {candidature.message}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between gap-4 lg:w-48">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 hover:bg-accent hover:border-accent-foreground transition-all duration-200"
                          onClick={() => handleViewDetails(candidature)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Progression de la candidature
                    </h3>
                    <div className="relative">
                      <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted"></div>
                      <div className="flex items-center justify-between relative">
                        {candidature.etapes.map((etape, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center relative z-10"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-lg transition-all duration-300 ${
                                etape.statut === "complete"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                  : etape.statut === "current"
                                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground ring-4 ring-primary/20"
                                  : "bg-muted text-muted-foreground border-2 border-border"
                              }`}
                            >
                              {etape.statut === "complete" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : etape.statut === "current" ? (
                                <Clock className="h-4 w-4" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="text-xs text-center mt-2 font-medium text-foreground">
                              {etape.nom}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {etape.nom === "Refusées"
                                ? "Refusé"
                                : etape.nom === "Finalisées"
                                ? "Finalisées"
                                : etape.date}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCandidatures.map((candidature, index) => (
              <Card
                key={candidature.id}
                className={`bg-card border-l-4 ${getStatusColor(
                  candidature.status
                )} border-border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h2 className="text-lg font-bold text-foreground line-clamp-2 hover:text-primary transition-colors">
                          {candidature.titre}
                        </h2>
                        {getStatusBadge(candidature.status)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-foreground">
                            {candidature.entreprise}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{candidature.localisation}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="h-4 w-4" />
                          <span>{candidature.type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Candidature du {candidature.dateCandidature}
                          </span>
                        </div>
                      </div>
                    </div>

                    {candidature.salaire && (
                      <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/30 p-2 rounded-lg">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-foreground">
                          {candidature.salaire}
                        </span>
                      </div>
                    )}

                    {candidature.message && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          <strong className="text-foreground">Message :</strong>{" "}
                          {candidature.message}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 hover:bg-accent hover:border-accent-foreground transition-all duration-200"
                        onClick={() => handleViewDetails(candidature)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:bg-accent hover:border-accent-foreground transition-all duration-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Compact Progress */}
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        Progression
                      </h3>
                      <div className="flex items-center justify-between">
                        {candidature.etapes.map((etape, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                etape.statut === "complete"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                  : etape.statut === "current"
                                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground ring-2 ring-primary/20"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {etape.statut === "complete" ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="text-xs text-center mt-1 text-muted-foreground font-medium">
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

        {/* Modal de détails de candidature */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">
                Détails de la candidature
              </DialogTitle>
            </DialogHeader>

            {selectedCandidature && (
              <div className="space-y-6">
                {/* En-tête de l'offre */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/20 p-6 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-foreground">
                        {selectedCandidature.titre}
                      </h2>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span className="font-medium">
                            {selectedCandidature.entreprise}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedCandidature.localisation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span>{selectedCandidature.type}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(selectedCandidature.status)}
                  </div>
                </div>

                {/* Informations principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Informations de candidature
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Date de candidature:
                          </span>
                          <span className="font-medium">
                            {selectedCandidature.dateCandidature}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Statut actuel:
                          </span>
                          <span className="font-medium">
                            {selectedCandidature.colonneActuelle.name}
                          </span>
                        </div>
                        {selectedCandidature.salaire && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Salaire:
                            </span>
                            <span className="font-medium">
                              {selectedCandidature.salaire.replaceAll(",", " ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Actions rapides
                      </h3>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            window.location.href = `/dashboard-candidats/toutes-les-offres/${selectedCandidature.jobOfferId}`;
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Voir l'offre complète
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description de l'offre */}
                {selectedCandidature.description && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Description de l'offre
                      </h3>
                      <div
                        className="text-sm text-muted-foreground bg-muted p-4 rounded-lg"
                        dangerouslySetInnerHTML={{
                          __html: selectedCandidature.description,
                        }}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Message de candidature */}
                {selectedCandidature.message && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Votre message de candidature
                      </h3>
                      <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                        {selectedCandidature.message}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Progression détaillée */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Progression détaillée de la candidature
                    </h3>
                    <div className="space-y-4">
                      {selectedCandidature.etapes.map((etape, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
                            etape.statut === "complete"
                              ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                              : etape.statut === "current"
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-muted border border-border"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                              etape.statut === "complete"
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                : etape.statut === "current"
                                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground ring-4 ring-primary/20"
                                : "bg-muted text-muted-foreground border-2 border-border"
                            }`}
                          >
                            {etape.statut === "complete" ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">
                              {etape.nom}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {etape.date}
                            </p>
                          </div>
                          {etape.statut === "current" && (
                            <Badge className="bg-primary/20 text-primary">
                              En cours
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CandidaturesEnCoursPage;
