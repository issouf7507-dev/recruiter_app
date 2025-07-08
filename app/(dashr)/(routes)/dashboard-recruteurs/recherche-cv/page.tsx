"use client";

import { useState, useEffect } from "react";
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
import { Search, Filter, Download, X, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
// import { useToast } from "@/hooks/use-toast";

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
  applications: {
    id: string;
    jobOffer: {
      id: number;
      title: string;
      company: string;
    };
    status: string;
    createdAt: string;
  }[];
};

type JobOffer = {
  id: number;
  title: string;
  company: string;
  location: string;
  _count: {
    applications: number;
  };
};

export default function RechercheCVPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    experience: "",
    localisation: "",
    diplome: "",
    disponibilite: "",
    pretentionSalariale: "",
    jobOfferId: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidat, setSelectedCandidat] = useState<Candidat | null>(
    null
  );
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [offres, setOffres] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  // const { toast } = useToast();

  // Charger les offres au montage
  useEffect(() => {
    loadOffres();
  }, []);

  // Charger les candidats quand les filtres changent
  useEffect(() => {
    loadCandidats();
  }, [filters, searchTerm]);

  const loadOffres = async () => {
    try {
      const response = await fetch("/api/recruteur/offres");
      if (response.ok) {
        const data = await response.json();
        setOffres(data.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des offres:", error);
      toast.error("Impossible de charger les offres");
    }
  };

  const loadCandidats = async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filters.experience) params.append("experience", filters.experience);
      if (filters.localisation)
        params.append("localisation", filters.localisation);
      if (filters.diplome) params.append("diplome", filters.diplome);
      if (filters.disponibilite)
        params.append("disponibilite", filters.disponibilite);
      if (filters.pretentionSalariale)
        params.append("pretentionSalariale", filters.pretentionSalariale);
      if (filters.jobOfferId) params.append("jobOfferId", filters.jobOfferId);

      const response = await fetch(`/api/recruteur/candidats-search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCandidats(data.data);
      } else {
        console.error("Erreur lors de la recherche des candidats");
        toast.error("Impossible de rechercher les candidats");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche des candidats:", error);
      toast.error("Erreur lors de la recherche");
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      experience: "",
      localisation: "",
      diplome: "",
      disponibilite: "",
      pretentionSalariale: "",
      jobOfferId: "",
    });
  };

  const handleDownloadCV = async (cvUrl: string, candidatNom: string) => {
    if (!cvUrl) {
      toast.error("Ce candidat n'a pas encore uploadé son CV");
      return;
    }

    try {
      const response = await fetch(cvUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `CV_${candidatNom.replace(/\s+/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error("Impossible de télécharger le CV");
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
              {key === "jobOfferId" &&
                "Offre: " +
                  offres.find((o) => o.id.toString() === value)?.title}{" "}
              s
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Chargement...</div>
        </div>
      ) : searching ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Recherche en cours...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidats.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-muted-foreground">
                Aucun candidat trouvé pour ces critères
              </p>
            </div>
          ) : (
            candidats.map((candidat) => (
              <Card
                key={candidat.id}
                className="hover:shadow-lg transition-shadow border bg-transparent shadow-none"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={candidat.photo} />
                      <AvatarFallback>
                        {getInitials(candidat.nom)}
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
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Compétences</p>
                        <div className="flex flex-wrap gap-2">
                          {candidat.competences
                            .slice(0, 3)
                            .map((competence) => (
                              <Badge key={competence} variant="secondary">
                                {competence}
                              </Badge>
                            ))}
                          {candidat.competences.length > 3 && (
                            <Badge variant="outline">
                              +{candidat.competences.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">{candidat.localisation}</Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Candidatures</p>
                      <div className="space-y-1">
                        {candidat.applications.slice(0, 2).map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="truncate">
                              {app.jobOffer.title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {app.status}
                            </Badge>
                          </div>
                        ))}
                        {candidat.applications.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{candidat.applications.length - 2} autres
                            candidatures
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="space-y-1">
                        <p className="text-sm">
                          {/* <span className="font-medium">Disponibilité:</span>{" "} */}
                          {/* {candidat.disponibilite} */}
                        </p>
                        <p className="text-sm">
                          {/* <span className="font-medium" >Prétention:</span>{" "} */}
                          {/* {candidat.pretentionSalariale} */}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedCandidat(candidat)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleDownloadCV(candidat.cvUrl, candidat.nom)
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

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
              <Label>Offre d'emploi</Label>
              <Select
                value={filters.jobOfferId}
                onValueChange={(value) =>
                  setFilters({ ...filters, jobOfferId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les offres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les offres</SelectItem>
                  {offres.map((offre) => (
                    <SelectItem key={offre.id} value={offre.id.toString()}>
                      {offre.title} ({offre._count.applications} candidatures)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  <SelectItem value="">Tous</SelectItem>
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
                  <SelectItem value="">Tous</SelectItem>
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
                  <SelectItem value="">Tous</SelectItem>
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
                  <SelectItem value="">Tous</SelectItem>
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

      {/* Modal de détails du candidat */}
      <Dialog
        open={!!selectedCandidat}
        onOpenChange={() => setSelectedCandidat(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du candidat</DialogTitle>
          </DialogHeader>
          {selectedCandidat && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedCandidat.photo} />
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedCandidat.nom)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedCandidat.nom}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedCandidat.email}
                  </p>
                  <p className="text-sm">{selectedCandidat.localisation}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informations</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Diplôme:</span>{" "}
                      {selectedCandidat.diplome}
                    </p>
                    <p>
                      <span className="font-medium">Expérience:</span>{" "}
                      {selectedCandidat.experience} ans
                    </p>
                    <p>
                      <span className="font-medium">Disponibilité:</span>{" "}
                      {selectedCandidat.disponibilite}
                    </p>
                    <p>
                      <span className="font-medium">Prétention:</span>{" "}
                      {selectedCandidat.pretentionSalariale}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Compétences</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidat.competences.map((competence) => (
                      <Badge key={competence} variant="secondary">
                        {competence}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Candidatures</h4>
                <div className="space-y-2">
                  {selectedCandidat.applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{app.jobOffer.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.jobOffer.company}
                        </p>
                      </div>
                      <Badge variant="outline">{app.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleDownloadCV(
                      selectedCandidat.cvUrl,
                      selectedCandidat.nom
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger CV
                </Button>
                <Button onClick={() => setSelectedCandidat(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
