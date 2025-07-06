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
} from "lucide-react";
import Link from "next/link";

export default function OffreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [offre, setOffre] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [postulating, setPostulating] = useState(false);
  const [message, setMessage] = useState("");
  const { user, loading: authLoading } = useAuth();
  const { candidat, loading: candidatLoading } = useAuthCandidat();

  useEffect(() => {
    if (params.id) {
      fetchOffre();
      incrementViews();
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/offres">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux offres
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge className={getTypeColor(offre.type)}>{offre.type}</Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  {offre?.views || 0} vues
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {offre.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {offre.company}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {offre.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Publiée le {formatDate(offre.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description du poste</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {offre.description}
                </p>
              </CardContent>
            </Card>

            {/* Responsabilités */}
            {offre.responsibilities && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsabilités</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {offre.responsibilities.split("\n").map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exigences */}
            {offre.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Exigences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {offre.requirements.split("\n").map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Avantages */}
            {offre.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Avantages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {offre.benefits.split("\n").map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
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
            <Card>
              <CardHeader>
                <CardTitle>Postuler à cette offre</CardTitle>
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
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={handlePostuler}
                      disabled={postulating || !message.trim()}
                      className="w-full"
                    >
                      {postulating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {postulating ? "Envoi en cours..." : "Postuler"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Connexion requise
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Vous devez être connecté en tant que candidat pour
                        postuler à cette offre.
                      </p>
                      <Link href="/candidat/connexion">
                        <Button className="w-full">Se connecter</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations clés */}
            <Card>
              <CardHeader>
                <CardTitle>Informations clés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Expérience
                    </p>
                    <p className="text-sm text-gray-600">{offre.experience}</p>
                  </div>
                </div>

                {offre.salaryMin && offre.salaryMax && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
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

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
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
              <Card>
                <CardHeader>
                  <CardTitle>Compétences recherchées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {offre.competences.map((competence, index) => (
                      <Badge key={index} variant="secondary">
                        {competence}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
