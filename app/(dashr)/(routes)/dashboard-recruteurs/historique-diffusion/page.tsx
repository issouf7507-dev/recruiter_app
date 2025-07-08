"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

type DiffusionHistory = {
  id: string;
  jobOfferId: number;
  jobOfferTitle: string;
  jobOfferCompany: string;
  platforms: string[];
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  results: {
    platform: string;
    success: boolean;
    message: string;
    url?: string;
  }[];
  createdAt: string;
};

export default function HistoriqueDiffusionPage() {
  const [history, setHistory] = useState<DiffusionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiffusion, setSelectedDiffusion] =
    useState<DiffusionHistory | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      // Pour l'instant, on simule des données d'historique
      // Plus tard, vous pourriez créer une API pour récupérer l'historique réel
      const mockHistory: DiffusionHistory[] = [
        {
          id: "1",
          jobOfferId: 1,
          jobOfferTitle: "Développeur Full Stack",
          jobOfferCompany: "TechCorp",
          platforms: ["linkedin", "indeed"],
          status: "SUCCESS",
          results: [
            {
              platform: "linkedin",
              success: true,
              message: "Offre publiée avec succès sur LinkedIn",
              url: "https://www.linkedin.com/jobs/view/123456",
            },
            {
              platform: "indeed",
              success: true,
              message: "Offre publiée avec succès sur Indeed",
              url: "https://www.indeed.com/viewjob?jk=789012",
            },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          jobOfferId: 2,
          jobOfferTitle: "Data Scientist",
          jobOfferCompany: "DataCorp",
          platforms: ["linkedin", "apec"],
          status: "PARTIAL",
          results: [
            {
              platform: "linkedin",
              success: true,
              message: "Offre publiée avec succès sur LinkedIn",
              url: "https://www.linkedin.com/jobs/view/345678",
            },
            {
              platform: "apec",
              success: false,
              message: "Erreur lors de la publication sur APEC",
            },
          ],
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 jour ago
        },
      ];

      setHistory(mockHistory);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      toast.error("Impossible de charger l'historique");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PARTIAL":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge variant="default" className="bg-green-500">
            Succès
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            Partiel
          </Badge>
        );
      case "FAILED":
        return <Badge variant="destructive">Échec</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getPlatformName = (platformId: string) => {
    const platformNames: Record<string, string> = {
      linkedin: "LinkedIn",
      indeed: "Indeed",
      apec: "APEC",
      poleEmploi: "Pôle Emploi",
    };
    return platformNames[platformId] || platformId;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Historique des diffusions</h1>
          <p className="text-muted-foreground">
            Suivez l'historique de vos publications sur les plateformes
          </p>
        </div>
        <Button onClick={loadHistory} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total des diffusions
                </p>
                <p className="text-2xl font-bold">{history.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Succès
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {history.filter((h) => h.status === "SUCCESS").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Partiels
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {history.filter((h) => h.status === "PARTIAL").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Échecs
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {history.filter((h) => h.status === "FAILED").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau d'historique */}
      <Card>
        <CardHeader>
          <CardTitle>Historique détaillé</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offre</TableHead>
                <TableHead>Plateformes</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((diffusion) => (
                <TableRow key={diffusion.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{diffusion.jobOfferTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {diffusion.jobOfferCompany}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {diffusion.platforms.map((platform) => (
                        <Badge
                          key={platform}
                          variant="outline"
                          className="text-xs"
                        >
                          {getPlatformName(platform)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(diffusion.status)}
                      {getStatusBadge(diffusion.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(diffusion.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDiffusion(diffusion);
                        setShowDetailsDialog(true);
                      }}
                    >
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de détails */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la diffusion</DialogTitle>
          </DialogHeader>

          {selectedDiffusion && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedDiffusion.jobOfferTitle}
                </h3>
                <p className="text-muted-foreground">
                  {selectedDiffusion.jobOfferCompany}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusIcon(selectedDiffusion.status)}
                  {getStatusBadge(selectedDiffusion.status)}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Résultats par plateforme</h4>
                <div className="space-y-3">
                  {selectedDiffusion.results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.success
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {getPlatformName(result.platform)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {result.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          {result.url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(result.url, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowDetailsDialog(false)}>
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
