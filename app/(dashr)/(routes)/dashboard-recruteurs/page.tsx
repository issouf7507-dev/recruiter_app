"use client";

import React from "react";
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

const data = [
  { year: "2020", value: 100 },
  { year: "2021", value: 300 },
  { year: "2022", value: 647 },
  { year: "2023", value: 400 },
  { year: "2024", value: 500 },
  { year: "2025", value: 350 },
];

const offres = [
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

const DashboardPage = () => {
  const { user, loading } = useAuth();

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
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex flex-col flex-grow">
              <span className="text-sm text-muted-foreground">
                Mes Candidats
              </span>
              <span className="text-2xl font-bold">689</span>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex flex-col flex-grow">
              <span className="text-sm text-muted-foreground">Mes Offres</span>
              <span className="text-2xl font-bold">1293</span>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Package className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex flex-col flex-grow">
              <span className="text-sm text-muted-foreground">CV</span>
              <span className="text-2xl font-bold">890</span>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <FileText className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex flex-col flex-grow">
              <span className="text-sm text-muted-foreground">Profil vu</span>
              <span className="text-2xl font-bold">2040</span>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <Clock className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
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
                {offres.map((offre, index) => (
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
      </div>
    </div>
  );
};

export default DashboardPage;
