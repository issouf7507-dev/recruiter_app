"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Clock, Users } from "lucide-react";

interface OffresStatsProps {
  totalOffres: number;
  offresByType: {
    CDI: number;
    CDD: number;
    Stage: number;
    Freelance: number;
  };
  topCompanies: string[];
  topLocations: string[];
}

export default function OffresStats({
  totalOffres,
  offresByType,
  topCompanies,
  topLocations,
}: OffresStatsProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "CDI":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "CDD":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "Stage":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "Freelance":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total des offres */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total des offres
          </CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOffres}</div>
          <p className="text-xs text-muted-foreground">
            Offres actuellement disponibles
          </p>
        </CardContent>
      </Card>

      {/* Répartition par type */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Types de contrat
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(offresByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <Badge className={getTypeColor(type)} variant="secondary">
                  {type}
                </Badge>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top entreprises */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top entreprises</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {topCompanies.slice(0, 3).map((company, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm truncate">{company}</span>
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top localisations */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Top localisations
          </CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {topLocations.slice(0, 3).map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm truncate">{location}</span>
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
