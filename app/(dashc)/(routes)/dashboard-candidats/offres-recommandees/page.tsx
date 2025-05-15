"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Building,
  List,
  Grid,
  Loader2,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchData, postData } from "@/utils/utilts";
import { AlerteNotificationType, JobOffer } from "@/types/types";
import { matchUserWithOffers2 } from "@/utils/matchUserWithOffers";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlerteNotification } from "@/app/components/notifications/alerte-notification";

const OffresRecommandeesPage = () => {
  const { candidat, loading: authLoading } = useUserStore();

  useEffect(() => {
    // Force le rechargement du store au montage du composant
    useUserStore.persist.rehydrate();
  }, []);

  const [showCvAlert, setShowCvAlert] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState({
    type: "all",
    localisation: "all",
    experience: "all",
    salaire: "all",
  });
  const [matchOffersWithUser, setMatchOffersWithUser] = useState<JobOffer[]>(
    []
  );
  const [postulatedOffers, setPostulatedOffers] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "postulated">("all");

  const {
    data: offertData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["offertData2123"],
    queryFn: () => fetchData("/api/recruteur/offres"),
  });

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

  const loadPostulatedOffers = async () => {
    await fetchData("/api/candidat/postulations")
      .then((res) => {
        if (res.success) {
          setPostulatedOffers(res.data.map((app: any) => app.jobOfferId));
        }
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des postulations:", error);
      });
  };

  useEffect(() => {
    if (candidat?.candidat?.id) {
      loadPostulatedOffers();
    }
  }, [candidat]);

  useEffect(() => {
    if (candidat?.candidat?.nom && offertData?.data) {
      const matchedOffers = matchUserWithOffers2(candidat, offertData.data);
      setMatchOffersWithUser(matchedOffers);
    }
  }, [candidat, offertData]);

  // console.log(postulatedOffers.includes(1));

  // Fonction pour filtrer les offres
  const filteredOffers = matchOffersWithUser.filter((offre: JobOffer) => {
    // Filtre par matchingPercentage
    if (!offre.matchingPercentage || offre.matchingPercentage <= 50) {
      return false;
    }

    // Filtre par onglet actif
    if (activeTab === "postulated" && !postulatedOffers.includes(offre.id)) {
      return false;
    }

    // Filtre par type de contrat
    if (filters.type !== "all" && offre.type.toLowerCase() !== filters.type) {
      return false;
    }

    // Filtre par localisation
    if (
      filters.localisation !== "all" &&
      offre.location.toLowerCase() !== filters.localisation
    ) {
      return false;
    }

    // Filtre par expérience
    if (filters.experience !== "all") {
      const experienceLevel = offre.experience.toLowerCase();
      if (
        filters.experience === "debutant" &&
        !experienceLevel.includes("débutant")
      ) {
        return false;
      }
      if (
        filters.experience === "intermediaire" &&
        !experienceLevel.includes("intermédiaire")
      ) {
        return false;
      }
      if (
        filters.experience === "senior" &&
        !experienceLevel.includes("senior")
      ) {
        return false;
      }
    }

    // Filtre par salaire
    if (filters.salaire !== "all") {
      const salaireMoyen = (offre.salaryMin + offre.salaryMax) / 2;
      const [min, max] = filters.salaire.split("-").map(Number);

      if (filters.salaire === "3+") {
        if (salaireMoyen < 3000000) return false;
      } else {
        if (salaireMoyen < min * 1000000 || salaireMoyen > max * 1000000) {
          return false;
        }
      }
    }

    return true;
  });

  const postulerMutation = useMutation({
    mutationFn: (data: { jobOfferId: number; message: string }) =>
      postData(data, "/api/candidat/postuler"),
    onSuccess: () => {
      toast.success("Candidature envoyée avec succès");
      loadPostulatedOffers();
      refetch();
      setShowConfirmModal(false);
      setSelectedOfferId(null);
    },
    onError: (error) => {
      console.error("Erreur lors de la candidature:", error);
      toast.error("Erreur lors de la candidature");
    },
  });

  const handleConfirmPostuler = async () => {
    if (!selectedOfferId) return;

    if (!candidat?.candidat?.cv || !candidat?.candidat?.letterm) {
      setShowCvAlert(true);
      setShowConfirmModal(false);
      return;
    }

    postulerMutation.mutate({
      jobOfferId: selectedOfferId,
      message: "Je suis intéressé par cette offre",
    });
  };

  // console.log(filteredOffers && filteredOffers);

  const handlePostuler = (jobOfferId: number) => {
    setSelectedOfferId(jobOfferId);
    setShowConfirmModal(true);
  };

  // useEffect(() => {
  //   refetch();
  // }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b">
        {/* <div className="space-y-2">
          <h1 className="text-2xl font-bold">Offres recommandées</h1>
          <p className="text-sm text-muted-foreground">
            Découvrez les offres qui correspondent à plus de 50% avec votre
            profil
          </p>
        </div> */}

        <div className=" items-center  pb-4">
          <h1 className="text-2xl font-bold">Offres recommandées</h1>
          <p className="text-sm text-muted-foreground">
            Découvrez les offres qui correspondent à plus de 50% avec votre
            profil
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher une offre..." className="pl-8" />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-accent" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-accent" : ""}
            >
              <Grid className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <AlerteNotification
                notifications={(notifications && notifications) || []}
                isLoading={notificationsLoading}
              />
            </div>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        className="w-full"
        onValueChange={(value) => setActiveTab(value as "all" | "postulated")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">Toutes les offres</TabsTrigger>
          <TabsTrigger value="postulated">Offres postulées</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="flex flex-wrap gap-4 mb-3">
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de contrat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="cdi">CDI</SelectItem>
                <SelectItem value="cdd">CDD</SelectItem>
                <SelectItem value="stage">Stage</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.salaire}
              onValueChange={(value) =>
                setFilters({ ...filters, salaire: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Salaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les salaires</SelectItem>
                <SelectItem value="0-1">0 - 1M FCFA</SelectItem>
                <SelectItem value="1-2">1M - 2M FCFA</SelectItem>
                <SelectItem value="2-3">2M - 3M FCFA</SelectItem>
                <SelectItem value="3+">3M+ FCFA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === "list" ? (
            <div className="grid gap-6">
              {offertData && filteredOffers && filteredOffers.length > 0 ? (
                filteredOffers.map((offre: JobOffer) => (
                  <Card
                    key={offre.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard-candidats/toutes-les-offres/${offre.id}`}
                              className="hover:underline"
                            >
                              <h2 className="text-xl font-semibold">
                                {offre.title}
                              </h2>
                            </Link>
                            <Badge variant="secondary" className="ml-2">
                              {offre.matchingPercentage} % match
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {offre.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {offre.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {offre.type}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(offre.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {offre.salaryMin} - {offre.salaryMax}{" "}
                            {offre.salaryCurrency}
                          </p>
                        </div>
                        <div className="flex flex-col justify-between gap-4">
                          <div className="flex flex-wrap gap-2">
                            {offre.competences.map((competence, index) => (
                              <Badge key={index} variant="outline">
                                {competence}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 items-center justify-end">
                            <Button
                              onClick={() => handlePostuler(offre.id)}
                              disabled={postulatedOffers.includes(offre.id)}
                            >
                              {postulatedOffers.includes(offre.id)
                                ? "Déjà postulé"
                                : "Postuler"}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">
                        {offre.description}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex min-h-[60vh] w-full items-center justify-center">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Aucune offre disponible
                    </h3>
                    <p className="text-muted-foreground text-center">
                      Il n'y a actuellement aucune offre d'emploi correspondant
                      à vos critères.
                      <br />
                      Essayez de modifier vos filtres ou revenez plus tard.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offertData && filteredOffers && filteredOffers.length > 0 ? (
                filteredOffers.map((offre) => (
                  <Card
                    key={offre.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold">
                            {offre.title}
                          </h2>
                          <Badge variant="secondary" className="ml-2">
                            {offre.matchingPercentage}% match
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {offre.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {offre.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {offre.type}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(offre.createdAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {offre.salaryMin} - {offre.salaryMax}{" "}
                          {offre.salaryCurrency}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {offre.competences.map((competence, index) => (
                            <Badge key={index} variant="outline">
                              {competence}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {offre.description}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            Sauvegarder
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => handlePostuler(offre.id)}
                            disabled={postulatedOffers.includes(offre.id)}
                          >
                            {postulatedOffers.includes(offre.id)
                              ? "Déjà postulé"
                              : "Postuler"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Aucune offre disponible
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Il n'y a actuellement aucune offre d'emploi correspondant à
                    vos critères.
                    <br />
                    Essayez de modifier vos filtres ou revenez plus tard.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="postulated" className="mt-6">
          <div className="flex flex-wrap gap-4 mb-3">
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de contrat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="cdi">CDI</SelectItem>
                <SelectItem value="cdd">CDD</SelectItem>
                <SelectItem value="stage">Stage</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.salaire}
              onValueChange={(value) =>
                setFilters({ ...filters, salaire: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Salaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les salaires</SelectItem>
                <SelectItem value="0-1">0 - 1M FCFA</SelectItem>
                <SelectItem value="1-2">1M - 2M FCFA</SelectItem>
                <SelectItem value="2-3">2M - 3M FCFA</SelectItem>
                <SelectItem value="3+">3M+ FCFA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === "list" ? (
            <div className="grid gap-6">
              {offertData && filteredOffers && filteredOffers.length > 0 ? (
                filteredOffers.map((offre: JobOffer) => (
                  <Card
                    key={offre.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard-candidats/toutes-les-offres/${offre.id}`}
                              className="hover:underline"
                            >
                              <h2 className="text-xl font-semibold">
                                {offre.title}
                              </h2>
                            </Link>
                            <Badge variant="secondary" className="ml-2">
                              {offre.matchingPercentage} % match
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {offre.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {offre.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {offre.type}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(offre.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {offre.salaryMin} - {offre.salaryMax}{" "}
                            {offre.salaryCurrency}
                          </p>
                        </div>
                        <div className="flex flex-col justify-between gap-4">
                          <div className="flex flex-wrap gap-2">
                            {offre.competences.map((competence, index) => (
                              <Badge key={index} variant="outline">
                                {competence}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 items-center justify-end">
                            <Button
                              onClick={() => handlePostuler(offre.id)}
                              disabled={postulatedOffers.includes(offre.id)}
                            >
                              {postulatedOffers.includes(offre.id)
                                ? "Déjà postulé"
                                : "Postuler"}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">
                        {offre.description}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex min-h-[60vh] w-full items-center justify-center">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Aucune offre disponible
                    </h3>
                    <p className="text-muted-foreground text-center">
                      Il n'y a actuellement aucune offre d'emploi correspondant
                      à vos critères.
                      <br />
                      Essayez de modifier vos filtres ou revenez plus tard.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offertData && filteredOffers && filteredOffers.length > 0 ? (
                filteredOffers.map((offre) => (
                  <Card
                    key={offre.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold">
                            {offre.title}
                          </h2>
                          <Badge variant="secondary" className="ml-2">
                            {offre.matchingPercentage}% match
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {offre.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {offre.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {offre.type}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(offre.createdAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {offre.salaryMin} - {offre.salaryMax}{" "}
                          {offre.salaryCurrency}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {offre.competences.map((competence, index) => (
                            <Badge key={index} variant="outline">
                              {competence}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {offre.description}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            Sauvegarder
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => handlePostuler(offre.id)}
                            disabled={postulatedOffers.includes(offre.id)}
                          >
                            {postulatedOffers.includes(offre.id)
                              ? "Déjà postulé"
                              : "Postuler"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Aucune offre disponible
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Il n'y a actuellement aucune offre d'emploi correspondant à
                    vos critères.
                    <br />
                    Essayez de modifier vos filtres ou revenez plus tard.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de bienvenue */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bienvenue {candidat?.candidat?.prenom} !</DialogTitle>
            <DialogDescription>
              Nous sommes ravis de vous revoir. Découvrez les dernières offres
              d'emploi correspondant à votre profil.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Votre profil correspond à {matchOffersWithUser.length} offres
              d'emploi. N'hésitez pas à postuler aux offres qui vous
              intéressent.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowWelcomeModal(false)}>
              Commencer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCvAlert} onOpenChange={setShowCvAlert}>
        <DialogContent className="w-lg">
          <DialogHeader>
            <DialogTitle>Documents importants manquants</DialogTitle>
            <DialogDescription>
              Pour maximiser vos chances de trouver un emploi, il est important
              de compléter votre profil en ajoutant votre CV et votre lettre de
              motivation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Ces documents sont essentiels pour que les recruteurs puissent
              vous connaître et vous contacter.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCvAlert(false)}>
              Plus tard
            </Button>
            <Button asChild onClick={() => setShowCvAlert(false)}>
              <Link href="/dashboard-candidats/informations-personnelles">
                Compléter mon profil
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de postulation */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer votre candidature</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir postuler à cette offre ? Votre
              candidature sera envoyée au recruteur.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={postulerMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmPostuler}
              disabled={postulerMutation.isPending}
            >
              {postulerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Confirmer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OffresRecommandeesPage;
