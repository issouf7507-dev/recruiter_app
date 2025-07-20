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
import LinkedInPreview from "@/app/components/LinkedInPreview";

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
  authenticated: boolean;
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
      authenticated: false,
    },
    {
      id: "indeed",
      name: "Indeed",
      icon: <Globe className="h-5 w-5" />,
      color: "bg-blue-500",
      url: "https://www.indeed.com/",
      enabled: false,
      authenticated: false,
    },
    {
      id: "apec",
      name: "APEC",
      icon: <Globe className="h-5 w-5" />,
      color: "bg-orange-500",
      url: "https://www.apec.fr/",
      enabled: false,
      authenticated: false,
    },
    {
      id: "pole-emploi",
      name: "Pôle Emploi",
      icon: <Globe className="h-5 w-5" />,
      color: "bg-green-600",
      url: "https://www.pole-emploi.fr/",
      enabled: false,
      authenticated: false,
    },
  ]);

  const [diffusionSettings, setDiffusionSettings] = useState({
    autoPublish: false,
    scheduleDate: "",
    scheduleTime: "",
    customMessage: "",
    includeSalary: true,
    includeBenefits: true,
    visibility: "PUBLIC" as "PUBLIC" | "CONNECTIONS",
  });

  const [linkedinAuthStatus, setLinkedinAuthStatus] = useState<{
    isAuthenticated: boolean;
    isLoading: boolean;
    error?: string;
  }>({
    isAuthenticated: false,
    isLoading: false,
  });

  const [linkedinCallbackProcessed, setLinkedinCallbackProcessed] =
    useState(false);

  useEffect(() => {
    loadOffres();
    checkLinkedInAuth();
    handleLinkedInCallback();
  }, []);

  // Gérer le callback LinkedIn
  const handleLinkedInCallback = () => {
    // Éviter de traiter le callback plusieurs fois
    if (linkedinCallbackProcessed) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const linkedinCode = urlParams.get("linkedin_code");
    const error = urlParams.get("error");
    const message = urlParams.get("message");

    if (error) {
      toast.error(`Erreur LinkedIn: ${message || error}`);
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setLinkedinCallbackProcessed(true);
      return;
    }

    if (linkedinCode) {
      console.log("Traitement du callback LinkedIn...");
      setLinkedinCallbackProcessed(true);
      // Échanger le code contre un token
      exchangeLinkedInCode(linkedinCode);
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const exchangeLinkedInCode = async (code: string) => {
    try {
      console.log("Début de l'échange du code LinkedIn...");
      setLinkedinAuthStatus((prev) => ({ ...prev, isLoading: true }));

      const response = await fetch("/api/auth/linkedin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Authentification LinkedIn réussie:", data);

        // Sauvegarder le statut dans le localStorage
        localStorage.setItem("linkedin_authenticated", "true");

        setLinkedinAuthStatus({
          isAuthenticated: true,
          isLoading: false,
        });
        toast.success("Connexion LinkedIn réussie !");

        // Mettre à jour le statut de la plateforme LinkedIn et l'activer automatiquement
        setPlatforms((prev) =>
          prev.map((platform) =>
            platform.id === "linkedin"
              ? { ...platform, authenticated: true, enabled: true }
              : platform
          )
        );
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'authentification");
      }
    } catch (error) {
      console.error("Erreur lors de l'échange du code LinkedIn:", error);
      setLinkedinAuthStatus({
        isAuthenticated: false,
        isLoading: false,
        error: "Erreur lors de l'authentification LinkedIn",
      });
      toast.error("Erreur lors de l'authentification LinkedIn");
      // Réinitialiser le flag pour permettre une nouvelle tentative
      setLinkedinCallbackProcessed(false);
    }
  };

  // Vérifier l'authentification LinkedIn au chargement
  const checkLinkedInAuth = async () => {
    try {
      setLinkedinAuthStatus((prev) => ({ ...prev, isLoading: true }));

      // Vérifier s'il y a un code LinkedIn dans l'URL (authentification en cours)
      const urlParams = new URLSearchParams(window.location.search);
      const linkedinCode = urlParams.get("linkedin_code");

      if (linkedinCode) {
        // Si il y a un code, ne pas remettre à false
        console.log("Code LinkedIn détecté, authentification en cours...");
        setLinkedinAuthStatus((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Vérifier le statut depuis l'API
      const response = await fetch("/api/auth/linkedin/status");
      if (response.ok) {
        const data = await response.json();
        console.log("Statut LinkedIn depuis l'API:", data);

        // Vérifier aussi le localStorage comme fallback
        const localStatus = localStorage.getItem("linkedin_authenticated");
        const isAuthenticated = data.isAuthenticated || localStatus === "true";

        setLinkedinAuthStatus({
          isAuthenticated,
          isLoading: false,
        });

        // Mettre à jour les plateformes si authentifié
        if (isAuthenticated) {
          setPlatforms((prev) =>
            prev.map((platform) =>
              platform.id === "linkedin"
                ? { ...platform, authenticated: true, enabled: true }
                : platform
            )
          );
        }
      } else {
        // Fallback vers localStorage
        const localStatus = localStorage.getItem("linkedin_authenticated");
        setLinkedinAuthStatus({
          isAuthenticated: localStatus === "true",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la vérification LinkedIn:", error);
      // Fallback vers localStorage
      const localStatus = localStorage.getItem("linkedin_authenticated");
      setLinkedinAuthStatus({
        isAuthenticated: localStatus === "true",
        isLoading: false,
        error: "Erreur lors de la vérification de l'authentification",
      });
    }
  };

  const loadOffres = async () => {
    try {
      const response = await fetch("/api/recruteur/offres");
      if (response.ok) {
        const data = await response.json();
        console.log("data.data", data.data);
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
    if (platformId === "linkedin") {
      if (!linkedinAuthStatus.isAuthenticated) {
        // Si LinkedIn n'est pas authentifié, lancer l'authentification
        handleLinkedInAuth();
      } else {
        // Si LinkedIn est authentifié, proposer de se déconnecter
        if (window.confirm("Voulez-vous vous déconnecter de LinkedIn ?")) {
          handleLinkedInLogout();
        }
      }
      return;
    }

    setPlatforms((prev) =>
      prev.map((platform) =>
        platform.id === platformId
          ? { ...platform, enabled: !platform.enabled }
          : platform
      )
    );
  };

  const handleLinkedInAuth = async () => {
    try {
      setLinkedinAuthStatus((prev) => ({ ...prev, isLoading: true }));

      const response = await fetch("/api/auth/linkedin");
      if (response.ok) {
        const data = await response.json();
        // Rediriger vers LinkedIn pour l'authentification
        window.location.href = data.authUrl;
      } else {
        throw new Error("Impossible de générer l'URL d'authentification");
      }
    } catch (error) {
      setLinkedinAuthStatus({
        isAuthenticated: false,
        isLoading: false,
        error: "Erreur lors de l'authentification LinkedIn",
      });
      toast.error("Erreur lors de l'authentification LinkedIn");
    }
  };

  const handleLinkedInLogout = async () => {
    try {
      setLinkedinAuthStatus((prev) => ({ ...prev, isLoading: true }));

      // Appeler l'API de déconnexion LinkedIn
      const response = await fetch("/api/auth/linkedin/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Nettoyer le localStorage
        localStorage.removeItem("linkedin_authenticated");

        // Mettre à jour le statut local
        setLinkedinAuthStatus({
          isAuthenticated: false,
          isLoading: false,
        });

        // Mettre à jour le statut de la plateforme LinkedIn
        setPlatforms((prev) =>
          prev.map((platform) =>
            platform.id === "linkedin"
              ? { ...platform, authenticated: false, enabled: false }
              : platform
          )
        );

        toast.success("Déconnexion LinkedIn réussie !");
      } else {
        throw new Error("Erreur lors de la déconnexion");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion LinkedIn:", error);
      setLinkedinAuthStatus({
        isAuthenticated: false,
        isLoading: false,
        error: "Erreur lors de la déconnexion LinkedIn",
      });
      toast.error("Erreur lors de la déconnexion LinkedIn");
    }
  };

  const generateDiffusionUrl = (offre: JobOffer, platform: Platform) => {
    const baseUrl = platform.url;
    const params = new URLSearchParams({
      title: offre.title,
      company: offre.company,
      location: offre.location,
      description: offre.description,
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
      // Traiter chaque plateforme séparément
      for (const platform of enabledPlatforms) {
        if (platform.id === "linkedin") {
          await handleLinkedInDiffusion();
        } else {
          // Pour les autres plateformes, utiliser l'ancienne méthode
          await handleGenericDiffusion(platform);
        }
      }

      toast.success("Diffusion terminée");
    } catch (error) {
      console.error("Erreur lors de la diffusion:", error);
      toast.error("Erreur lors de la diffusion");
    }

    setShowDiffusionDialog(false);
  };

  const handleLinkedInDiffusion = async () => {
    if (!selectedOffre) return;

    try {
      const response = await fetch("/api/recruteur/diffusion/linkedin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offreId: selectedOffre.id,
          customMessage: diffusionSettings.customMessage,
          includeSalary: diffusionSettings.includeSalary,
          visibility: "PUBLIC",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);

        // Ouvrir le post LinkedIn dans un nouvel onglet
        if (data.data?.url) {
          window.open(data.data.url, "_blank");
        }
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || "Erreur lors de la publication sur LinkedIn"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la diffusion LinkedIn:", error);
      toast.error("Erreur lors de la publication sur LinkedIn");
    }
  };

  const handleGenericDiffusion = async (platform: Platform) => {
    if (!selectedOffre) return;

    try {
      const response = await fetch("/api/recruteur/diffusion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offreId: selectedOffre.id,
          platforms: [platform],
          settings: diffusionSettings,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        data.data.results.forEach((result: any) => {
          if (result.success) {
            toast.success(`${platform.name}: ${result.message}`);
          } else {
            toast.error(`${platform.name}: ${result.message}`);
          }
        });
      } else {
        toast.error(`Erreur lors de la diffusion sur ${platform.name}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la diffusion sur ${platform.name}:`, error);
      toast.error(`Erreur lors de la diffusion sur ${platform.name}`);
    }
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
                      {platform.id === "linkedin"
                        ? linkedinAuthStatus.isLoading
                          ? "Vérification..."
                          : linkedinAuthStatus.isAuthenticated
                          ? "Connecté"
                          : "Non connecté"
                        : platform.enabled
                        ? "Activée"
                        : "Désactivée"}
                    </p>
                    {platform.id === "linkedin" && (
                      <p className="text-xs mt-1">
                        {linkedinAuthStatus.isAuthenticated ? (
                          <span className="text-green-600">
                            ✅ Cliquez pour vous déconnecter
                          </span>
                        ) : (
                          <span className="text-orange-600">
                            Cliquez pour vous connecter
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={platform.enabled}
                    disabled={
                      platform.id === "linkedin" &&
                      !linkedinAuthStatus.isAuthenticated
                    }
                  />
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
                        {offre.applications?.length || 0}
                        candidatures
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

              {/* Aperçu LinkedIn */}
              {platforms.some((p) => p.id === "linkedin" && p.enabled) &&
                selectedOffre && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Aperçu LinkedIn</h3>
                    <LinkedInPreview
                      offre={selectedOffre}
                      customMessage={diffusionSettings.customMessage}
                      includeSalary={diffusionSettings.includeSalary}
                      visibility={diffusionSettings.visibility}
                    />
                  </div>
                )}

              {/* Contenu généré pour les autres plateformes */}
              {platforms.some((p) => p.id !== "linkedin" && p.enabled) && (
                <div className="space-y-4">
                  <h3 className="font-medium">Contenu généré</h3>
                  <Textarea
                    value={generateOffreContent(selectedOffre)}
                    readOnly
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
              )}

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

          <div className="space-y-6">
            {/* Section LinkedIn */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Paramètres LinkedIn</h3>
              </div>

              {linkedinAuthStatus.isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Visibilité du post</Label>
                    <Select
                      value={diffusionSettings.visibility || "PUBLIC"}
                      onValueChange={(value) =>
                        setDiffusionSettings((prev) => ({
                          ...prev,
                          visibility: value as "PUBLIC" | "CONNECTIONS",
                        }))
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="CONNECTIONS">
                          Connexions uniquement
                        </SelectItem>
                      </SelectContent>
                    </Select>
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

                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLinkedInLogout}
                      className="w-full"
                    >
                      Se déconnecter de LinkedIn
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    Connectez-vous à LinkedIn pour configurer les paramètres de
                    diffusion.
                  </p>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setShowSettingsDialog(false);
                      handleLinkedInAuth();
                    }}
                  >
                    Se connecter à LinkedIn
                  </Button>
                </div>
              )}
            </div>

            {/* Section générale */}
            <div className="space-y-4">
              <h3 className="font-medium">Paramètres généraux</h3>

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
