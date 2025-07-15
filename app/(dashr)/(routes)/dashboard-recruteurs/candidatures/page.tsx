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
import {
  ArrowLeft,
  Eye,
  Download,
  Star,
  StarOff,
  Filter,
  Loader2,
} from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/utils/utilts";
import { Application } from "@/types/types";

// Fonction pour obtenir la couleur du badge selon le statut
const getStatusColor = (status: string) => {
  switch (status) {
    case "Nouvelles":
      return "bg-blue-500";
    case "En cours":
      return "bg-yellow-500";
    case "Acceptées":
      return "bg-green-500";
    case "Refusées":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

// Fonction pour formater le statut
const formatStatus = (status: string) => {
  return status;
};

export default function CandidaturesPage() {
  const [selectedCandidature, setSelectedCandidature] =
    useState<Application | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    date: null as Date | null,
    showFavorites: false,
    offerId: "all",
  });

  const handleViewDetails = (candidature: Application) => {
    setSelectedCandidature(candidature);
  };

  const handleDownloadCV = (cvPath: string) => {
    if (cvPath) {
      window.open(cvPath, "_blank");
    } else {
      console.log("Aucun CV disponible");
    }
  };

  const handleDownloadLettreMotivation = (content: string, nom: string) => {
    if (content) {
      const blob = new Blob([content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lettre-motivation-${nom}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      console.log("Aucune lettre de motivation disponible");
    }
  };

  // Récupérer les candidatures depuis l'API
  const {
    data: candidaturesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["candidatures"],
    queryFn: () => fetchData(`/api/recruteur/candidatures`),
  });

  const candidatures: Application[] = candidaturesData?.data || [];

  const filteredCandidatures = candidatures.filter(
    (candidature: Application) => {
      if (
        filters.status !== "all" &&
        candidature.column.name !== filters.status
      ) {
        return false;
      }
      if (filters.date) {
        const candidatureDate = new Date(candidature.createdAt);
        const filterDate = filters.date;
        if (
          candidatureDate.getDate() !== filterDate.getDate() ||
          candidatureDate.getMonth() !== filterDate.getMonth() ||
          candidatureDate.getFullYear() !== filterDate.getFullYear()
        ) {
          return false;
        }
      }
      if (filters.showFavorites && !candidature.candidat.favorite) {
        return false;
      }
      if (
        filters.offerId !== "all" &&
        candidature.jobOfferId.toString() !== filters.offerId
      ) {
        return false;
      }
      return true;
    }
  );

  // Obtenir la liste unique des statuts
  const uniqueStatuses = Array.from(
    new Set(candidatures.map((c: Application) => c.column.name))
  );

  // Obtenir la liste unique des offres
  const uniqueOffers = Array.from(
    new Set(
      candidatures.map((c: Application) => ({
        id: c.jobOfferId.toString(),
        title: (c as any).jobOffer?.title || `Offre ${c.jobOfferId}`,
      }))
    )
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          Erreur lors du chargement des candidatures
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex items-center gap-4">
        <Link href="/mesoffres">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Toutes les candidatures</h1>
      </div>

      <Card className="border bg-transparent shadow-none">
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
                <SelectTrigger className="border bg-transparent shadow-none">
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
                <SelectTrigger className="border bg-transparent shadow-none">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {uniqueStatuses.map((status, idx) => (
                    <SelectItem key={idx} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover modal>
                <PopoverTrigger
                  asChild
                  className="border bg-transparent shadow-none"
                >
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
                <PopoverContent className="w-auto p-0 border bg-gray-200 shadow-none">
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
          </div>
        </CardContent>
      </Card>

      <Card className="border bg-transparent shadow-none">
        <CardHeader>
          <CardTitle>Liste des candidatures</CardTitle>
          <CardDescription>
            Gérez toutes les candidatures reçues ({filteredCandidatures.length}{" "}
            candidature
            {filteredCandidatures.length > 1 ? "s" : ""})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCandidatures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune candidature trouvée
            </div>
          ) : (
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
                {filteredCandidatures.map((candidature: Application) => (
                  <TableRow key={candidature.id}>
                    <TableCell>
                      {(candidature as any).jobOffer?.title ||
                        `Offre ${candidature.jobOfferId}`}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {candidature.candidat.nom} {candidature.candidat.prenom}
                        {candidature.candidat.favorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{candidature.candidat.email}</TableCell>
                    <TableCell>{candidature.candidat.telephone}</TableCell>
                    <TableCell>
                      {format(new Date(candidature.createdAt), "dd/MM/yyyy", {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(candidature.column.name)}
                      >
                        {formatStatus(candidature.column.name)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewDetails(candidature)}
                          className="border bg-transparent shadow-none"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {candidature.candidat.cv && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleDownloadCV(candidature.candidat.cv)
                            }
                            className="border bg-transparent shadow-none"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
              Informations de {selectedCandidature?.candidat.nom}{" "}
              {selectedCandidature?.candidat.prenom}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Informations du candidat</span>
                  {selectedCandidature?.candidat.favorite && (
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Nom :</strong> {selectedCandidature?.candidat.nom}{" "}
                  {selectedCandidature?.candidat.prenom}
                </p>
                <p>
                  <strong>Email :</strong> {selectedCandidature?.candidat.email}
                </p>
                <p>
                  <strong>Téléphone :</strong>{" "}
                  {selectedCandidature?.candidat.telephone}
                </p>
                <p>
                  <strong>Date de candidature :</strong>{" "}
                  {selectedCandidature?.createdAt &&
                    format(
                      new Date(selectedCandidature.createdAt),
                      "dd/MM/yyyy à HH:mm",
                      { locale: fr }
                    )}
                </p>
                <p>
                  <strong>Statut :</strong>
                  <Badge
                    className={`ml-2 ${getStatusColor(
                      selectedCandidature?.column.name || ""
                    )}`}
                  >
                    {formatStatus(selectedCandidature?.column.name || "")}
                  </Badge>
                </p>
                {selectedCandidature?.candidat.bio && (
                  <p>
                    <strong>Bio :</strong> {selectedCandidature.candidat.bio}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCandidature?.candidat.cv && (
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
                        handleDownloadCV(selectedCandidature.candidat.cv)
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le CV
                    </Button>
                  </div>
                )}

                {selectedCandidature?.candidat.letterm && (
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
                          selectedCandidature.candidat.letterm,
                          `${selectedCandidature.candidat.nom} ${selectedCandidature.candidat.prenom}`
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger la lettre
                    </Button>
                  </div>
                )}

                {!selectedCandidature?.candidat.cv &&
                  !selectedCandidature?.candidat.letterm && (
                    <p className="text-muted-foreground">
                      Aucun document disponible
                    </p>
                  )}
              </CardContent>
            </Card>

            {selectedCandidature?.message && (
              <Card>
                <CardHeader>
                  <CardTitle>Message du candidat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">
                    {selectedCandidature.message}
                  </p>
                </CardContent>
              </Card>
            )}

            {selectedCandidature?.candidat.competences &&
              selectedCandidature.candidat.competences.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Compétences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidature.candidat.competences.map(
                        (competence, index) => (
                          <Badge key={index} variant="secondary">
                            {competence}
                          </Badge>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
