"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Building,
  MapPin,
  Calendar,
  Clock,
  BriefcaseIcon,
  Banknote,
  Share2,
  Eye,
  EyeOff,
  ArrowLeft,
  Pencil,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchData, fetchDataById } from "@/utils/utilts";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import SidebarOffres from "@/components/SidebarOffres";
import { Application, KanbanColumn } from "@/types/types";
import CandidaturesTable from "@/app/components/tables/candidatsTable";

import Board from "@/app/components/kanban/Board";
import KanbanBoard from "@/app/components/kanban/KanbanBoard";
// import CandidaturesTable from "@/app/components/tables/candidatsTable";
// import KanbanBoard from "@/app/components/kanban/KanbanBoard";

// import KanbanBoard from "@/components/kanban/KanbanBoard";

// Données mockées pour l'exemple

export default function OffreDetail({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { user } = useUserStore();
  const { offerId } = use(params);

  // Récupérer les détails de l'offre actuelle
  const {
    data: queryoffresbyid,
    isLoading,
    refetch: queryoffresbyidrefetch,
  } = useQuery({
    queryKey: ["queryoffresbyid"],
    queryFn: () => fetchDataById(`/api/recruteur/offres/${offerId}`),
  });

  // Récupérer toutes les offres du recruteur pour l'historique
  const { data: allOffers, isLoading: allOffersLoading } = useQuery({
    queryKey: ["allOffers"],
    queryFn: () =>
      fetchData(`/api/recruteur/offresbyuser/${user?.recruteur?.id}`),
  });

  const { data: candidatdata, isLoading: candidatdataLoding } = useQuery({
    queryKey: ["candidatdataforntable", offerId],
    queryFn: () =>
      fetchData(`/api/recruteur/offresbyuser/applications/${offerId}`),
  });

  // console.log(queryoffresbyid?.data[0].kanbanColumns);

  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Mettre à jour les états locaux quand les données changent
  useEffect(() => {
    if (queryoffresbyid?.data?.[0]) {
      setColumns(queryoffresbyid.data[0].kanbanColumns || []);
      setApplications(queryoffresbyid.data[0].applications || []);
    }
  }, [queryoffresbyid?.data]);

  if (isLoading || allOffersLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-x-hidden">
      {/* Sidebar */}
      <SidebarOffres offres={allOffers?.data || []} selectedId={offerId} />
      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto w-full overflow-x-hidden">
        {/* En-tête avec navigation et actions */}
        <div className="flex justify-between items-center ">
          <div className="flex items-center gap-4">
            <Link href="/mesoffres">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Détail de l'offre</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Partager
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              {queryoffresbyid?.data[0].etat === "active" ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Masquer l'offre
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Publier l'offre
                </>
              )}
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() =>
                (window.location.href = `/mesoffres/modifier/${offerId}`)
              }
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
          </div>
        </div>

        {/* Tabs navigation */}

        <div className="w-full h-[100vh] overflow-y-auto">
          <Tabs defaultValue="details" className="w-full mt-6">
            <TabsList>
              <TabsTrigger value="details">Détail</TabsTrigger>
              <TabsTrigger value="candidatures">Candidatures</TabsTrigger>

              <TabsTrigger value="tableau">Tableau</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="space-y-6">
                <div className="grid grid-cols-12 gap-6">
                  {/* Colonne principale */}
                  <div className="col-span-8 space-y-6">
                    {/* Carte principale de l'offre */}
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-2xl">
                              {queryoffresbyid?.data[0].title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-2">
                              <Building className="h-4 w-4" />
                              {queryoffresbyid?.data[0].company}
                            </CardDescription>
                          </div>
                          <Badge>
                            {queryoffresbyid?.data[0].etat === "active"
                              ? "Active"
                              : queryoffresbyid?.data[0].etat === "draft"
                              ? "Brouillon"
                              : "Fermée"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Informations principales */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {queryoffresbyid?.data[0].location}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                            {queryoffresbyid?.data[0].type}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Publié le{" "}
                            {new Date(
                              queryoffresbyid?.data[0].createdAt
                            ).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {queryoffresbyid?.data[0].experience}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                            {queryoffresbyid?.data[0].salaryMin.toLocaleString()}{" "}
                            -{" "}
                            {queryoffresbyid?.data[0].salaryMax.toLocaleString()}{" "}
                            {queryoffresbyid?.data[0].salaryCurrency}/
                            {queryoffresbyid?.data[0].salaryPeriod}
                          </div>
                        </div>

                        {/* Onglets de contenu */}
                        <Tabs defaultValue="description" className="mt-6">
                          <TabsList>
                            <TabsTrigger value="description">
                              Description
                            </TabsTrigger>
                            <TabsTrigger value="requirements">
                              Prérequis
                            </TabsTrigger>
                            <TabsTrigger value="benefits">
                              Avantages
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent
                            value="description"
                            className="space-y-4"
                          >
                            <div className="mt-4">
                              <h3 className="font-semibold mb-2">
                                Description du poste
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {queryoffresbyid?.data[0].description}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">
                                Responsabilités
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {queryoffresbyid?.data[0].responsibilities}
                              </p>
                            </div>
                          </TabsContent>
                          <TabsContent
                            value="requirements"
                            className="space-y-4"
                          >
                            <div>
                              <h3 className="font-semibold mb-2">
                                Compétences requises
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {queryoffresbyid?.data[0].competences.map(
                                  (skill: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="capitalize"
                                    >
                                      {skill}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">Prérequis</h3>
                              <p className="text-sm text-muted-foreground">
                                {queryoffresbyid?.data[0].requirements}
                              </p>
                            </div>
                          </TabsContent>
                          <TabsContent value="benefits">
                            <div>
                              <h3 className="font-semibold mb-2">Avantages</h3>
                              <p className="text-sm text-muted-foreground">
                                {queryoffresbyid?.data[0].benefits}
                              </p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Colonne latérale */}
                  <div className="col-span-4 space-y-6">
                    {/* Statistiques */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Statistiques</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Vues
                          </span>
                          <span className="font-semibold">
                            {queryoffresbyid?.data[0]?.views || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Candidatures totales
                          </span>
                          <span className="font-semibold">
                            {queryoffresbyid?.data[0]?.applications.length || 0}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Actions rapides */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Actions rapides
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => {
                            if (queryoffresbyid?.data[0].id) {
                              window.location.href = `/mesoffres/${queryoffresbyid?.data[0].id}/candidatures`;
                            }
                          }}
                        >
                          Voir les candidatures
                        </Button>
                        <Button className="w-full" variant="outline">
                          Télécharger les CV
                        </Button>
                        <Button className="w-full" variant="outline">
                          Exporter les statistiques
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="candidatures" className="w-full">
              <CandidaturesTable
                candidatdata={candidatdata?.data}
                candidatdataLoding={candidatdataLoding}
              />
            </TabsContent>

            <TabsContent value="tableau" className="w-full ">
              <KanbanBoard offerId={offerId} />

              {/* <Board /> */}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
