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
  MessageCircle,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchData, patchData } from "@/utils/utilts";
import { Application } from "@/types/types";
import { toast } from "sonner";
import InitiateChatModal from "@/app/components/InitiateChatModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

export default function CandidaturesFavorisPage() {
  const queryClient = useQueryClient();
  const [selectedCandidature, setSelectedCandidature] =
    useState<Application | null>(null);
  const [selectedCandidatForChat, setSelectedCandidatForChat] = useState<{
    candidat: any;
    jobOffer: any;
  } | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

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

  const handleInitiateChat = (candidature: Application) => {
    setSelectedCandidatForChat({
      candidat: {
        id: candidature.candidat.id,
        name: `${candidature.candidat.prenom || ""} ${
          candidature.candidat.nom || ""
        }`.trim(),
        email: candidature.candidat.email,
      },
      jobOffer: {
        id: candidature.jobOfferId,
        title: `Offre ${candidature.jobOfferId}`,
        company: "Votre entreprise",
      },
    });
    setIsChatModalOpen(true);
  };

  // Mutation pour basculer le statut favori
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({
      applicationId,
      favorite,
    }: {
      applicationId: string;
      favorite: boolean;
    }) => {
      return patchData(
        { favorite },
        `/api/recruteur/candidatures/${applicationId}/favorite`
      );
    },
    onSuccess: (data, variables) => {
      // Mettre à jour le cache des candidatures
      queryClient.setQueryData(["candidatures"], (oldData: any) => {
        if (!oldData?.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((candidature: Application) => {
            if (candidature.id === variables.applicationId) {
              return {
                ...candidature,
                favorite: variables.favorite,
              };
            }
            return candidature;
          }),
        };
      });

      toast.success(data.message);
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du favori");
    },
  });

  const handleToggleFavorite = (
    applicationId: string,
    currentFavorite: boolean
  ) => {
    toggleFavoriteMutation.mutate({
      applicationId,
      favorite: !currentFavorite,
    });
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

  // Filtrer uniquement les candidatures favoris
  const favorisCandidatures = candidatures.filter(
    (candidature: Application) => candidature.favorite === true
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
      <div className="p-6 w-full overflow-y-auto">
        <div className="text-center text-red-500">
          Erreur lors du chargement des candidatures
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard-recruteurs/candidatures">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Candidats favoris</h1>
      </div>

      <Card className="border bg-transparent shadow-none">
        <CardHeader>
          <CardTitle>Liste des candidats favoris</CardTitle>
          <CardDescription>
            Gérez vos candidats favoris ({favorisCandidatures.length} candidat
            {favorisCandidatures.length > 1 ? "s" : ""})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {favorisCandidatures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun candidat favori trouvé
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
                {favorisCandidatures.map((candidature: Application) => (
                  <TableRow key={candidature.id}>
                    <TableCell>
                      {(candidature as any).jobOffer?.title ||
                        `Offre ${candidature.jobOfferId}`}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {candidature.candidat.nom} {candidature.candidat.prenom}
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
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
                          onClick={() =>
                            handleToggleFavorite(
                              candidature.id,
                              candidature.favorite || false
                            )
                          }
                          className="border bg-transparent shadow-none"
                          disabled={toggleFavoriteMutation.isPending}
                        >
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewDetails(candidature)}
                          className="border bg-transparent shadow-none"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleInitiateChat(candidature)}
                          className="border bg-transparent shadow-none"
                        >
                          <MessageCircle className="h-4 w-4" />
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      selectedCandidature &&
                      handleToggleFavorite(
                        selectedCandidature.id,
                        selectedCandidature.favorite || false
                      )
                    }
                    disabled={toggleFavoriteMutation.isPending}
                  >
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </Button>
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

      {/* Modal de chat */}
      {selectedCandidatForChat && (
        <InitiateChatModal
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedCandidatForChat(null);
          }}
          candidat={selectedCandidatForChat.candidat}
          jobOffer={selectedCandidatForChat.jobOffer}
          onSuccess={(conversationId) => {
            toast.success("Conversation initiée avec succès !");
          }}
        />
      )}
    </div>
  );
}
