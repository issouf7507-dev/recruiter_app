"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  MapPin,
  TrendingUp,
  Search,
  Briefcase,
  GraduationCap,
  BarChart3,
  Target,
} from "lucide-react";

interface SearchStatsProps {
  totalCandidats: number;
  candidatsParMois: number;
  competencesPopulaires: Array<{ nom: string; count: number }>;
  localisationsPopulaires: Array<{ ville: string; count: number }>;
  topCandidats: Array<{
    id: string;
    nom: string;
    matchScore: number;
    competences: string[];
  }>;
}

export default function SearchStats({
  totalCandidats,
  candidatsParMois,
  competencesPopulaires,
  localisationsPopulaires,
  topCandidats,
}: SearchStatsProps) {
  const getCompetenceColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-red-100 text-red-800",
    ];
    return colors[index % colors.length];
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Candidats
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCandidats}</div>
            <p className="text-xs text-muted-foreground">
              +{candidatsParMois} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nouveaux ce mois
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidatsParMois}</div>
            <p className="text-xs text-muted-foreground">
              +12% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compétences uniques
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {competencesPopulaires.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Technologies populaires
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Localisations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {localisationsPopulaires.length}
            </div>
            <p className="text-xs text-muted-foreground">Villes principales</p>
          </CardContent>
        </Card>
      </div>

      {/* Compétences populaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Compétences les plus recherchées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competencesPopulaires.slice(0, 10).map((competence, index) => {
              const percentage = (competence.count / totalCandidats) * 100;
              return (
                <div key={competence.nom} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getCompetenceColor(index)}>
                        {competence.nom}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {competence.count} candidats
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Localisations populaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localisations populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {localisationsPopulaires.slice(0, 8).map((location, index) => (
                <div
                  key={location.ville}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium">
                      {location.ville}
                    </span>
                  </div>
                  <Badge variant="secondary">{location.count} candidats</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top candidats par score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Meilleurs scores de matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCandidats.slice(0, 5).map((candidat) => (
                <div
                  key={candidat.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {candidat.nom}
                      </span>
                      <span
                        className={`text-sm font-bold ${getMatchScoreColor(
                          candidat.matchScore
                        )}`}
                      >
                        {candidat.matchScore}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidat.competences.slice(0, 3).map((comp) => (
                        <Badge key={comp} variant="outline" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                      {candidat.competences.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidat.competences.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique de tendances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Évolution des candidatures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Graphique d'évolution à implémenter</p>
              <p className="text-sm">
                Intégration avec une librairie de graphiques
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights et recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Insights et recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Tendances actuelles</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Développement React en forte croissance (+25%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Data Science très demandé</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Paris reste la ville la plus active</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Recommandations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span>Élargir la recherche aux profils junior</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span>
                    Considérer le télétravail pour plus de flexibilité
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span>Mettre l'accent sur les soft skills</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
