"use client";

import { use, useState } from "react";
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
import { ArrowLeft, Eye, Download, Star, StarOff, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/utils/utilts";
import { Application, Candidature } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Type pour les candidatures

// Données fictives pour les candidatures

// Fonction pour obtenir la couleur du badge selon le statut
const getStatusColor = (status: string) => {
  switch (status) {
    case "Nouvelles":
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
const formatStatus = (status: string) => {
  switch (status) {
    case "Nouvelles":
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

export default function CandidaturesTable({
  candidatdata,
  candidatdataLoding,
}: {
  candidatdata: Candidature[];
  candidatdataLoding: boolean;
}) {
  const [selectedCandidature, setSelectedCandidature] =
    useState<Candidature | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const handleViewDetails = (candidature: Candidature) => {
    setSelectedCandidature(candidature);
  };

  const handleDownloadCV = (cvPath: string) => {
    // Ici, vous implémenteriez la logique de téléchargement
    console.log("Téléchargement du CV:", cvPath);

    window.open(cvPath, "_blank");
  };

  const handleDownloadLettreMotivation = (cvPath: string, nom: string) => {
    console.log("LettreMotivation", cvPath);

    window.open(cvPath, "_blank");
  };

  const sortedCandidatures = candidatdata
    ? [...candidatdata].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "newest"
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      })
    : [];

  if (candidatdataLoding) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className=" space-y-6 w-full overflow-y-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Liste des candidatures</CardTitle>
          <CardDescription>
            Gérez les candidatures reçues pour cette offre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="newest"
            onValueChange={(value) =>
              setSortOrder(value as "newest" | "oldest")
            }
          >
            <TabsList className="mb-4">
              <TabsTrigger value="newest">Plus récentes</TabsTrigger>
              <TabsTrigger value="oldest">Plus anciennes</TabsTrigger>
            </TabsList>
            <TabsContent value="newest">
              {sortedCandidatures?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCandidatures.map((candidature: Candidature) => (
                      <TableRow key={candidature.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {candidature.candidat.nom}
                          </div>
                        </TableCell>
                        <TableCell>{candidature.candidat.email}</TableCell>
                        <TableCell>{candidature.candidat.telephone}</TableCell>
                        <TableCell>{candidature.createdAt}</TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(
                              candidature.column.name.toString()
                            )}
                          >
                            {formatStatus(candidature.column.name)}
                          </Badge>
                          {/* s */}
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
                              onClick={() =>
                                handleDownloadCV(candidature.candidat.cv)
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center">
                  <span>Pas de postulant pour le moment</span>
                </div>
              )}
            </TabsContent>
            <TabsContent value="oldest">
              {sortedCandidatures?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCandidatures.map((candidature: Candidature) => (
                      <TableRow key={candidature.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {candidature.candidat.nom}
                          </div>
                        </TableCell>
                        <TableCell>{candidature.candidat.email}</TableCell>
                        <TableCell>{candidature.candidat.telephone}</TableCell>
                        <TableCell>{candidature.createdAt}</TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(
                              candidature.column.name.toString()
                            )}
                          >
                            {formatStatus(candidature.column.name)}
                          </Badge>
                          {/* s */}
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
                              onClick={() =>
                                handleDownloadCV(candidature.candidat.cv)
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center">
                  <span>Pas de postulant pour le moment</span>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
              Informations de {selectedCandidature?.candidat.nom}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Informations du candidat</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Nom :</strong> {selectedCandidature?.candidat?.nom}
                </p>
                <p>
                  <strong>Email :</strong> {selectedCandidature?.email}
                </p>
                <p>
                  <strong>Téléphone :</strong>{" "}
                  {selectedCandidature?.candidat.telephone}
                </p>
                <p>
                  <strong>Date de candidature :</strong>{" "}
                  {selectedCandidature?.createdAt}
                </p>
                <p>
                  <strong>Statut :</strong>
                  {/* <Badge
                    className={`ml-2 ${getStatusColor(
                      selectedCandidature?.status || "nouvelle"
                    )}`}
                  >
                    {formatStatus(selectedCandidature?.status || "nouvelle")}
                  </Badge> */}
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
                        selectedCandidature?.candidat.letterm || "",
                        selectedCandidature?.candidat.letterm || ""
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
                  {selectedCandidature?.candidat.letterm}
                </p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
