"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Download, Star, StarOff, Filter } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Type pour les candidatures
type Candidature = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  cv: string;
  lettreMotivation: string;
  status: "nouvelle" | "en_cours" | "acceptee" | "refusee";
  date: string;
  isFavorite: boolean;
  offerId: string;
  offerTitle: string;
};

// Données fictives pour les candidatures
const mockCandidatures: Candidature[] = [
  {
    id: "1",
    nom: "Jean Dupont",
    email: "jean.dupont@email.com",
    telephone: "06 12 34 56 78",
    cv: "/cvs/cv-jean-dupont.pdf",
    lettreMotivation: "Je suis très intéressé par ce poste...",
    status: "nouvelle",
    date: "2024-04-15",
    isFavorite: false,
    offerId: "1",
    offerTitle: "Développeur Full Stack",
  },
  {
    id: "2",
    nom: "Marie Martin",
    email: "marie.martin@email.com",
    telephone: "07 23 45 67 89",
    cv: "/cvs/cv-marie-martin.pdf",
    lettreMotivation: "Mon expérience correspond parfaitement...",
    status: "en_cours",
    date: "2024-04-14",
    isFavorite: true,
    offerId: "2",
    offerTitle: "Designer UI/UX",
  },
  {
    id: "3",
    nom: "Pierre Durand",
    email: "pierre.durand@email.com",
    telephone: "06 98 76 54 32",
    cv: "/cvs/cv-pierre-durand.pdf",
    lettreMotivation: "Je suis passionné par...",
    status: "acceptee",
    date: "2024-04-13",
    isFavorite: false,
    offerId: "1",
    offerTitle: "Développeur Full Stack",
  },
];

// Fonction pour obtenir la couleur du badge selon le statut
const getStatusColor = (status: Candidature["status"]) => {
  switch (status) {
    case "nouvelle":
      return "bg-blue-500";
    case "en_cours":
      return "bg-yellow-500";
    case "acceptee":
      return "bg-green-500";
    case "refusee":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

// Fonction pour formater le statut
const formatStatus = (status: Candidature["status"]) => {
  switch (status) {
    case "nouvelle":
      return "Nouvelle";
    case "en_cours":
      return "En cours";
    case "acceptee":
      return "Acceptée";
    case "refusee":
      return "Refusée";
    default:
      return status;
  }
};

export default function CandidaturesPage({
  params,
}: {
  params: { offerId: string };
}) {
  const [candidatures, setCandidatures] =
    useState<Candidature[]>(mockCandidatures);
  const [selectedCandidature, setSelectedCandidature] =
    useState<Candidature | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    date: null as Date | null,
    showFavorites: false,
    offerId: "all",
  });

  const handleViewDetails = (candidature: Candidature) => {
    setSelectedCandidature(candidature);
  };

  const handleToggleFavorite = (candidatureId: string) => {
    setCandidatures(
      candidatures.map((c) =>
        c.id === candidatureId ? { ...c, isFavorite: !c.isFavorite } : c
      )
    );
  };

  const handleDownloadCV = (cvPath: string) => {
    console.log("Téléchargement du CV:", cvPath);
  };

  const handleDownloadLettreMotivation = (content: string, nom: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lettre-motivation-${nom}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filteredCandidatures = candidatures.filter((candidature) => {
    if (filters.status !== "all" && candidature.status !== filters.status) {
      return false;
    }
    if (filters.date) {
      const candidatureDate = new Date(candidature.date);
      const filterDate = filters.date;
      if (
        candidatureDate.getDate() !== filterDate.getDate() ||
        candidatureDate.getMonth() !== filterDate.getMonth() ||
        candidatureDate.getFullYear() !== filterDate.getFullYear()
      ) {
        return false;
      }
    }
    if (filters.showFavorites && !candidature.isFavorite) {
      return false;
    }
    if (filters.offerId !== "all" && candidature.offerId !== filters.offerId) {
      return false;
    }
    return true;
  });

  // Obtenir la liste unique des offres
  const uniqueOffers = Array.from(
    new Set(candidatures.map((c) => ({ id: c.offerId, title: c.offerTitle })))
  );

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex items-center gap-4">
        <Link href={`/mesoffres/${params.offerId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Candidatures reçues</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Offre</Label>
              <Select
                value={filters.offerId}
                onValueChange={(value) =>
                  setFilters({ ...filters, offerId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une offre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les offres</SelectItem>
                  {uniqueOffers.map((offer, idx) => (
                    <SelectItem key={idx} value={offer.id}>
                      {offer.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="nouvelle">Nouvelle</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="acceptee">Acceptée</SelectItem>
                  <SelectItem value="refusee">Refusée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover modal>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.date ? (
                      format(filters.date, "PPP", { locale: fr })
                    ) : (
                      <span>Choisir une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.date || undefined}
                    onSelect={(date) =>
                      setFilters({ ...filters, date: date || null })
                    }
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Favoris uniquement</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.showFavorites}
                  onChange={(e) =>
                    setFilters({ ...filters, showFavorites: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-muted-foreground">
                  {filters.showFavorites ? "Activé" : "Désactivé"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des candidatures</CardTitle>
          <CardDescription>
            Gérez les candidatures reçues pour cette offre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offre</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidatures.map((candidature) => (
                <TableRow key={candidature.id}>
                  <TableCell>{candidature.offerTitle}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {candidature.nom}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleToggleFavorite(candidature.id)}
                      >
                        {candidature.isFavorite ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{candidature.email}</TableCell>
                  <TableCell>{candidature.telephone}</TableCell>
                  <TableCell>{candidature.date}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(candidature.status)}>
                      {formatStatus(candidature.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewDetails(candidature)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownloadCV(candidature.cv)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedCandidature}
        onOpenChange={() => setSelectedCandidature(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de la candidature</DialogTitle>
            <DialogDescription>
              Informations de {selectedCandidature?.nom}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Informations du candidat</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      selectedCandidature &&
                      handleToggleFavorite(selectedCandidature.id)
                    }
                  >
                    {selectedCandidature?.isFavorite ? (
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <Star className="h-5 w-5" />
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Nom :</strong> {selectedCandidature?.nom}
                </p>
                <p>
                  <strong>Email :</strong> {selectedCandidature?.email}
                </p>
                <p>
                  <strong>Téléphone :</strong> {selectedCandidature?.telephone}
                </p>
                <p>
                  <strong>Date de candidature :</strong>{" "}
                  {selectedCandidature?.date}
                </p>
                <p>
                  <strong>Statut :</strong>
                  <Badge
                    className={`ml-2 ${getStatusColor(
                      selectedCandidature?.status || "nouvelle"
                    )}`}
                  >
                    {formatStatus(selectedCandidature?.status || "nouvelle")}
                  </Badge>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Curriculum Vitae</p>
                    <p className="text-sm text-muted-foreground">
                      Document PDF
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleDownloadCV(selectedCandidature?.cv || "")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le CV
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lettre de motivation</p>
                    <p className="text-sm text-muted-foreground">
                      Document texte
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleDownloadLettreMotivation(
                        selectedCandidature?.lettreMotivation || "",
                        selectedCandidature?.nom || ""
                      )
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger la lettre
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lettre de motivation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">
                  {selectedCandidature?.lettreMotivation}
                </p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
