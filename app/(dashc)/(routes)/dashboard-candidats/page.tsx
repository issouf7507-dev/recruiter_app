"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, FileText, Calendar, Eye, Bell } from "lucide-react";
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

import { useQuery } from "@tanstack/react-query";
import { AlerteNotificationType } from "@/types/types";

const data = [
  { month: "Jan", candidatures: 5 },
  { month: "Fév", candidatures: 8 },
  { month: "Mar", candidatures: 12 },
  { month: "Avr", candidatures: 15 },
  { month: "Mai", candidatures: 10 },
  { month: "Juin", candidatures: 7 },
];

const candidatures = [
  {
    poste: "Développeur Full Stack",
    entreprise: "TechCorp Inc.",
    localisation: "Abidjan, Côte d'Ivoire",
    date: "12.09.2024 - 12:53 PM",
    statut: "En cours",
  },
  {
    poste: "Designer UI/UX",
    entreprise: "Digital Solutions",
    localisation: "Abidjan, Côte d'Ivoire",
    date: "10.09.2024 - 09:30 AM",
    statut: "Entretien",
  },
];

const DashboardPage = () => {
  const {
    data: notifications,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery<AlerteNotificationType[]>({
    queryKey: ["alerte-notifications"],
    queryFn: async () => {
      const response = await fetch("/api/candidat/notifications");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des notifications");
      }
      return response.json();
    },
  });

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      {/* <h1 className="text-2xl font-bold">Tableau de bord</h1> */}

      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        {/* <div className="flex items-center gap-2"></div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex flex-col flex-grow">
              <span className="text-sm text-muted-foreground">
                Candidatures en cours
              </span>
              <span className="text-2xl font-bold">12</span>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex flex-col flex-grow">
              <span className="text-sm text-muted-foreground">
                Entretiens programmés
              </span>
              <span className="text-2xl font-bold">3</span>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Calendar className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex flex-col flex-grow">
              <span className="text-sm text-muted-foreground">
                Offres sauvegardées
              </span>
              <span className="text-2xl font-bold">8</span>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Briefcase className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex flex-col flex-grow">
              <span className="text-sm text-muted-foreground">Profil vu</span>
              <span className="text-2xl font-bold">24</span>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <Eye className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Évolution des candidatures
              </h2>
              <Select defaultValue="2024">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="candidatures"
                    stroke="#4F46E5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Mes candidatures récentes
              </h2>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="entretien">Entretien</SelectItem>
                  <SelectItem value="accepte">Accepté</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Poste</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidatures.map((candidature, index) => (
                  <TableRow key={index}>
                    <TableCell>{candidature.poste}</TableCell>
                    <TableCell>{candidature.entreprise}</TableCell>
                    <TableCell>{candidature.localisation}</TableCell>
                    <TableCell>{candidature.date}</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          candidature.statut === "En cours"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {candidature.statut}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
