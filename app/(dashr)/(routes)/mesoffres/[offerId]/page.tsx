"use client";

import { use, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchDataById } from "@/utils/utilts";
import { useQuery } from "@tanstack/react-query";

// Type étendu pour une offre d'emploi
interface DetailedJobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedDate: string;
  applicants: number;
  description: string;
  status: "active" | "draft" | "closed";
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  experience: string;
  education: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  views: number;
  applications: {
    total: number;
    new: number;
    shortlisted: number;
    rejected: number;
  };
}

// Données mockées pour l'exemple
const mockOffer: DetailedJobOffer = {
  id: "1",
  title: "Développeur Full Stack",
  company: "Tech Corp",
  location: "Paris, France",
  type: "CDI",
  postedDate: "2024-03-20",
  applicants: 12,
  description:
    "Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe dynamique. Le candidat idéal aura une solide expérience en développement web et une passion pour les nouvelles technologies.",
  status: "active",
  salary: {
    min: 45000,
    max: 65000,
    currency: "EUR",
    period: "an",
  },
  experience: "3-5 ans",
  education: "Bac+5 en Informatique ou équivalent",
  skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS", "Docker"],
  responsibilities: [
    "Développer et maintenir des applications web complexes",
    "Collaborer avec l'équipe de design pour implémenter des interfaces utilisateur",
    "Participer à la conception technique et à l'architecture",
    "Assurer la qualité du code et la performance des applications",
    "Participer aux code reviews et au mentorat",
  ],
  requirements: [
    "3-5 ans d'expérience en développement Full Stack",
    "Expertise en React et Node.js",
    "Bonne connaissance des bases de données NoSQL",
    "Expérience avec les architectures cloud",
    "Bon niveau d'anglais",
  ],
  benefits: [
    "Travail hybride (3j/semaine en télétravail)",
    "Mutuelle d'entreprise",
    "Participation et intéressement",
    "Budget formation",
    "RTT",
  ],
  views: 245,
  applications: {
    total: 12,
    new: 5,
    shortlisted: 3,
    rejected: 4,
  },
};

export default function OffreDetail({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const [offer] = useState<DetailedJobOffer>(mockOffer);

  const { offerId } = use(params);

  const { data: queryoffresbyid } = useQuery({
    queryKey: ["queryoffresbyid"],
    queryFn: () => fetchDataById(`/api/recruteur/offres/${offerId}`),
  });

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec navigation et actions */}
      <div className="flex justify-between items-center">
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

      <div className="grid grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="col-span-2 space-y-6">
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
                <Badge
                // variant={
                //   offer.status === "active"
                //     ? "success"
                //     : offer.status === "draft"
                //     ? "warning"
                //     : "destructive"
                // }
                >
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
                  {queryoffresbyid?.data[0].experience} ans
                </div>
                {/* <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  {queryoffresbyid?.data[0].education}
                </div> */}
                <div className="flex items-center gap-2 text-sm">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  {queryoffresbyid?.data[0].salaryMin.toLocaleString()} -{" "}
                  {queryoffresbyid?.data[0].salaryMax.toLocaleString()}{" "}
                  {queryoffresbyid?.data[0].salaryCurrency}/
                  {queryoffresbyid?.data[0].salaryPeriod}
                </div>
              </div>

              {/* Onglets de contenu */}
              <Tabs defaultValue="description" className="mt-6">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="requirements">Prérequis</TabsTrigger>
                  <TabsTrigger value="benefits">Avantages</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="space-y-4">
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Description du poste</h3>
                    <p className="text-sm text-muted-foreground">
                      {queryoffresbyid?.data[0].description}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Responsabilités</h3>
                    <p className="text-sm text-muted-foreground">
                      {queryoffresbyid?.data[0].responsibilities}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="requirements" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Compétences requises</h3>
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
                    {/* <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {offer.requirements.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul> */}
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
        <div className="space-y-6">
          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Vues</span>
                <span className="font-semibold">{offer.views}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Candidatures totales
                </span>
                <span className="font-semibold">
                  {queryoffresbyid?.data[0]?.applications.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Nouvelles candidatures
                </span>
                <Badge
                // variant="success"
                >
                  {offer.applications.new}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Présélectionnés
                </span>
                <span className="font-semibold">
                  {offer.applications.shortlisted}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Refusés</span>
                <span className="font-semibold">
                  {offer.applications.rejected}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  // window.location.href == "/mesoffres/1/candidatures"
                  (window.location.href = `/mesoffres/${queryoffresbyid?.data[0].id}/candidatures`)
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
  );
}
