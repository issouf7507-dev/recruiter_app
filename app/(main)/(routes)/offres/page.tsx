"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import LoginModal from "@/components/auth/LoginModal";
import OffresStats from "@/components/offres/OffresStats";
import OffresFilters from "@/components/offres/OffresFilters";

export default function OffresPage() {
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
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    fetchOffres();
  }, []);

  const fetchOffres = async () => {
    try {
      const response = await fetch("/api/recruteur/offres");
      if (response.ok) {
        const data = await response.json();
        setOffres(data.data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des offres:", error);
    } finally {
      setLoading(false);
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
  };

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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Offres d'emploi
              </h1>
              <p className="text-gray-600 mt-1">
                Découvrez les meilleures opportunités de carrière
              </p>
            </div>

            {/* Bouton Poster */}
            <div className="flex gap-3">
              {user ? (
                <Link href="/dashboard-recruteurs/offres/creer">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Poster une offre
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handlePosterClick}
                >
                  <LogIn className="h-4 w-4" />
                  Se connecter pour poster
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistiques */}
        {!loading && offres.length > 0 && (
          <OffresStats
            totalOffres={offres.length}
            offresByType={offresByType}
            topCompanies={topCompanies}
            topLocations={topLocations}
          />
        )}

        {/* Filtres avancés */}
        <OffresFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          filterLocation={filterLocation}
          onFilterLocationChange={setFilterLocation}
          filterCompany={filterCompany}
          onFilterCompanyChange={setFilterCompany}
          salaryRange={salaryRange}
          onSalaryRangeChange={setSalaryRange}
          locations={topLocations}
          companies={topCompanies}
          onClearFilters={handleClearFilters}
        />

        {/* Résultats */}
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredOffres.length} offre{filteredOffres.length > 1 ? "s" : ""}{" "}
            trouvée{filteredOffres.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Grille des offres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffres.map((offre) => (
            <Card
              key={offre.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {offre.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="h-4 w-4" />
                        {offre.company}
                      </div>
                    </CardDescription>
                  </div>
                  <Badge className={getTypeColor(offre.type)}>
                    {offre.type}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {offre.location}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {offre.experience}
                </div>

                {offre.salaryMin && offre.salaryMax && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    {formatSalary(
                      offre.salaryMin,
                      offre.salaryMax,
                      offre.salaryCurrency,
                      offre.salaryPeriod
                    )}
                  </div>
                )}

                <p className="text-sm text-gray-600 line-clamp-3">
                  {offre.description}
                </p>

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
                      <Badge variant="secondary" className="text-xs">
                        +{offre.competences.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <div className="w-full flex gap-2">
                  <Link href={`/offres/${offre.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Voir détails
                    </Button>
                  </Link>
                  {user ? (
                    <Button className="flex-1">Postuler</Button>
                  ) : (
                    <Button className="flex-1" onClick={handlePostulerClick}>
                      Se connecter pour postuler
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Message si aucune offre */}
        {filteredOffres.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune offre trouvée
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche ou revenez plus
              tard.
            </p>
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
    </div>
  );
}
