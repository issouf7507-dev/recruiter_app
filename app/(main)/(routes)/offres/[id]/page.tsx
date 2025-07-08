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
  Calendar,
  Users,
  Eye,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Send,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/header/header";

export default function OffreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [offre, setOffre] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [postulating, setPostulating] = useState(false);
  const [message, setMessage] = useState("");
  const [otherOffers, setOtherOffers] = useState<JobOffer[]>([]);
  const [loadingOtherOffers, setLoadingOtherOffers] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { candidat, loading: candidatLoading } = useAuthCandidat();

  useEffect(() => {
    if (params.id) {
      fetchOffre();
      incrementViews();
      fetchOtherOffers();
    }
  }, [params.id]);

  const fetchOffre = async () => {
    try {
      const response = await fetch(`/api/recruteur/offres/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOffre(data.data[0] || null);
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

  const handlePostuler = async () => {
    if (!candidat) {
      router.push("/candidat/connexion");
      return;
    }

    if (!message.trim()) {
      alert("Veuillez ajouter un message de motivation");
      return;
    }

    setPostulating(true);
    try {
      const response = await fetch("/api/candidat/postuler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobOfferId: offre?.id,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        alert("Candidature envoyée avec succès !");
        setMessage("");
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de l'envoi de la candidature");
      }
    } catch (error) {
      console.error("Erreur lors de la candidature:", error);
      alert("Erreur lors de l'envoi de la candidature");
    } finally {
      setPostulating(false);
    }
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
        return "bg-green-100 text-green-800";
      case "CDD":
        return "bg-blue-100 text-blue-800";
      case "Stage":
        return "bg-purple-100 text-purple-800";
      case "Freelance":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!offre) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Offre non trouvée
          </h2>
          <p className="text-gray-600 mb-4">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-20">
        {/* Navigation et titre */}
        <div className="bg-white rounded-lg shadow-none border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/offres">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux offres
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                {offre.title}
              </h1>
            </div>
            <Badge className={`text-sm px-4 py-2 ${getTypeColor(offre.type)}`}>
              {offre.type}
            </Badge>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="font-medium">{offre.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{offre.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{offre.experience}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{offre.views || 0} vues</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {offre.applications?.length || 0} candidature
                {(offre.applications?.length || 0) > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="shadow-none border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">
                  Description du poste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {offre.description}
                </p>
              </CardContent>
            </Card>

            {/* Responsabilités */}
            {offre.responsibilities && (
              <Card className="shadow-none border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold">
                    Responsabilités
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {offre.responsibilities.split("\n").map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 leading-relaxed">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exigences */}
            {offre.requirements && (
              <Card className="shadow-none border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold">
                    Exigences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {offre.requirements.split("\n").map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 leading-relaxed">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Avantages */}
            {offre.benefits && (
              <Card className="shadow-none border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold">
                    Avantages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {offre.benefits.split("\n").map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 leading-relaxed">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Carte de candidature */}
            <Card className="shadow-none border-2 border-primary/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  Postuler à cette offre
                </CardTitle>
                <CardDescription>
                  Envoyez votre candidature pour ce poste
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidat ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Message de motivation
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Expliquez pourquoi vous êtes intéressé par ce poste..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={handlePostuler}
                      disabled={postulating || !message.trim()}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {postulating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {postulating
                        ? "Envoi en cours..."
                        : "Postuler maintenant"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Connexion requise
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Vous devez être connecté en tant que candidat pour
                        postuler à cette offre.
                      </p>
                      <Link href="/candidat/connexion">
                        <Button className="w-full bg-primary hover:bg-primary/90">
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
                <CardTitle className="text-lg font-semibold">
                  Informations clés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Expérience
                    </p>
                    <p className="text-sm text-gray-600">{offre.experience}</p>
                  </div>
                </div>

                {offre.salaryMin && offre.salaryMax && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Salaire
                      </p>
                      <p className="text-sm text-gray-600">
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

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Candidatures
                    </p>
                    <p className="text-sm text-gray-600">
                      {offre.applications?.length || 0} candidature
                      {(offre.applications?.length || 0) > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compétences */}
            {offre.competences && offre.competences.length > 0 && (
              <Card className="shadow-none border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">
                    Compétences recherchées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {offre.competences.map((competence, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {competence}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Section Autres offres */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Autres offres qui pourraient vous intéresser
            </h2>
            <p className="text-gray-600">
              Découvrez d'autres opportunités similaires
            </p>
          </div>

          {loadingOtherOffers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="shadow-none border animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : otherOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherOffers.map((otherOffre) => (
                <Card
                  key={otherOffre.id}
                  className="hover:shadow-md transition-shadow duration-200 shadow-none"
                >
                  <Link href={`/offres/${otherOffre.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {otherOffre.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building className="h-4 w-4" />
                              {otherOffre.company}
                            </div>
                          </CardDescription>
                        </div>
                        <Badge
                          className={`text-xs px-2 py-1 ${getTypeColor(
                            otherOffre.type
                          )}`}
                        >
                          {otherOffre.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {otherOffre.location}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {otherOffre.experience}
                      </div>

                      {otherOffre.salaryMin && otherOffre.salaryMax && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          {formatSalary(
                            otherOffre.salaryMin,
                            otherOffre.salaryMax,
                            otherOffre.salaryCurrency,
                            otherOffre.salaryPeriod
                          )}
                        </div>
                      )}

                      <p className="text-sm text-gray-600 line-clamp-3">
                        {otherOffre.description}
                      </p>

                      {otherOffre.competences &&
                        otherOffre.competences.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {otherOffre.competences
                              .slice(0, 3)
                              .map((competence, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {competence}
                                </Badge>
                              ))}
                            {otherOffre.competences.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{otherOffre.competences.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Voir l'offre</Button>
                    </CardFooter>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune autre offre disponible
              </h3>
              <p className="text-gray-600 mb-4">
                Pour le moment, il n'y a pas d'autres offres similaires.
              </p>
              <Link href="/offres">
                <Button variant="outline">Voir toutes les offres</Button>
              </Link>
            </div>
          )}

          {otherOffers.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/offres">
                <Button variant="outline" size="lg">
                  Voir toutes les offres
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
