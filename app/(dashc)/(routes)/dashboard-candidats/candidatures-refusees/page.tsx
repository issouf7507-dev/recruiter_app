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
} from "@/components/ui/dialog";
import {
  Search,
  MapPin,
  Briefcase,
  Building,
  List,
  Grid,
  FileText,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  Eye,
  Users,
  Star,
  MessageSquare,
  CheckSquare,
  AlertCircle,
  User,
  Clock,
  X,
} from "lucide-react";
// import { useAuthCandidat } from "@/hooks/useAuthCandidat";
import { useSession } from "@/lib/auth-client";

interface Contact {
  nom: string;
  email: string;
  telephone: string;
  poste: string;
  entreprise: string;
}

interface Document {
  id: string;
  nom: string;
  url?: string;
  type?: string;
  taille?: number;
  uploadePar: string;
  statut: string;
  dateUpload: string;
}

interface ProchainEtape {
  id: string;
  titre: string;
  description?: string;
  termine: boolean;
  creePar: string;
  dateCreation: string;
}

interface Note {
  id: string;
  contenu: string;
  auteur?: string;
  date: string;
}

interface CandidatureAcceptee {
  id: string;
  titre: string;
  entreprise: string;
  localisation: string;
  type: string;
  salaire?: string;
  description: string;
  dateCandidature: string;
  dateAcceptation: string;
  statut: string;
  message?: string;
  contact: Contact;
  documents: Document[];
  prochainessEtapes: ProchainEtape[];
  notes: Note[];
  jobOfferId: number;
}

const CandidaturesRefuseesPage = () => {
  // const { candidat } = useAuthCandidat();
  const { data: session, isPending } = useSession();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState({
    date: "all",
    statut: "all",
  });
  const [candidatures, setCandidatures] = useState<CandidatureAcceptee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidature, setSelectedCandidature] =
    useState<CandidatureAcceptee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchCandidatures();
    }
  }, [session]);

  const fetchCandidatures = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/candidat/candidatures-refuse");
      const data = await response.json();

      if (data.success) {
        setCandidatures(data.data);
        console.log("Candidatures refusées:", data.data);
      } else {
        console.error(
          "Erreur lors du chargement des candidatures refusées:",
          data.error
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des candidatures refusées:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidatures = candidatures.filter((candidature) => {
    const matchesSearch =
      candidature.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidature.entreprise.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = filters.date === "all" || true; // Peut être étendu pour filtrer par date
    const matchesStatut =
      filters.statut === "all" ||
      candidature.statut.toLowerCase().includes(filters.statut.toLowerCase());

    return matchesSearch && matchesDate && matchesStatut;
  });

  const handleViewDetails = (candidature: CandidatureAcceptee) => {
    setSelectedCandidature(candidature);
    setIsModalOpen(true);
  };

  const handleDownloadDocument = (document: Document) => {
    if (document.url) {
      window.open(document.url, "_blank");
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center w-full">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full blur-xl opacity-20 animate-pulse"></div>
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            Chargement de vos candidatures acceptées...
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
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/20 rounded-2xl opacity-50"></div>
          <div className="relative p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-xl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold ">
                    Candidatures Acceptées
                  </h1>
                </div>
                <p className="text-muted-foreground max-w-2xl">
                  Félicitations ! Retrouvez ici toutes vos candidatures qui ont
                  été acceptées. Consultez les informations importantes, les
                  documents à traiter et les prochaines étapes.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>
                      candidature
                      {candidatures.length > 1 ? "s" : ""} acceptée
                      {candidatures.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
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
                <Select
                  value={filters.date}
                  onValueChange={(value) =>
                    setFilters({ ...filters, date: value })
                  }
                >
                  <SelectTrigger className="w-[160px] bg-background border-border">
                    <SelectValue placeholder="Date d'acceptation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les dates</SelectItem>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.statut}
                  onValueChange={(value) =>
                    setFilters({ ...filters, statut: value })
                  }
                >
                  <SelectTrigger className="w-[160px] bg-background border-border">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="accepté">Acceptées</SelectItem>
                    <SelectItem value="embauché">Embauchées</SelectItem>
                    <SelectItem value="validé">Validées</SelectItem>
                  </SelectContent>
                </Select>

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
                    <List className="h-4 w-4 " color="#fff" />
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
                    <Grid className="h-4 w-4" color="#fff" />
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
                <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/40 rounded-full blur-2xl opacity-10"></div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucune candidature acceptée trouvée
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {candidatures.length === 0
                  ? "Continuez à postuler ! Vos candidatures acceptées apparaîtront ici."
                  : "Aucune candidature ne correspond à vos critères de recherche."}
              </p>
            </CardContent>
          </Card>
        ) : viewMode === "list" ? (
          <div className="space-y-6">
            {filteredCandidatures.map((candidature, index) => (
              <Card
                key={candidature.id}
                className="bg-card border-l-4 border-l-green-500 border-border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
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
                            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 border-red-200 dark:border-red-800">
                              <X className="h-4 w-4 mr-1" color="#fff" />
                              {candidature.statut}
                            </Badge>
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
                                Acceptée le {candidature.dateAcceptation}
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

                    <div className="flex flex-col justify-between gap-4 lg:w-64">
                      <div className="space-y-3">
                        {candidature.documents.length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Documents ({candidature.documents.length})
                            </h4>
                            <div className="space-y-1">
                              {candidature.documents.slice(0, 2).map((doc) => (
                                <div
                                  key={doc.id}
                                  className="text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between"
                                >
                                  <span className="truncate">{doc.nom}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {doc.statut}
                                  </Badge>
                                </div>
                              ))}
                              {candidature.documents.length > 2 && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                  +{candidature.documents.length - 2} autres
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {candidature.prochainessEtapes.length > 0 && (
                          <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg">
                            <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                              <CheckSquare className="h-4 w-4" />
                              Prochaines étapes
                            </h4>
                            <div className="space-y-1">
                              {candidature.prochainessEtapes
                                .slice(0, 2)
                                .map((etape) => (
                                  <div
                                    key={etape.id}
                                    className="flex items-center gap-2"
                                  >
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        etape.termine
                                          ? "bg-green-500"
                                          : "bg-orange-500"
                                      }`}
                                    ></div>
                                    <span className="text-xs text-orange-700 dark:text-orange-300 truncate">
                                      {etape.titre}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>

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

                  {/* Informations contact RH */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Contact RH
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          {candidature.contact.nom}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {candidature.contact.poste}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {candidature.contact.entreprise}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {candidature.contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <a
                              href={`mailto:${candidature.contact.email}`}
                              className="text-sm text-blue-600 hover:underline truncate"
                            >
                              {candidature.contact.email}
                            </a>
                          </div>
                        )}
                        {candidature.contact.telephone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-green-600" />
                            <a
                              href={`tel:${candidature.contact.telephone}`}
                              className="text-sm text-green-600 hover:underline"
                            >
                              {candidature.contact.telephone}
                            </a>
                          </div>
                        )}
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
                className="bg-card border-l-4 border-l-green-500 border-border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h2 className="text-lg font-bold text-foreground line-clamp-2 hover:text-primary transition-colors">
                          {candidature.titre}
                        </h2>
                        <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                          <X className="h-4 w-4 mr-1" color="#fff" />
                          {candidature.statut}
                        </Badge>
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
                          <span>Acceptée le {candidature.dateAcceptation}</span>
                        </div>
                      </div>
                    </div>

                    {candidature.salaire && (
                      <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/30 p-2 rounded-lg">
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

                    <div className="space-y-2">
                      {candidature.documents.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <FileText className="h-3 w-3 inline mr-1" />
                          {candidature.documents.length} document
                          {candidature.documents.length > 1 ? "s" : ""}
                        </div>
                      )}
                      {candidature.prochainessEtapes.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <CheckSquare className="h-3 w-3 inline mr-1" />
                          {
                            candidature.prochainessEtapes.filter(
                              (e) => !e.termine
                            ).length
                          }{" "}
                          étape
                          {candidature.prochainessEtapes.filter(
                            (e) => !e.termine
                          ).length > 1
                            ? "s"
                            : ""}{" "}
                          restante
                          {candidature.prochainessEtapes.filter(
                            (e) => !e.termine
                          ).length > 1
                            ? "s"
                            : ""}
                        </div>
                      )}
                    </div>

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
                        onClick={() =>
                          (window.location.href = `/dashboard-candidats/toutes-les-offres/${candidature.jobOfferId}`)
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Contact compact */}
                    <div className="pt-4 border-t border-border">
                      <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                        <User className="h-3 w-3 text-primary" />
                        Contact RH
                      </h3>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-foreground">
                          {candidature.contact.nom}
                        </p>
                        {candidature.contact.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-blue-600" />
                            <a
                              href={`mailto:${candidature.contact.email}`}
                              className="text-xs text-blue-600 hover:underline truncate"
                            >
                              {candidature.contact.email}
                            </a>
                          </div>
                        )}
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
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">
                Détails de la candidature acceptée
              </DialogTitle>
            </DialogHeader>

            {selectedCandidature && (
              <div className="space-y-6">
                {/* En-tête de l'offre */}
                <div className="bg-gradient-to-r from-red-500/10 to-red-500/20 p-6 rounded-lg">
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
                    <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                      <X className="h-4 w-4 mr-1" color="#fff" />
                      {selectedCandidature.statut}
                    </Badge>
                  </div>
                </div>

                {/* Informations principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Informations importantes
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
                            Date d'acceptation:
                          </span>
                          <span className="font-medium text-green-600">
                            {selectedCandidature.dateAcceptation}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Statut:</span>
                          <span className="font-medium">
                            {selectedCandidature.statut}
                          </span>
                        </div>
                        {selectedCandidature.salaire && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Salaire:
                            </span>
                            <span className="font-medium">
                              {selectedCandidature.salaire}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Contact RH
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium text-foreground">
                            {selectedCandidature.contact.nom}
                          </p>
                          <p className="text-muted-foreground">
                            {selectedCandidature.contact.poste}
                          </p>
                          <p className="text-muted-foreground">
                            {selectedCandidature.contact.entreprise}
                          </p>
                        </div>
                        <div className="space-y-2">
                          {selectedCandidature.contact.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-blue-600" />
                              <a
                                href={`mailto:${selectedCandidature.contact.email}`}
                                className="text-blue-600 hover:underline"
                              >
                                {selectedCandidature.contact.email}
                              </a>
                            </div>
                          )}
                          {selectedCandidature.contact.telephone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-green-600" />
                              <a
                                href={`tel:${selectedCandidature.contact.telephone}`}
                                className="text-green-600 hover:underline"
                              >
                                {selectedCandidature.contact.telephone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Documents */}
                {selectedCandidature.documents.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Documents ({selectedCandidature.documents.length})
                      </h3>
                      <div className="grid gap-3">
                        {selectedCandidature.documents.map((document) => (
                          <div
                            key={document.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium">
                                  {document.nom}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Uploadé le {document.dateUpload} par{" "}
                                  {document.uploadePar}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  document.statut === "à signer"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {document.statut}
                              </Badge>
                              {document.url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDownloadDocument(document)
                                  }
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Télécharger
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Prochaines étapes */}
                {selectedCandidature.prochainessEtapes.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-primary" />
                        Prochaines étapes (
                        {selectedCandidature.prochainessEtapes.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedCandidature.prochainessEtapes.map((etape) => (
                          <div
                            key={etape.id}
                            className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${
                              etape.termine
                                ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                                : "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800"
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-medium text-xs ${
                                etape.termine
                                  ? "bg-green-500 text-white"
                                  : "bg-orange-500 text-white"
                              }`}
                            >
                              {etape.termine ? "✓" : "!"}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">
                                {etape.titre}
                              </h4>
                              {etape.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {etape.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                Créé le {etape.dateCreation} par {etape.creePar}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
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

                {/* Notes du recruteur */}
                {selectedCandidature.notes.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Notes du recruteur ({selectedCandidature.notes.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedCandidature.notes.map((note) => (
                          <div
                            key={note.id}
                            className="bg-muted p-3 rounded-lg"
                          >
                            <p className="text-sm text-foreground">
                              {note.contenu}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Par {note.auteur || "Recruteur"} le {note.date}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() =>
                      (window.location.href = `/dashboard-candidats/toutes-les-offres/${selectedCandidature.jobOfferId}`)
                    }
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir l'offre complète
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CandidaturesRefuseesPage;
