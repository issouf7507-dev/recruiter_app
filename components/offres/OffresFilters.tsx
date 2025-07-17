"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, MapPin, Building, DollarSign } from "lucide-react";

interface OffresFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  filterLocation: string;
  onFilterLocationChange: (value: string) => void;
  filterCompany: string;
  onFilterCompanyChange: (value: string) => void;
  salaryRange: { min: number; max: number };
  onSalaryRangeChange: (range: { min: number; max: number }) => void;
  locations: string[];
  companies: string[];
  onClearFilters: () => void;
}

export default function OffresFilters({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterLocation,
  onFilterLocationChange,
  filterCompany,
  onFilterCompanyChange,
  salaryRange,
  onSalaryRangeChange,
  locations,
  companies,
  onClearFilters,
}: OffresFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const hasActiveFilters =
    searchTerm ||
    filterType !== "all" ||
    filterLocation ||
    filterCompany ||
    salaryRange.min > 0 ||
    salaryRange.max > 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche et filtres
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de recherche principale */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher par titre, entreprise ou localisation..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filtres de base */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-sm text-foreground"
          >
            <option value="all">Tous les types</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
            <option value="Freelance">Freelance</option>
          </select>

          {locations.length > 0 && (
            <select
              value={filterLocation}
              onChange={(e) => onFilterLocationChange(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-sm text-foreground"
            >
              <option value="">Toutes les localisations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          )}

          {companies.length > 0 && (
            <select
              value={filterCompany}
              onChange={(e) => onFilterCompanyChange(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-sm text-foreground"
            >
              <option value="">Toutes les entreprises</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Filtres avancés */}
        {showAdvancedFilters && (
          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fourchette de salaire (€/an)
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={salaryRange.min || ""}
                    onChange={(e) =>
                      onSalaryRangeChange({
                        ...salaryRange,
                        min: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Max"
                    value={salaryRange.max || ""}
                    onChange={(e) =>
                      onSalaryRangeChange({
                        ...salaryRange,
                        max: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Filtres rapides par localisation */}
            {locations.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Localisations populaires
                </label>
                <div className="flex flex-wrap gap-2">
                  {locations.slice(0, 5).map((location) => (
                    <Badge
                      key={location}
                      variant={
                        filterLocation === location ? "default" : "outline"
                      }
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        onFilterLocationChange(
                          filterLocation === location ? "" : location
                        )
                      }
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Filtres rapides par entreprise */}
            {companies.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Entreprises populaires
                </label>
                <div className="flex flex-wrap gap-2">
                  {companies.slice(0, 5).map((company) => (
                    <Badge
                      key={company}
                      variant={
                        filterCompany === company ? "default" : "outline"
                      }
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        onFilterCompanyChange(
                          filterCompany === company ? "" : company
                        )
                      }
                    >
                      <Building className="h-3 w-3 mr-1" />
                      {company}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filtres actifs */}
        {hasActiveFilters && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-foreground">
                Filtres actifs :
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Recherche: "{searchTerm}"
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => onSearchChange("")}
                  />
                </Badge>
              )}
              {filterType !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Type: {filterType}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => onFilterTypeChange("all")}
                  />
                </Badge>
              )}
              {filterLocation && (
                <Badge variant="secondary" className="text-xs">
                  Localisation: {filterLocation}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => onFilterLocationChange("")}
                  />
                </Badge>
              )}
              {filterCompany && (
                <Badge variant="secondary" className="text-xs">
                  Entreprise: {filterCompany}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => onFilterCompanyChange("")}
                  />
                </Badge>
              )}
              {(salaryRange.min > 0 || salaryRange.max > 0) && (
                <Badge variant="secondary" className="text-xs">
                  Salaire: {salaryRange.min || 0}€ - {salaryRange.max || "∞"}€
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => onSalaryRangeChange({ min: 0, max: 0 })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
