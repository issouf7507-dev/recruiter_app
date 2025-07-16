"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { JobOffer } from "@/types/types";
import {
  Search,
  MapPin,
  Building,
  Clock,
  DollarSign,
  Plus,
  LogIn,
  Filter,
  X,
  Grid3X3,
  List,
} from "lucide-react";
import Link from "next/link";
import LoginModal from "@/components/auth/LoginModal";
import OffresStats from "@/components/offres/OffresStats";
import OffresFilters from "@/components/offres/OffresFilters";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";

function OffresPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [offres, setOffres] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [salaryRange, setSalaryRange] = useState({ min: 0, max: 0 });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalType, setLoginModalType] = useState<
    "candidat" | "recruteur" | null
  >(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user, loading: authLoading } = useAuth();

  // Get search parameters from URL
  const urlQuery = searchParams.get("q") || "";
  const urlLocation = searchParams.get("location") || "";
  const urlCompany = searchParams.get("company") || "";

  useEffect(() => {
    // Set initial search values from URL
    setSearchTerm(urlQuery);
    setFilterLocation(urlLocation);
    setFilterCompany(urlCompany);

    // If we have URL parameters, we're in search mode
    if (urlQuery || urlLocation || urlCompany) {
      setIsSearchMode(true);
      fetchOffres(1);
    } else {
      setIsSearchMode(false);
      // Load all offers when no search parameters
      fetchAllOffres();

      console.log(offres);
    }
  }, [urlQuery, urlLocation, urlCompany]);

  const fetchOffres = async (page = 1) => {
    try {
      setLoading(true);

      // Build search parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (filterLocation) params.append("location", filterLocation);
      if (filterCompany) params.append("company", filterCompany);
      if (page > 1) params.append("page", page.toString());
      params.append("limit", "10");

      const response = await fetch(`/api/offres/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOffres(data.data || []);
          setPagination(
            data.pagination || {
              page: 1,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            }
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des offres:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOffres = async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (page > 1) params.append("page", page.toString());
      params.append("limit", "10");

      const response = await fetch(`/api/offres/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          setOffres(data.data || []);
          setPagination(
            data.pagination || {
              page: 1,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            }
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des offres:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchTerm) params.append("q", searchTerm);
    if (filterLocation) params.append("location", filterLocation);
    if (filterCompany) params.append("company", filterCompany);

    const newUrl = params.toString()
      ? `/offres?${params.toString()}`
      : "/offres";
    router.push(newUrl);
  };

  const handlePageChange = (newPage: number) => {
    if (isSearchMode) {
      fetchOffres(newPage);
    } else {
      fetchAllOffres(newPage);
    }
  };

  const filteredOffres = offres.filter((offre) => {
    const matchesSearch =
      offre.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offre.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offre.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || offre.type === filterType;
    const matchesLocation =
      !filterLocation || offre.location === filterLocation;
    const matchesCompany = !filterCompany || offre.company === filterCompany;

    const matchesSalary =
      (!salaryRange.min && !salaryRange.max) ||
      (offre.salaryMin >= (salaryRange.min || 0) &&
        (!salaryRange.max || offre.salaryMax <= salaryRange.max));

    return (
      matchesSearch &&
      matchesType &&
      matchesLocation &&
      matchesCompany &&
      matchesSalary
    );
  });

  const formatSalary = (
    min: number,
    max: number,
    currency: string,
    period: string
  ) => {
    const currencySymbol =
      currency === "EUR" ? "€" : currency === "USD" ? "$" : currency;
    const periodText =
      period === "mois" ? "/mois" : period === "an" ? "/an" : "/heure";
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currencySymbol}${periodText}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "CDI":
        return "bg-green-100 text-green-800";
      case "CDD":
        return "bg-blue-100 text-blue-800";
      case "Stage":
        return "bg-purple-100 text-purple-800";
      case "Freelance":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePostulerClick = () => {
    if (!user) {
      setLoginModalType("candidat");
      setShowLoginModal(true);
    }
  };

  const handlePosterClick = () => {
    if (!user) {
      setLoginModalType("recruteur");
      setShowLoginModal(true);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterLocation("");
    setFilterCompany("");
    setSalaryRange({ min: 0, max: 0 });
    setIsSearchMode(false);
    // Clear URL parameters and load all offers
    router.push("/offres");
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleLocationChange = (value: string) => {
    setFilterLocation(value);
  };

  const handleCompanyChange = (value: string) => {
    setFilterCompany(value);
  };

  const handleClearSearchTerm = () => {
    setSearchTerm("");
  };

  const handleClearLocation = () => {
    setFilterLocation("");
  };

  const handleClearCompany = () => {
    setFilterCompany("");
  };

  // Composant pour l'affichage en liste
  const ListView = ({ offre }: { offre: JobOffer }) => (
    <Card className="shadow-none border mb-3 md:mb-4">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  {offre.title}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3 md:h-4 md:w-4" />
                    {offre.company}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                    {offre.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 md:h-4 md:w-4" />
                    {offre.experience}
                  </div>
                </div>
              </div>
              <Badge
                className={`${getTypeColor(offre.type)} text-xs md:text-sm`}
              >
                {offre.type}
              </Badge>
            </div>

            <p className="text-sm md:text-base text-gray-600 mb-3 line-clamp-2">
              {offre.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
                {offre.salaryMin && offre.salaryMax && (
                  <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600">
                    <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                    {formatSalary(
                      offre.salaryMin,
                      offre.salaryMax,
                      offre.salaryCurrency,
                      offre.salaryPeriod
                    )}
                  </div>
                )}

                {offre.competences && offre.competences.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {offre.competences.slice(0, 3).map((competence, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {competence}
                      </Badge>
                    ))}
                    {offre.competences.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{offre.competences.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <Link href={`/offres/${offre.id}`}>
                <Button className="text-xs md:text-sm px-3 md:px-4 py-2 md:py-2 w-full sm:w-auto">
                  Voir l'offre
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Composant pour l'affichage en grille
  const GridView = ({ offre }: { offre: JobOffer }) => (
    <Card className="hover:shadow-md transition-shadow duration-200 shadow-none">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base md:text-lg font-semibold text-gray-900 line-clamp-2">
              {offre.title}
            </CardTitle>
            <CardDescription className="mt-2">
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                <Building className="h-3 w-3 md:h-4 md:w-4" />
                {offre.company}
              </div>
            </CardDescription>
          </div>
          <Badge className={`${getTypeColor(offre.type)} text-xs md:text-sm`}>
            {offre.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 md:space-y-3 p-4 md:p-6 pt-0">
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
          <MapPin className="h-3 w-3 md:h-4 md:w-4" />
          {offre.location}
        </div>

        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
          <Clock className="h-3 w-3 md:h-4 md:w-4" />
          {offre.experience}
        </div>

        {offre.salaryMin && offre.salaryMax && (
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
            {formatSalary(
              offre.salaryMin,
              offre.salaryMax,
              offre.salaryCurrency,
              offre.salaryPeriod
            )}
          </div>
        )}

        <p className="text-xs md:text-sm text-gray-600 line-clamp-3">
          {offre.description}
        </p>

        {offre.competences && offre.competences.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {offre.competences.slice(0, 3).map((competence, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {competence}
              </Badge>
            ))}
            {offre.competences.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{offre.competences.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 md:p-6 pt-0">
        <Link href={`/offres/${offre.id}`} className="w-full">
          <Button className="w-full text-xs md:text-sm py-2 md:py-2">
            Voir l'offre
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );

  // Calculer les statistiques
  const offresByType = offres.reduce(
    (acc, offre) => {
      acc[offre.type as keyof typeof acc] =
        (acc[offre.type as keyof typeof acc] || 0) + 1;
      return acc;
    },
    { CDI: 0, CDD: 0, Stage: 0, Freelance: 0 }
  );

  const companies = offres.map((offre) => offre.company);
  const topCompanies = Array.from(new Set(companies))
    .filter(Boolean)
    .slice(0, 3);

  const locations = offres.map((offre) => offre.location);
  const topLocations = Array.from(new Set(locations))
    .filter(Boolean)
    .slice(0, 3);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      {/* Filtres et recherche */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 mt-16 md:mt-20">
        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-none border p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher un poste, compétences..."
                  value={searchTerm}
                  onChange={(e) => handleSearchTermChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Localisation..."
                  value={filterLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Entreprise..."
                  value={filterCompany}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
                />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Rechercher</span>
              <span className="sm:hidden">Recherche</span>
            </Button>
          </div>

          {/* Filtres actifs */}
          {(searchTerm || filterLocation || filterCompany) && (
            <div className="flex items-center gap-2 mt-3 md:mt-4 flex-wrap">
              <span className="text-xs md:text-sm text-gray-600">
                Filtres actifs:
              </span>
              {searchTerm && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  Recherche: {searchTerm}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={handleClearSearchTerm}
                  />
                </Badge>
              )}
              {filterLocation && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  Localisation: {filterLocation}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={handleClearLocation}
                  />
                </Badge>
              )}
              {filterCompany && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  Entreprise: {filterCompany}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={handleClearCompany}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-500 hover:text-gray-700 text-xs md:text-sm"
              >
                Effacer tout
              </Button>
            </div>
          )}
        </div>

        {/* Statistiques */}
        {!loading && offres.length > 0 && (
          <OffresStats
            totalOffres={pagination.total}
            offresByType={offresByType}
            topCompanies={topCompanies}
            topLocations={topLocations}
          />
        )}

        {/* Résultats */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm md:text-base text-gray-600">
            {pagination.total} offre{pagination.total > 1 ? "s" : ""} trouvée
            {pagination.total > 1 ? "s" : ""}
            {searchTerm || filterLocation || filterCompany
              ? " pour votre recherche"
              : ""}
          </p>
          <div className="flex items-center gap-3 md:gap-4">
            {/* Toggle de vue */}
            <div className="flex items-center bg-white border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
              >
                <Grid3X3 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Grille</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
              >
                <List className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Liste</span>
              </Button>
            </div>
            {pagination.totalPages > 1 && (
              <div className="text-xs md:text-sm text-gray-500">
                Page {pagination.page} sur {pagination.totalPages}
              </div>
            )}
          </div>
        </div>

        {/* Affichage des offres */}
        {loading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                : "space-y-3 md:space-y-4"
            }
          >
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="shadow-none">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : offres.length > 0 ? (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                  : "space-y-3 md:space-y-4"
              }
            >
              {offres.map((offre) =>
                viewMode === "list" ? (
                  <ListView key={offre.id} offre={offre} />
                ) : (
                  <GridView key={offre.id} offre={offre} />
                )
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="text-xs md:text-sm px-3 md:px-4"
                >
                  <span className="hidden sm:inline">Précédent</span>
                  <span className="sm:hidden">Préc.</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === pagination.page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="text-xs md:text-sm px-2 md:px-3"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="text-xs md:text-sm px-3 md:px-4"
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <span className="sm:hidden">Suiv.</span>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 md:py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 md:h-16 md:w-16 mx-auto" />
            </div>
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
              Aucune offre trouvée
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 px-4">
              {searchTerm || filterLocation || filterCompany
                ? "Essayez de modifier vos critères de recherche"
                : "Aucune offre disponible pour le moment"}
            </p>
            {(searchTerm || filterLocation || filterCompany) && (
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="text-sm md:text-base"
              >
                Effacer les filtres
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal de connexion */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        userType={loginModalType || undefined}
        title={
          loginModalType === "candidat"
            ? "Connexion requise pour postuler"
            : loginModalType === "recruteur"
            ? "Connexion requise pour poster"
            : "Connexion requise"
        }
        message={
          loginModalType === "candidat"
            ? "Vous devez être connecté en tant que candidat pour postuler à cette offre."
            : loginModalType === "recruteur"
            ? "Vous devez être connecté en tant que recruteur pour publier des offres."
            : "Vous devez être connecté pour accéder à cette fonctionnalité."
        }
        showBothOptions={!loginModalType}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function OffresPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OffresPageContent />
    </Suspense>
  );
}
