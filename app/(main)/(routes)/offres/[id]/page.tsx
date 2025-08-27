"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useAuthCandidat } from "@/hooks/useAuthCandidat";
import { JobOffer } from "@/types/types";
import {
  MapPin,
  Building,
  Clock,
  DollarSign,
  Users,
  Eye,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/header/header";
import {
  Dialog,
  DialogFooter,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { fetchData, postData } from "@/utils/utilts";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import CandidatProfileForm from "@/components/CandidatProfileForm";

export default function OffreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [offre, setOffre] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [postulating, setPostulating] = useState(false);
  const [message, setMessage] = useState("");
  const [otherOffers, setOtherOffers] = useState<JobOffer[]>([]);
  const [loadingOtherOffers, setLoadingOtherOffers] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCvAlert, setShowCvAlert] = useState(false);
  const [postulatedOffers, setPostulatedOffers] = useState<number[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [isOpenCandidat, setIsOpenCandidat] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { candidat, loading: candidatLoading } = useAuthCandidat();

  useEffect(() => {
    if (params.id) {
      fetchOffre();
      incrementViews();
      fetchOtherOffers();
    }
  }, [params.id]);

  const loadPostulatedOffers = async () => {
    await fetchData("/api/candidat/postulations")
      .then((res) => {
        if (res.success) {
          setPostulatedOffers(res.data.map((app: any) => app.jobOfferId));
          // console.log(res.data);
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

  const fetchOffre = async () => {
    try {
      const response = await fetch(`/api/recruteur/offres/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOffre(data.data[0] || null);
        console.log(data.data[0]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'offre:", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await fetch(`/api/recruteur/offres/${params.id}/views`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Erreur lors de l'incrémentation des vues:", error);
    }
  };

  const fetchOtherOffers = async () => {
    setLoadingOtherOffers(true);
    try {
      const response = await fetch(
        `/api/offres/search?limit=6&exclude=${params.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setOtherOffers(data.offers || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des autres offres:", error);
    } finally {
      setLoadingOtherOffers(false);
    }
  };

  const postulerMutation = useMutation({
    mutationFn: (data: { jobOfferId: number; message: string }) =>
      postData(data, "/api/candidat/postuler"),
    onSuccess: () => {
      toast.success("Candidature envoyée avec succès");
      loadPostulatedOffers();
      // refetch();
      setShowConfirmModal(false);
      setSelectedOfferId(null);
    },
    onError: (error) => {
      console.error("Erreur lors de la candidature:", error);
      toast.error("Erreur lors de la candidature");
    },
  });

  const handleConfirmPostuler = () => {
    if (!selectedOfferId) return;

    if (!candidat?.candidat?.cv || !candidat?.candidat?.letterm) {
      setShowCvAlert(true);
      setShowConfirmModal(false);
      return;
    }

    postulerMutation.mutate(
      {
        jobOfferId: selectedOfferId,
        message: "Je suis intéressé par cette offre",
      },
      {
        onSuccess(data, variables, context) {
          window.location.reload();
        },
      }
    );
  };

  const handlePostuler = (jobOfferId: number) => {
    setSelectedOfferId(jobOfferId);
    setShowConfirmModal(true);
  };

  const formatSalary = (
    min: number,
    max: number,
    currency: string,
    period: string
  ) => {
    const currencySymbol =
      currency === "EUR" ? "€" : currency === "USD" ? "$" : currency;
    const periodText =
      period === "mois" ? "/mois" : period === "an" ? "/an" : "/heure";
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currencySymbol}${periodText}`;
  };

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
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading || authLoading || candidatLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!offre) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Offre non trouvée
          </h2>
          <p className="text-muted-foreground mb-4">
            L'offre que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Link href="/offres">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux offres
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 mt-16 sm:mt-20">
        {/* Navigation et titre */}
        <div className="bg-card rounded-lg shadow-none border p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <Link href="/offres">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 w-fit"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Retour aux offres</span>
                  <span className="sm:hidden">Retour</span>
                </Button>
              </Link>
              <div className="hidden sm:block h-6 w-px bg-border"></div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground break-words">
                {offre.title}
              </h1>
            </div>
            <Badge
              className={`text-sm px-3 sm:px-4 py-1 sm:py-2 w-fit ${getTypeColor(
                offre.type
              )}`}
            >
              {offre.type}
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-foreground break-words">
                {offre.company}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="break-words">{offre.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="break-words">{offre.experience} ans</span>
            </div>
            {offre.duedate && (
              <div className="flex items-center gap-2 text-red-600">
                <Clock className="h-4 w-4 flex-shrink-0 text-red-500" />
                <span className="break-words font-medium">
                  Échéance:{" "}
                  {new Date(offre.duedate).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 flex-shrink-0" />
              <span>{offre.views || 0} vues</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>
                {offre.applications?.length || 0} candidature
                {(offre.applications?.length || 0) > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Contenu principal */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Description */}
            <Card className="shadow-none border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  Description du poste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-sm md:text-base text-muted-foreground  whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: offre.description }}
                ></div>
              </CardContent>
            </Card>

            {/* Responsabilités */}

            {/* Exigences */}

            {/* Avantages */}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Carte de candidature */}
            <Card className="shadow-none border-2 border-primary/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-semibold">
                  Postuler à cette offre
                </CardTitle>
                <CardDescription className="text-sm">
                  Envoyez votre candidature pour ce poste
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidat ? (
                  <>
                    <Button
                      onClick={() => handlePostuler(offre.id)}
                      disabled={postulatedOffers.includes(offre.id)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {postulatedOffers.includes(offre.id)
                        ? "Déjà postulé"
                        : "Postuler"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">
                        Connexion requise
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                        Vous devez être connecté en tant que candidat pour
                        postuler à cette offre.
                      </p>
                      <Link href="/candidat/connexion">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-sm">
                          Se connecter
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations clés */}
            <Card className="shadow-none border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg font-semibold">
                  Informations clés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-foreground">
                      Expérience
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      {offre.experience} ans
                    </p>
                  </div>
                </div>

                {offre.duedate && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-foreground">
                        Date d'échéance
                      </p>
                      <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium break-words">
                        {new Date(offre.duedate).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {offre.salaryMin && offre.salaryMax && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-foreground">
                        Salaire
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">
                        {formatSalary(
                          offre.salaryMin,
                          offre.salaryMax,
                          offre.salaryCurrency,
                          offre.salaryPeriod
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-foreground">
                      Candidatures
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {offre.applications?.length || 0} candidature
                      {(offre.applications?.length || 0) > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compétences */}
            {offre.jobOfferCompetences &&
              offre.jobOfferCompetences.length > 0 && (
                <Card className="shadow-none border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base sm:text-lg font-semibold">
                      Compétences recherchées
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {offre.jobOfferCompetences.map((competence, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-2 sm:px-3 py-1 text-xs"
                        >
                          {competence.competence}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>

        {/* Section Autres offres */}
        <div className="mt-8 sm:mt-12">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Autres offres qui pourraient vous intéresser
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Découvrez d'autres opportunités similaires
            </p>
          </div>

          {loadingOtherOffers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="shadow-none border animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : otherOffers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {otherOffers.map((otherOffre) => (
                <Card
                  key={otherOffre.id}
                  className="hover:shadow-md transition-shadow duration-200 shadow-none"
                >
                  <Link href={`/offres/${otherOffre.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg font-semibold text-foreground line-clamp-2 break-words">
                            {otherOffre.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <Building className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="break-words">
                                {otherOffre.company}
                              </span>
                            </div>
                          </CardDescription>
                        </div>
                        <Badge
                          className={`text-xs px-2 py-1 ml-2 flex-shrink-0 ${getTypeColor(
                            otherOffre.type
                          )}`}
                        >
                          {otherOffre.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="break-words">
                          {otherOffre.location}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="break-words">
                          {otherOffre.experience} ans
                        </span>
                      </div>

                      {otherOffre.duedate && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-red-600">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-red-500" />
                          <span className="break-words font-medium">
                            Échéance:{" "}
                            {new Date(otherOffre.duedate).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      )}

                      {otherOffre.salaryMin && otherOffre.salaryMax && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="break-words">
                            {formatSalary(
                              otherOffre.salaryMin,
                              otherOffre.salaryMax,
                              otherOffre.salaryCurrency,
                              otherOffre.salaryPeriod
                            )}
                          </span>
                        </div>
                      )}

                      <div
                        className="text-xs sm:text-sm text-muted-foreground line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: otherOffre.description,
                        }}
                      />

                      {otherOffre.jobOfferCompetences &&
                        otherOffre.jobOfferCompetences.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {otherOffre.jobOfferCompetences
                              .slice(0, 3)
                              .map((competence, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs px-2 py-1"
                                >
                                  {competence.competence}
                                </Badge>
                              ))}
                            {otherOffre.jobOfferCompetences.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-1"
                              >
                                +{otherOffre.jobOfferCompetences.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full text-sm mt-10">
                        Voir l'offre
                      </Button>
                    </CardFooter>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
                Aucune autre offre disponible
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pour le moment, il n'y a pas d'autres offres similaires.
              </p>
              <Link href="/offres">
                <Button variant="outline" size="sm">
                  Voir toutes les offres
                </Button>
              </Link>
            </div>
          )}

          {otherOffers.length > 0 && (
            <div className="text-center mt-6 sm:mt-8">
              <Link href="/offres">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-sm sm:text-base"
                >
                  Voir toutes les offres
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showCvAlert} onOpenChange={setShowCvAlert}>
        <DialogContent className="w-[90vw] max-w-lg">
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
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCvAlert(false)}
              className="w-full sm:w-auto"
            >
              Plus tard
            </Button>
            <Button
              onClick={() => {
                setShowCvAlert(false);
                setIsOpenCandidat(true);
              }}
              className="w-full sm:w-auto"
            >
              Compléter mon profil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de postulation */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="w-[90vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer votre candidature</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir postuler à cette offre ? Votre
              candidature sera envoyée au recruteur.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={postulerMutation.isPending}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmPostuler}
              disabled={postulerMutation.isPending}
              className="w-full sm:w-auto"
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

      <Sheet open={isOpenCandidat} onOpenChange={setIsOpenCandidat}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto px-6 py-8">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold">
              Modifier mon profil candidat
            </SheetTitle>
            <SheetDescription>
              Mettez à jour vos informations personnelles et professionnelles
            </SheetDescription>
          </SheetHeader>

          <CandidatProfileForm onClose={() => setIsOpenCandidat(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
