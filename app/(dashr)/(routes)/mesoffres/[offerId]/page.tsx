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
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchData, fetchDataById } from "@/utils/utilts";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import SidebarOffres from "@/components/SidebarOffres";
import KanbanBoard from "@/app/components/kanban/KanbanBoard";
import ManualKanbanBoard from "@/app/components/kanban/ManualKanbanBoard";
import { useRecruteurId } from "@/hooks/useRecruteurId";

// Types pour une meilleure sécurité des données
interface OfferData {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  competences: string[];
  etat: "active" | "draft" | "closed";
  createdAt: string;
  views: number;
  applications: any[];
  kanbanColumns: any[];
}

export default function OffreDetail({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { user } = useUserStore();
  const router = useRouter();
  const { offerId } = use(params);
  const recruteurId = useRecruteurId();

  // Récupérer les détails de l'offre actuelle
  const {
    data: queryoffresbyid,
    isLoading,
    error: offerError,
    refetch: queryoffresbyidrefetch,
  } = useQuery({
    queryKey: ["queryoffresbyid", offerId],
    queryFn: () => fetchDataById(`/api/recruteur/offres/${offerId}`),
    enabled: !!offerId,
  });

  console.log("user", user);

  // Récupérer toutes les offres du recruteur pour l'historique
  const {
    data: allOffers,
    isLoading: allOffersLoading,
    error: allOffersError,
  } = useQuery({
    queryKey: ["allOffers", recruteurId],
    queryFn: () => fetchData(`/api/recruteur/offresbyuser/${recruteurId}`),
    enabled: !!recruteurId,
  });

  console.log("allOffers", allOffers);

  // Fonction utilitaire pour accéder aux données de l'offre de manière sécurisée
  const getOfferData = (): OfferData | null => {
    return queryoffresbyid?.data?.[0] || null;
  };

  const offerData = getOfferData();

  // Fonction pour formater le salaire
  const formatSalary = (
    min: number,
    max: number,
    currency: string,
    period: string
  ) => {
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}/${period}`;
  };

  // Fonction pour obtenir le statut de l'offre
  const getOfferStatus = (etat: string) => {
    switch (etat) {
      case "active":
        return { label: "Active", variant: "default" as const };
      case "draft":
        return { label: "Brouillon", variant: "secondary" as const };
      case "closed":
        return { label: "Fermée", variant: "destructive" as const };
      default:
        return { label: "Inconnu", variant: "outline" as const };
    }
  };

  // Gestion des erreurs
  if (offerError || allOffersError) {
    return (
      <div className="flex h-screen w-full overflow-x-hidden">
        <SidebarOffres offres={allOffers || []} selectedId={offerId} />
        <main className="flex-1 p-8 overflow-y-auto w-full overflow-x-hidden">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Une erreur est survenue lors du chargement des données.
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => {
                  queryoffresbyidrefetch();
                }}
              >
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  // État de chargement
  if (isLoading || allOffersLoading) {
    return (
      <div className="flex h-screen w-full overflow-x-hidden">
        <SidebarOffres offres={allOffers || []} selectedId={offerId} />
        <main className="flex-1 p-8 overflow-y-auto w-full overflow-x-hidden">
          <div className="flex items-center justify-center min-h-[60vh] w-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  // Vérification si l'offre existe
  if (!offerData) {
    return (
      <div className="flex h-screen w-full overflow-x-hidden">
        <SidebarOffres offres={allOffers || []} selectedId={offerId} />
        <main className="flex-1 p-8 overflow-y-auto w-full overflow-x-hidden">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Offre non trouvée ou vous n'avez pas les permissions pour y
              accéder.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const status = getOfferStatus(offerData.etat);

  return (
    <div className="flex h-screen w-full overflow-x-hidden">
      {/* Sidebar */}
      <SidebarOffres offres={allOffers || []} selectedId={offerId} />

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto w-full overflow-x-hidden">
        {/* En-tête avec navigation et actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/mesoffres" aria-label="Retour aux offres">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Détail de l'offre</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Partager</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              {offerData.etat === "active" ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Masquer l'offre</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Publier l'offre</span>
                </>
              )}
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => router.push(`/mesoffres/modifier/${offerId}`)}
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Modifier</span>
            </Button>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="w-full h-[calc(100vh-200px)] overflow-y-auto">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-transparent border">
              <TabsTrigger value="details" className="border shadow-none">
                Détail
              </TabsTrigger>
              <TabsTrigger value="tableau">Tableau</TabsTrigger>
              <TabsTrigger value="personnalise">
                Tableau personnalisé
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Colonne principale */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Carte principale de l'offre */}
                    <Card className="shadow-none border bg-transparent">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div>
                            <CardTitle className="text-2xl">
                              {offerData.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-2">
                              <Building className="h-4 w-4" />
                              {offerData.company}
                            </CardDescription>
                          </div>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Informations principales */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>{offerData.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <BriefcaseIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>{offerData.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>
                              Publié le{" "}
                              {new Date(
                                offerData.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>{offerData.experience}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm sm:col-span-2">
                            <Banknote className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>
                              {formatSalary(
                                offerData.salaryMin,
                                offerData.salaryMax,
                                offerData.salaryCurrency,
                                offerData.salaryPeriod
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Onglets de contenu */}
                        <Tabs defaultValue="description" className="mt-6">
                          <TabsList className="grid w-full grid-cols-3 bg-transparent border">
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
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {offerData.description}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">
                                Responsabilités
                              </h3>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {offerData.responsibilities}
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
                                {offerData.competences?.map(
                                  (skill: string, index: number) => (
                                    <Badge
                                      key={`${skill}-${index}`}
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
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {offerData.requirements}
                              </p>
                            </div>
                          </TabsContent>
                          <TabsContent value="benefits">
                            <div>
                              <h3 className="font-semibold mb-2">Avantages</h3>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {offerData.benefits}
                              </p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Colonne latérale */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Statistiques */}
                    <Card className="shadow-none border bg-transparent">
                      <CardHeader>
                        <CardTitle className="text-lg">Statistiques</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Vues
                          </span>
                          <span className="font-semibold">
                            {offerData.views || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Candidatures totales
                          </span>
                          <span className="font-semibold">
                            {offerData.applications?.length || 0}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Actions rapides */}
                    <Card className="shadow-none border bg-transparent">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Actions rapides
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/mesoffres/${offerData.id}/candidatures`
                            )
                          }
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

            <TabsContent value="tableau" className="w-full">
              <KanbanBoard offerId={offerId} />
            </TabsContent>

            <TabsContent value="personnalise">
              <div className="w-full h-[calc(100vh-200px)] overflow-y-auto">
                <ManualKanbanBoard offerId={offerId} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
