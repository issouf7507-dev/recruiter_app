"use client";

import React, { useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Package, FileText, Clock, LogOut } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
import { useAuth } from "@/hooks/useAuth";
import { postData } from "@/utils/utilts";

interface ChartData {
  year: string;
  value: number;
}

interface OffreData {
  titre: string;
  entreprise: string;
  localisation: string;
  date: string;
  type: string;
}

const data: ChartData[] = [
  { year: "2020", value: 100 },
  { year: "2021", value: 300 },
  { year: "2022", value: 647 },
  { year: "2023", value: 400 },
  { year: "2024", value: 500 },
  { year: "2025", value: 350 },
];

const offres: OffreData[] = [
  {
    titre: "Watch.s",
    entreprise: "6096 Marjolaine Landing",
    localisation: "Abidjan, Cote D'Ivoire",
    date: "12.09.2019 - 12:53 PM",
    type: "CDI",
  },
  {
    titre: "Watch.s",
    entreprise: "6096 Marjolaine Landing",
    localisation: "Abidjan, Cote D'Ivoire",
    date: "12.09.2019 - 12:53 PM",
    type: "Freelance",
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
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    iconColor: string;
  }) => (
    <Card>
      <CardContent className="flex items-center p-6">
        <div className="flex flex-col flex-grow">
          <span className="text-sm text-muted-foreground">{title}</span>
          <span className="text-2xl font-bold">{value}</span>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  )
);

StatCard.displayName = "StatCard";

const ChartCard = React.memo(({ data }: { data: ChartData[] }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Candidats</h2>
        <Select defaultValue="october">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Mois" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="october">October</SelectItem>
            <SelectItem value="november">November</SelectItem>
            <SelectItem value="december">December</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4F46E5"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
));

ChartCard.displayName = "ChartCard";

const OffresTable = React.memo(({ offres }: { offres: OffreData[] }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Offres</h2>
        <Select defaultValue="october">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Mois" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="october">October</SelectItem>
            <SelectItem value="november">November</SelectItem>
            <SelectItem value="december">December</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre de l'offre</TableHead>
            <TableHead>Entreprise</TableHead>
            <TableHead>Localisation</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type de contrat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offres.map((offre: OffreData, index: number) => (
            <TableRow key={index}>
              <TableCell>{offre.titre}</TableCell>
              <TableCell>{offre.entreprise}</TableCell>
              <TableCell>{offre.localisation}</TableCell>
              <TableCell>{offre.date}</TableCell>
              <TableCell>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    offre.type === "CDI"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {offre.type}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
));

OffresTable.displayName = "OffresTable";

const DashboardPage = () => {
  const { user, loading } = useAuth();

  // Mémoriser les statistiques
  const stats = useMemo(
    () => [
      {
        title: "Mes Candidats",
        value: "689",
        icon: Users,
        bgColor: "bg-blue-100",
        iconColor: "text-blue-500",
      },
      {
        title: "Mes Offres",
        value: "1293",
        icon: Package,
        bgColor: "bg-yellow-100",
        iconColor: "text-yellow-500",
      },
      {
        title: "CV",
        value: "890",
        icon: FileText,
        bgColor: "bg-green-100",
        iconColor: "text-green-500",
      },
      {
        title: "Profil vu",
        value: "2040",
        icon: Clock,
        bgColor: "bg-red-100",
        iconColor: "text-red-500",
      },
    ],
    []
  );

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <div>Non authentifié</div>;
  }

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <h1 className="text-2xl font-bold">Dashboard - {user.email}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="space-y-6">
        <ChartCard data={data} />
        <OffresTable offres={offres} />
      </div>
    </div>
  );
};

export default React.memo(DashboardPage);
