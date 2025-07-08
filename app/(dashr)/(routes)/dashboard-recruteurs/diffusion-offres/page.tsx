"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  Linkedin,
  Globe,
  Share2,
  Copy,
  Check,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

type JobOffer = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  experience: string;
  skills: string;
  etat: string;
  createdAt: string;
  applications: any[];
};

type Platform = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  url: string;
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
};

export default function DiffusionOffresPage() {
  const [offres, setOffres] = useState<JobOffer[]>([]);
  const [selectedOffre, setSelectedOffre] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDiffusionDialog, setShowDiffusionDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      color: "bg-blue-600",
      url: "https://www.linkedin.com/jobs/",
      enabled: false,
    },
    {
      id: "indeed",
      name: "Indeed",
      icon: <Globe className="h-5 w-5" />,
      color: "bg-blue-500",
      url: "https://www.indeed.com/",
      enabled: false,
    },
    {
      id: "apec",
      name: "APEC",
      icon: <Globe className="h-5 w-5" />,
      color: "bg-orange-500",
      url: "https://www.apec.fr/",
      enabled: false,
    },
    {
      id: "pole-emploi",
      name: "Pôle Emploi",
      icon: <Globe className="h-5 w-5" />,
      color: "bg-green-600",
      url: "https://www.pole-emploi.fr/",
      enabled: false,
    },
  ]);

  const [diffusionSettings, setDiffusionSettings] = useState({
    autoPublish: false,
    scheduleDate: "",
    scheduleTime: "",
    customMessage: "",
    includeSalary: true,
    includeBenefits: true,
  });

  useEffect(() => {
    loadOffres();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platformId: string) => {
    setPlatforms((prev) =>
      prev.map((platform) =>
        platform.id === platformId
          ? { ...platform, enabled: !platform.enabled }
          : platform
      )
    );
  };

  const generateDiffusionUrl = (offre: JobOffer, platform: Platform) => {
    const baseUrl = platform.url;
    const params = new URLSearchParams({
      title: offre.title,
      company: offre.company,
      location: offre.location,
      description: offre.description.substring(0, 500),
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(text);
      toast.success("Lien copié dans le presse-papiers");
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast.error("Impossible de copier le lien");
    }
  };

  const openPlatform = (url: string) => {
    window.open(url, "_blank");
  };

  const handleDiffusion = async () => {
    if (!selectedOffre) return;

    const enabledPlatforms = platforms.filter((p) => p.enabled);
    if (enabledPlatforms.length === 0) {
      toast.error("Veuillez sélectionner au moins une plateforme");
      return;
    }

    try {
      const response = await fetch("/api/recruteur/diffusion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offreId: selectedOffre.id,
          platforms: enabledPlatforms,
          settings: diffusionSettings,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Afficher les résultats
        data.data.results.forEach((result: any) => {
          if (result.success) {
            toast.success(result.message);
          } else {
            toast.error(result.message);
          }
        });
      } else {
        toast.error("Erreur lors de la diffusion");
      }
    } catch (error) {
      console.error("Erreur lors de la diffusion:", error);
      toast.error("Erreur lors de la diffusion");
    }

    setShowDiffusionDialog(false);
  };

  const generateOffreContent = (offre: JobOffer) => {
    return `
${offre.title}

${offre.company} - ${offre.location}
Type de contrat: ${offre.type}
Expérience: ${offre.experience}

${offre.description}

Responsabilités:
${offre.responsibilities}

Exigences:
${offre.requirements}

Compétences:
${offre.skills}

${
  diffusionSettings.includeSalary
    ? `Salaire: ${offre.salaryMin}-${offre.salaryMax} ${offre.salaryCurrency}`
    : ""
}

${
  diffusionSettings.customMessage
    ? `\nMessage personnalisé:\n${diffusionSettings.customMessage}`
    : ""
}
    `.trim();
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
          <h1 className="text-2xl font-bold">Diffusion des offres</h1>
          <p className="text-muted-foreground">
            Publiez vos offres sur LinkedIn, Indeed et d'autres plateformes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Configuration des plateformes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Plateformes de diffusion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  platform.enabled
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/50"
                }`}
                onClick={() => togglePlatform(platform.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${platform.color} text-white`}
                  >
                    {platform.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{platform.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {platform.enabled ? "Activée" : "Désactivée"}
                    </p>
                  </div>
                  <Switch checked={platform.enabled} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste des offres */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Vos offres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offres.map((offre) => (
            <Card key={offre.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{offre.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {offre.company}
                    </p>
                  </div>
                  <Badge
                    variant={offre.etat === "active" ? "default" : "secondary"}
                  >
                    {offre.etat === "active" ? "Active" : "Fermée"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>{offre.location}</span>
                    <Badge variant="outline">{offre.type}</Badge>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium">
                        {offre.applications?.length || 0} candidatures
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedOffre(offre);
                        setShowDiffusionDialog(true);
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Diffuser
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog de diffusion */}
      <Dialog open={showDiffusionDialog} onOpenChange={setShowDiffusionDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Diffuser l'offre</DialogTitle>
            <DialogDescription>
              Publiez votre offre sur les plateformes sélectionnées
            </DialogDescription>
          </DialogHeader>

          {selectedOffre && (
            <div className="space-y-6">
              {/* Aperçu de l'offre */}
              <div className="space-y-4">
                <h3 className="font-medium">Aperçu de l'offre</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{selectedOffre.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedOffre.company} - {selectedOffre.location}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline">{selectedOffre.type}</Badge>
                        <Badge variant="outline">
                          {selectedOffre.experience}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Plateformes sélectionnées */}
              <div className="space-y-4">
                <h3 className="font-medium">Plateformes sélectionnées</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platforms
                    .filter((p) => p.enabled)
                    .map((platform) => {
                      const url = generateDiffusionUrl(selectedOffre, platform);
                      return (
                        <Card key={platform.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${platform.color} text-white`}
                                >
                                  {platform.icon}
                                </div>
                                <div>
                                  <h4 className="font-medium">
                                    {platform.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Prêt à publier
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(url)}
                                >
                                  {copiedUrl === url ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openPlatform(url)}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>

              {/* Contenu généré */}
              <div className="space-y-4">
                <h3 className="font-medium">Contenu généré</h3>
                <Textarea
                  value={generateOffreContent(selectedOffre)}
                  readOnly
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDiffusionDialog(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleDiffusion}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Publier maintenant
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog des paramètres */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paramètres de diffusion</DialogTitle>
            <DialogDescription>
              Configurez vos préférences de diffusion
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Publication automatique</Label>
              <Switch
                checked={diffusionSettings.autoPublish}
                onCheckedChange={(checked) =>
                  setDiffusionSettings((prev) => ({
                    ...prev,
                    autoPublish: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Afficher le salaire</Label>
              <Switch
                checked={diffusionSettings.includeSalary}
                onCheckedChange={(checked) =>
                  setDiffusionSettings((prev) => ({
                    ...prev,
                    includeSalary: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Afficher les avantages</Label>
              <Switch
                checked={diffusionSettings.includeBenefits}
                onCheckedChange={(checked) =>
                  setDiffusionSettings((prev) => ({
                    ...prev,
                    includeBenefits: checked,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Message personnalisé</Label>
              <Textarea
                placeholder="Ajoutez un message personnalisé à vos offres..."
                value={diffusionSettings.customMessage}
                onChange={(e) =>
                  setDiffusionSettings((prev) => ({
                    ...prev,
                    customMessage: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de publication</Label>
                <Input
                  type="date"
                  value={diffusionSettings.scheduleDate}
                  onChange={(e) =>
                    setDiffusionSettings((prev) => ({
                      ...prev,
                      scheduleDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Heure de publication</Label>
                <Input
                  type="time"
                  value={diffusionSettings.scheduleTime}
                  onChange={(e) =>
                    setDiffusionSettings((prev) => ({
                      ...prev,
                      scheduleTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
