"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";

const offres = [
  {
    id: 1,
    titre: "Développeur Full Stack",
    entreprise: "TechCorp Inc.",
    localisation: "Abidjan, Côte d'Ivoire",
    type: "CDI",
    salaire: "1 500 000 - 2 000 000 FCFA",
    date: "Il y a 2 jours",
    competences: ["React", "Node.js", "MongoDB"],
    description:
      "Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe de développement agile.",
    match: 95,
  },
  {
    id: 2,
    titre: "Designer UI/UX",
    entreprise: "Digital Solutions",
    localisation: "Abidjan, Côte d'Ivoire",
    type: "CDI",
    salaire: "1 200 000 - 1 800 000 FCFA",
    date: "Il y a 3 jours",
    competences: ["Figma", "Adobe XD", "UI/UX"],
    description:
      "Rejoignez notre équipe créative en tant que Designer UI/UX pour créer des expériences utilisateur exceptionnelles.",
    match: 88,
  },
  {
    id: 3,
    titre: "Data Scientist",
    entreprise: "AI Solutions",
    localisation: "Abidjan, Côte d'Ivoire",
    type: "CDI",
    salaire: "2 000 000 - 2 500 000 FCFA",
    date: "Il y a 1 jour",
    competences: ["Python", "Machine Learning", "TensorFlow"],
    description:
      "Nous recherchons un Data Scientist passionné pour travailler sur des projets innovants d'intelligence artificielle.",
    match: 92,
  },
];

const OffresRecommandeesPage = () => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showCvAlert, setShowCvAlert] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();

  const handlePostuler = (offreId: number) => {
    if (!user?.candidat?.cv || !user?.candidat?.letterm) {
      setShowCvAlert(true);
      return;
    }
    // Ici, vous pouvez ajouter la logique de postulation
    router.push(`/dashboard-candidats/toutes-les-offres/${offreId}`);
  };

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Offres recommandées</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher une offre..." className="pl-8" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="cdi">CDI</SelectItem>
              <SelectItem value="cdd">CDD</SelectItem>
              <SelectItem value="stage">Stage</SelectItem>
            </SelectContent>
          </Select>
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
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="grid gap-6">
          {offres.map((offre) => (
            <Card key={offre.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">{offre.titre}</h2>
                      <Badge variant="secondary" className="ml-2">
                        {offre.match}% match
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {offre.entreprise}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {offre.localisation}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {offre.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {offre.date}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {offre.salaire}
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
                    <div className="flex gap-2">
                      <Button variant="outline">Sauvegarder</Button>
                      <Button onClick={() => handlePostuler(offre.id)}>
                        Postuler
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {offre.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offres.map((offre) => (
            <Card key={offre.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{offre.titre}</h2>
                    <Badge variant="secondary" className="ml-2">
                      {offre.match}% match
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {offre.entreprise}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {offre.localisation}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {offre.type}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {offre.date}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {offre.salaire}
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
                    >
                      Postuler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCvAlert} onOpenChange={setShowCvAlert}>
        <DialogContent className="w-lg">
          <DialogHeader>
            <DialogTitle>Documents manquants</DialogTitle>
            <DialogDescription>
              Pour postuler à une offre, vous devez d'abord compléter votre
              profil en ajoutant votre CV et votre lettre de motivation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Ces documents sont obligatoires pour pouvoir postuler aux offres
              d'emploi.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCvAlert(false)}>
              Plus tard
            </Button>
            <Button asChild>
              <Link href="/dashboard-candidats/informations-personnelles">
                Compléter mon profil
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OffresRecommandeesPage;
