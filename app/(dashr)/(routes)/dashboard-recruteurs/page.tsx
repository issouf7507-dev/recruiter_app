"use client";

import React, { useMemo, useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Package,
  FileText,
  Clock,
  TrendingUp,
  Eye,
  Briefcase,
  Award,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { postData } from "@/utils/utilts";
import { useSession } from "@/lib/auth-client";

interface ChartData {
  year: string;
  value: number;
  target?: number;
}

interface OffreData {
  titre: string;
  entreprise: string;
  localisation: string;
  date: string;
  type: string;
  status: "active" | "expired" | "draft";
  views: number;
  applications: number;
}

const data: ChartData[] = [
  { year: "Jan", value: 100, target: 120 },
  { year: "Fév", value: 300, target: 280 },
  { year: "Mar", value: 647, target: 600 },
  { year: "Avr", value: 400, target: 450 },
  { year: "Mai", value: 500, target: 520 },
  { year: "Juin", value: 350, target: 400 },
];

const offres: OffreData[] = [
  {
    titre: "Développeur Full Stack",
    entreprise: "TechCorp Solutions",
    localisation: "Abidjan, Côte d'Ivoire",
    date: "12.09.2024 - 12:53 PM",
    type: "CDI",
    status: "active",
    views: 245,
    applications: 18,
  },
  {
    titre: "Designer UX/UI",
    entreprise: "Digital Agency Pro",
    localisation: "Abidjan, Côte d'Ivoire",
    date: "10.09.2024 - 09:30 AM",
    type: "Freelance",
    status: "active",
    views: 189,
    applications: 12,
  },
  {
    titre: "Chef de Projet",
    entreprise: "Innovation Labs",
    localisation: "Abidjan, Côte d'Ivoire",
    date: "08.09.2024 - 15:20 PM",
    type: "CDI",
    status: "expired",
    views: 156,
    applications: 8,
  },
];

// Composants optimisés avec React.memo
const StatCard = React.memo(
  ({
    title,
    value,
    icon: Icon,
    bgColor,
    iconColor,
    trend,
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    iconColor: string;
    trend?: string;
    subtitle?: string;
  }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      setIsVisible(true);
    }, []);

    return (
      <Card
        className={`transform transition-all duration-700 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        } hover:shadow-lg hover:scale-105 transition-all duration-300`}
      >
        <CardContent className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-col flex-grow">
              <span className="text-sm text-muted-foreground font-medium">
                {title}
              </span>
              <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:text-white">
                {value}
              </span>
              {subtitle && (
                <span className="text-xs text-muted-foreground mt-1">
                  {subtitle}
                </span>
              )}
              {trend && (
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    {trend}
                  </span>
                </div>
              )}
            </div>
            <div className={`p-4 rounded-2xl ${bgColor} shadow-lg`}>
              <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

const ChartCard = React.memo(({ data }: { data: ChartData[] }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Card
      className={`transform transition-all duration-700 ease-out delay-200 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } hover:shadow-lg transition-all duration-300`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:text-white">
              Évolution des Candidats
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Suivi mensuel des candidatures reçues
            </p>
          </div>
          <Select defaultValue="juin">
            <SelectTrigger className="w-[180px] bg-white border-2">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="juin">Juin 2024</SelectItem>
              <SelectItem value="mai">Mai 2024</SelectItem>
              <SelectItem value="avril">Avril 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#colorTarget)"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4F46E5"
                strokeWidth={3}
                fill="url(#colorValue)"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

ChartCard.displayName = "ChartCard";

const OffresTable = React.memo(({ offres }: { offres: OffreData[] }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Expirée
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Brouillon
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {status}
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge
        className={`${
          type === "CDI"
            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
            : "bg-orange-100 text-orange-800 hover:bg-orange-100"
        }`}
      >
        {type}
      </Badge>
    );
  };

  return (
    <Card
      className={`transform transition-all duration-700 ease-out delay-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } hover:shadow-lg transition-all duration-300`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text    dark:text-white text-black ">
              Mes Offres d'Emploi
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gestion et suivi de vos annonces
            </p>
          </div>
          <Select defaultValue="recent">
            <SelectTrigger className="w-[180px] bg-white border-2">
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récentes</SelectItem>
              <SelectItem value="popular">Plus populaires</SelectItem>
              <SelectItem value="applications">Plus de candidatures</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700 dark:text-white">
                  Titre de l'offre
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-white">
                  Entreprise
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-white">
                  Localisation
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-white">
                  Statut
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-white">
                  Type
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-white">
                  Vues
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-white">
                  Candidatures
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offres.map((offre: OffreData, index: number) => (
                <TableRow
                  key={index}
                  className="hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {offre.titre}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-white">
                        {offre.date}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-white">
                    {offre.entreprise}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-white">
                    {offre.localisation}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-white">
                    {getStatusBadge(offre.status)}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-white">
                    {getTypeBadge(offre.type)}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-white">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium">{offre.views}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-white">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="font-medium">{offre.applications}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});

OffresTable.displayName = "OffresTable";

const QuickStats = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Card
      className={`transform transition-all duration-700 ease-out delay-400 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } hover:shadow-lg transition-all duration-300`}
    >
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white ">
          Aperçu Rapide
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-white">
                Taux de conversion
              </span>
              <span className="text-sm font-bold text-green-600">7.3%</span>
            </div>
            <Progress value={73} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-white">
                Temps de réponse moyen
              </span>
              <span className="text-sm font-bold text-blue-600">2.4 jours</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-white  ">
                Satisfaction candidats
              </span>
              <span className="text-sm font-bold text-purple-600">4.8/5</span>
            </div>
            <Progress value={96} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

QuickStats.displayName = "QuickStats";

const DashboardPage = () => {
  const { data: session } = useSession();
  console.log(session);

  // Mémoriser les statistiques
  const stats = useMemo(
    () => [
      {
        title: "Candidats Total",
        value: "689",
        icon: Users,
        bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
        iconColor: "text-white",
        trend: "+12% ce mois",
        subtitle: "Candidats actifs",
      },
      {
        title: "Offres Publiées",
        value: "24",
        icon: Briefcase,
        bgColor: "bg-gradient-to-br from-yellow-500 to-orange-500",
        iconColor: "text-white",
        trend: "+3 nouvelles",
        subtitle: "Offres en cours",
      },
      {
        title: "CV Consultés",
        value: "890",
        icon: FileText,
        bgColor: "bg-gradient-to-br from-green-500 to-emerald-600",
        iconColor: "text-white",
        trend: "+8% cette semaine",
        subtitle: "Profils analysés",
      },
      {
        title: "Profil Vu",
        value: "2,040",
        icon: Eye,
        bgColor: "bg-gradient-to-br from-purple-500 to-pink-500",
        iconColor: "text-white",
        trend: "+15% ce mois",
        subtitle: "Visites totales",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br  w-full h-screen overflow-y-auto">
      <div className="p-6 space-y-8  mx-auto">
        {/* Header */}
        <div className="text-start space-y-2 w-full">
          <h1 className="text-4xl font-bold bg-gradient- text-black dark:text-white">
            Dashboard Recruteur
          </h1>
          <p className="text-lg text-gray-600">
            Bienvenue, {session?.user?.email} • Voici un aperçu de vos activités
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard data={data} />
          </div>
          <div>
            <QuickStats />
          </div>
        </div>

        {/* Offres Table */}
        <OffresTable offres={offres} />
      </div>
    </div>
  );
};

export default React.memo(DashboardPage);
