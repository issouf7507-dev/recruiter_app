"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Filter, Download, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Types
type Candidat = {
  id: string;
  nom: string;
  email: string;
  photo: string;
  experience: number;
  competences: string[];
  diplome: string;
  localisation: string;
  disponibilite: string;
  pretentionSalariale: string;
  cvUrl: string;
};

// Données fictives
const mockCandidats: Candidat[] = [
  {
    id: "1",
    nom: "Jean Dupont",
    email: "jean.dupont@email.com",
    photo: "/avatars/jean-dupont.jpg",
    experience: 5,
    competences: ["React", "TypeScript", "Node.js", "MongoDB"],
    diplome: "Master en Informatique",
    localisation: "Paris",
    disponibilite: "Immédiate",
    pretentionSalariale: "45-50k€",
    cvUrl: "/cvs/jean-dupont.pdf",
  },
  {
    id: "2",
    nom: "Marie Martin",
    email: "marie.martin@email.com",
    photo: "/avatars/marie-martin.jpg",
    experience: 3,
    competences: ["Python", "Django", "PostgreSQL", "AWS"],
    diplome: "Master en Data Science",
    localisation: "Lyon",
    disponibilite: "1 mois",
    pretentionSalariale: "40-45k€",
    cvUrl: "/cvs/marie-martin.pdf",
  },
  {
    id: "3",
    nom: "Pierre Durand",
    email: "pierre.durand@email.com",
    photo: "/avatars/pierre-durand.jpg",
    experience: 8,
    competences: ["Java", "Spring", "Kubernetes", "Docker"],
    diplome: "Master en Ingénierie Logicielle",
    localisation: "Bordeaux",
    disponibilite: "Immédiate",
    pretentionSalariale: "55-60k€",
    cvUrl: "/cvs/pierre-durand.pdf",
  },
];

export default function RechercheCVPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    experience: "",
    localisation: "",
    diplome: "",
    disponibilite: "",
    pretentionSalariale: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidat, setSelectedCandidat] = useState<Candidat | null>(
    null
  );

  const resetFilters = () => {
    setFilters({
      experience: "",
      localisation: "",
      diplome: "",
      disponibilite: "",
      pretentionSalariale: "",
    });
  };

  const handleSearch = (candidats: Candidat[]) => {
    return candidats.filter((candidat) => {
      const matchesSearch =
        candidat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidat.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidat.competences.some((comp) =>
          comp.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value || value === "all") return true;
        switch (key) {
          case "experience":
            return candidat.experience >= parseInt(value);
          case "localisation":
            return candidat.localisation
              .toLowerCase()
              .includes(value.toLowerCase());
          case "diplome":
            return candidat.diplome.toLowerCase().includes(value.toLowerCase());
          case "disponibilite":
            return candidat.disponibilite
              .toLowerCase()
              .includes(value.toLowerCase());
          case "pretentionSalariale":
            return candidat.pretentionSalariale.includes(value);
          default:
            return true;
        }
      });

      return matchesSearch && matchesFilters;
    });
  };

  const filteredCandidats = handleSearch(mockCandidats);

  const handleDownloadCV = (cvUrl: string) => {
    // Ici, vous implémenteriez la logique de téléchargement
    console.log("Téléchargement du CV:", cvUrl);
  };

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recherche de CV</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetFilters}>
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <Button variant="outline" onClick={() => setShowFilters(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou compétence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(filters).map(([key, value]) => {
          if (!value) return null;
          return (
            <Badge
              key={key}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {key === "experience" && "Expérience: " + value + "+ ans"}
              {key === "localisation" && "Localisation: " + value}
              {key === "diplome" && "Diplôme: " + value}
              {key === "disponibilite" && "Disponibilité: " + value}
              {key === "pretentionSalariale" && "Salaire: " + value + "k€+"}
              <button
                onClick={() => setFilters({ ...filters, [key]: "" })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidats.map((candidat) => (
          <Card key={candidat.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={candidat.photo} />
                  <AvatarFallback>
                    {candidat.nom
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{candidat.nom}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {candidat.email}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{candidat.diplome}</p>
                    <p className="text-sm text-muted-foreground">
                      {candidat.experience} ans d'expérience
                    </p>
                  </div>
                  <Badge variant="outline">{candidat.localisation}</Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Compétences</p>
                  <div className="flex flex-wrap gap-2">
                    {candidat.competences.map((competence) => (
                      <Badge key={competence} variant="secondary">
                        {competence}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Disponibilité:</span>{" "}
                      {candidat.disponibilite}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Prétention:</span>{" "}
                      {candidat.pretentionSalariale}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownloadCV(candidat.cvUrl)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filtres de recherche</DialogTitle>
            <DialogDescription>
              Affinez votre recherche en utilisant les filtres ci-dessous
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Années d'expérience minimum</Label>
              <Select
                value={filters.experience}
                onValueChange={(value) =>
                  setFilters({ ...filters, experience: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="0">0+</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                  <SelectItem value="8">8+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Localisation</Label>
              <Input
                value={filters.localisation}
                onChange={(e) =>
                  setFilters({ ...filters, localisation: e.target.value })
                }
                placeholder="Ex: Paris"
              />
            </div>

            <div className="space-y-2">
              <Label>Diplôme</Label>
              <Select
                value={filters.diplome}
                onValueChange={(value) =>
                  setFilters({ ...filters, diplome: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                  <SelectItem value="Licence">Licence</SelectItem>
                  <SelectItem value="Doctorat">Doctorat</SelectItem>
                  <SelectItem value="BTS">BTS</SelectItem>
                  <SelectItem value="DUT">DUT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Disponibilité</Label>
              <Select
                value={filters.disponibilite}
                onValueChange={(value) =>
                  setFilters({ ...filters, disponibilite: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Immédiate">Immédiate</SelectItem>
                  <SelectItem value="1 mois">1 mois</SelectItem>
                  <SelectItem value="2 mois">2 mois</SelectItem>
                  <SelectItem value="3 mois">3 mois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prétention salariale</Label>
              <Select
                value={filters.pretentionSalariale}
                onValueChange={(value) =>
                  setFilters({ ...filters, pretentionSalariale: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="30">30-35k€</SelectItem>
                  <SelectItem value="35">35-40k€</SelectItem>
                  <SelectItem value="40">40-45k€</SelectItem>
                  <SelectItem value="45">45-50k€</SelectItem>
                  <SelectItem value="50">50k€+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
              <Button onClick={() => setShowFilters(false)}>Appliquer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
