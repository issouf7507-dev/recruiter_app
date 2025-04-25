"use client";

import { useParams } from "next/navigation";
import { use, useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { JobOffer } from "@/types/types";
import { fetchData } from "@/utils/utilts";
import { useQuery, useMutation } from "@tanstack/react-query";

const DetailOffrePage = ({ params }: { params: Promise<{ id: string }> }) => {
  //   const params = useParams();
  const { id } = use(params);
  const [offre, setOffre] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const hasIncrementedViews = useRef(false);

  // Récupérer les données de l'offre existante
  const { data: offertData, isLoading } = useQuery({
    queryKey: ["offerbyid", id],
    queryFn: () => fetchData(`/api/recruteur/offres/${id}`),
  });

  // Récupérer les offres similaires
  const { data: similarOffers, isLoading: isLoadingSimilar } = useQuery({
    queryKey: ["similaroffers", id],
    queryFn: () => fetchData(`/api/recruteur/offres/similar/${id}`),
    enabled: !!offertData?.data?.[0],
  });

  // Mutation pour incrémenter les vues
  const { mutate: incrementViews } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/recruteur/offres/${id}/views`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de l'incrémentation des vues");
      }
      return response.json();
    },
    onError: (error) => {
      console.error("Erreur lors de l'incrémentation des vues:", error);
    },
  });

  // Appeler la mutation une seule fois au chargement de la page
  useEffect(() => {
    if (id && !hasIncrementedViews.current) {
      hasIncrementedViews.current = true;
      incrementViews();
    }
  }, [id, incrementViews]);

  //   console.log(offerData);
  //   if (offertData) {
  //     setOffre(offertData?.data?.[0]);
  //   }
  //   const offer =

  //   useEffect(() => {
  //     const fetchOffre = async () => {
  //       try {
  //         const data = await fetchData(`/api/recruteur/offres/${params.id}`);
  //         setOffre(data);
  //       } catch (error) {
  //         console.error("Erreur lors de la récupération de l'offre:", error);
  //         toast.error("Erreur lors de la récupération de l'offre");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchOffre();
  //   }, [params.id]);

  const handlePostuler = async () => {
    try {
      const response = await fetch("/api/candidat/postuler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobOfferId: offre?.id,
          message: "Je suis intéressé par cette offre",
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Candidature envoyée avec succès");
      } else {
        toast.error(result.error || "Erreur lors de la candidature");
      }
    } catch (error) {
      console.error("Erreur lors de la candidature:", error);
      toast.error("Erreur lors de la candidature");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!offertData?.data?.[0]) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] w-full">
        <h2 className="text-2xl font-bold mb-4">Offre non trouvée</h2>
        <Link href="/dashboard-candidats/toutes-les-offres">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux offres
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <Link href="/dashboard-candidats/toutes-les-offres">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux offres
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline">Sauvegarder</Button>
          <Button onClick={handlePostuler}>Postuler</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                  {offertData?.data?.[0].title}
                </h1>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg">
                    {offertData?.data?.[0].company}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{offertData?.data?.[0].location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{offertData?.data?.[0].type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {offertData?.data?.[0].salaryMin} -{" "}
                    {offertData?.data?.[0].salaryMax}{" "}
                    {offertData?.data?.[0].salaryCurrency}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(
                      offertData?.data?.[0].createdAt
                    ).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>{offertData?.data?.[0].views} vues</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground">
                    {offertData?.data?.[0].description}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Compétences requises
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {offertData?.data?.[0].competences.map(
                      (competence: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {competence}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Responsabilités
                  </h2>
                  <p className="text-muted-foreground">
                    {offertData?.data?.[0].responsibilities}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Exigences</h2>
                  <p className="text-muted-foreground">
                    {offertData?.data?.[0].requirements}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Avantages</h2>
                  <p className="text-muted-foreground">
                    {offertData?.data?.[0].benefits}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Offres similaires</h2>
          {isLoadingSimilar ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : similarOffers?.data?.length > 0 ? (
            <div className="space-y-4">
              {similarOffers.data.map((offer: JobOffer) => (
                <Link
                  key={offer.id}
                  href={`/dashboard-candidats/toutes-les-offres/${offer.id}`}
                >
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{offer.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Building className="h-4 w-4" />
                        <span>{offer.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{offer.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          {offer.salaryMin} - {offer.salaryMax}{" "}
                          {offer.salaryCurrency}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Aucune offre similaire trouvée
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailOffrePage;
