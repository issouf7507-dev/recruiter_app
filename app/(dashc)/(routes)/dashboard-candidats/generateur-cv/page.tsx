"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Download,
  Eye,
  Save,
  Plus,
  Edit,
  Trash2,
  Copy,
  Settings,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Heart,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { cleanCVDataForAPI, validateCVData } from "@/lib/cv-utils";

// Import des composants du générateur de CV
import CVPersonalInfoForm from "@/components/cv/CVPersonalInfoForm";
import CVExperienceForm from "@/components/cv/CVExperienceForm";
import CVEducationForm from "@/components/cv/CVEducationForm";
import CVSkillsForm from "@/components/cv/CVSkillsForm";
import CVLanguagesForm from "@/components/cv/CVLanguagesForm";
import CVInterestsForm from "@/components/cv/CVInterestsForm";
import CVPreview from "@/components/cv/CVPreview";
import CVTemplateSelector from "@/components/cv/CVTemplateSelector";

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  personalInfo?: any;
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  languages?: any[];
  interests?: any[];
  customSections?: any[];
}

interface CVTemplate {
  id: string;
  name: string;
  description?: string;
  layout: string;
  colors?: any;
  fonts?: any;
}

export default function GenerateurCVPage() {
  const { data: session, isPending } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [cvData, setCvData] = useState<CVData>({
    title: "Mon CV",
    templateId: "",
  });
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [existingCVs, setExistingCVs] = useState<CVData[]>([]);
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const steps = [
    { id: "template", label: "Modèle", icon: Settings },
    { id: "personal", label: "Informations personnelles", icon: User },
    { id: "experience", label: "Expériences", icon: Briefcase },
    { id: "education", label: "Formation", icon: GraduationCap },
    { id: "skills", label: "Compétences", icon: Award },
    { id: "languages", label: "Langues", icon: Globe },
    { id: "interests", label: "Centres d'intérêt", icon: Heart },
  ];

  // Calculer le pourcentage de completion
  const getCompletionPercentage = () => {
    let completed = 0;
    const total = steps.length;

    if (cvData.templateId) completed++;
    if (cvData.personalInfo?.firstName && cvData.personalInfo?.lastName)
      completed++;
    if (cvData.experiences && cvData.experiences.length > 0) completed++;
    if (cvData.educations && cvData.educations.length > 0) completed++;
    if (cvData.skills && cvData.skills.length > 0) completed++;
    if (cvData.languages && cvData.languages.length > 0) completed++;
    if (cvData.interests && cvData.interests.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  // Charger les templates et CVs existants
  useEffect(() => {
    if (session?.user) {
      loadTemplates();
      loadExistingCVs();
    }
  }, [session]);

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/candidat/cv/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        // Sélectionner le premier template par défaut
        if (data.length > 0 && !cvData.templateId) {
          setCvData((prev) => ({ ...prev, templateId: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des templates:", error);
    }
  };

  const loadExistingCVs = async () => {
    try {
      const response = await fetch("/api/candidat/cv");
      if (response.ok) {
        const data = await response.json();
        setExistingCVs(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des CVs:", error);
    }
  };

  const loadCV = async (cvId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/candidat/cv/${cvId}`);
      if (response.ok) {
        const data = await response.json();
        setCvData(data);
        setSelectedCVId(cvId);
        toast.success("CV chargé avec succès");
      }
    } catch (error) {
      console.error("Erreur lors du chargement du CV:", error);
      toast.error("Erreur lors du chargement du CV");
    } finally {
      setIsLoading(false);
    }
  };

  const saveCV = async () => {
    // Valider les données avant sauvegarde
    const validation = validateCVData(cvData);
    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    setIsSaving(true);
    try {
      const url = selectedCVId
        ? `/api/candidat/cv/${selectedCVId}`
        : "/api/candidat/cv";
      const method = selectedCVId ? "PUT" : "POST";

      // Nettoyer les données avant envoi
      const cleanedData = cleanCVDataForAPI(cvData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      if (response.ok) {
        const savedCV = await response.json();
        if (!selectedCVId) {
          setSelectedCVId(savedCV.id);
          setExistingCVs((prev) => [...prev, savedCV]);
        } else {
          setExistingCVs((prev) =>
            prev.map((cv) => (cv.id === savedCV.id ? savedCV : cv))
          );
        }
        toast.success("CV sauvegardé avec succès");
      } else {
        throw new Error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde du CV");
    } finally {
      setIsSaving(false);
    }
  };

  const exportToPDF = async () => {
    if (!selectedCVId) {
      toast.error("Veuillez d'abord sauvegarder votre CV");
      return;
    }

    try {
      const response = await fetch(`/api/candidat/cv/${selectedCVId}/export`, {
        method: "POST",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${cvData.title || "CV"}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("CV exporté en PDF");
      } else {
        throw new Error("Erreur lors de l'export");
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Erreur lors de l'export PDF");
    }
  };

  const createNewCV = () => {
    setCvData({
      title: "Nouveau CV",
      templateId: templates.length > 0 ? templates[0].id : "",
    });
    setSelectedCVId(null);
    setCurrentStep(0);
    toast.success("Nouveau CV créé");
  };

  const duplicateCV = async (cvId: string) => {
    try {
      const response = await fetch(`/api/candidat/cv/${cvId}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        const duplicatedCV = await response.json();
        setExistingCVs((prev) => [...prev, duplicatedCV]);
        toast.success("CV dupliqué avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
      toast.error("Erreur lors de la duplication du CV");
    }
  };

  const deleteCV = async (cvId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce CV ?")) {
      try {
        const response = await fetch(`/api/candidat/cv/${cvId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setExistingCVs((prev) => prev.filter((cv) => cv.id !== cvId));
          if (selectedCVId === cvId) {
            setSelectedCVId(null);
            createNewCV();
          }
          toast.success("CV supprimé avec succès");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression du CV");
      }
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className=" mx-auto p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Générateur de CV
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Créez un CV professionnel en quelques étapes
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showPreview ? "default" : "outline"}
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 ${
                showPreview
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-blue-300 text-blue-600 hover:bg-blue-50"
              }`}
            >
              <Eye className="h-4 w-4" />
              {showPreview ? "Masquer l'aperçu" : "Voir l'aperçu"}
            </Button>
            <Button
              onClick={saveCV}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Sauvegarder
            </Button>
            <Button
              onClick={exportToPDF}
              disabled={!selectedCVId}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progression
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getCompletionPercentage()}%
            </span>
          </div>
          <Progress value={getCompletionPercentage()} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-6 gap-6">
        {/* Sidebar - CVs existants */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Mes CVs
                <Button
                  size="sm"
                  onClick={createNewCV}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {existingCVs.map((cv) => (
                  <div
                    key={cv.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCVId === cv.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                    }`}
                    onClick={() => loadCV(cv.id!)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{cv.title}</h4>
                        <p className="text-xs text-gray-500">
                          Modifié récemment
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateCV(cv.id!);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCV(cv.id!);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {existingCVs.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucun CV créé pour le moment
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <div className={`${showPreview ? "xl:col-span-2" : "xl:col-span-5"}`}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{cvData.title || "Nouveau CV"}</CardTitle>
                <Badge variant="outline">
                  Étape {currentStep + 1} sur {steps.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Navigation par étapes */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <Button
                        key={step.id}
                        variant={currentStep === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentStep(index)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{step.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Contenu des étapes */}
              <div className="min-h-[400px]">
                {currentStep === 0 && (
                  <CVTemplateSelector
                    templates={templates}
                    selectedTemplateId={cvData.templateId}
                    onTemplateSelect={(templateId) =>
                      setCvData((prev) => ({ ...prev, templateId }))
                    }
                  />
                )}
                {currentStep === 1 && (
                  <CVPersonalInfoForm
                    data={cvData.personalInfo}
                    onChange={(personalInfo) =>
                      setCvData((prev) => ({ ...prev, personalInfo }))
                    }
                  />
                )}
                {currentStep === 2 && (
                  <CVExperienceForm
                    data={cvData.experiences || []}
                    onChange={(experiences) =>
                      setCvData((prev) => ({ ...prev, experiences }))
                    }
                  />
                )}
                {currentStep === 3 && (
                  <CVEducationForm
                    data={cvData.educations || []}
                    onChange={(educations) =>
                      setCvData((prev) => ({ ...prev, educations }))
                    }
                  />
                )}
                {currentStep === 4 && (
                  <CVSkillsForm
                    data={cvData.skills || []}
                    onChange={(skills) =>
                      setCvData((prev) => ({ ...prev, skills }))
                    }
                  />
                )}
                {currentStep === 5 && (
                  <CVLanguagesForm
                    data={cvData.languages || []}
                    onChange={(languages) =>
                      setCvData((prev) => ({ ...prev, languages }))
                    }
                  />
                )}
                {currentStep === 6 && (
                  <CVInterestsForm
                    data={cvData.interests || []}
                    onChange={(interests) =>
                      setCvData((prev) => ({ ...prev, interests }))
                    }
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Précédent
                </Button>
                <Button
                  onClick={() =>
                    setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
                  }
                  disabled={currentStep === steps.length - 1}
                >
                  Suivant
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aperçu */}
        {showPreview && (
          <div className="xl:col-span-3 animate-in slide-in-from-right duration-300">
            <Card className="sticky top-6 border-4  ">
              <CardHeader className="bg-gradient-to-r px-6">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <Eye className="h-6 w-6" />
                  APERÇU EN TEMPS RÉEL
                </CardTitle>
                <div className="flex items-center justify-between ">
                  <p className="text-sm ">Votre CV tel qu'il apparaîtra</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">
                      Live
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 bg-gradient-to-b overflow-y-auto">
                <div className="">
                  <CVPreview
                    cvData={cvData}
                    template={templates.find((t) => t.id === cvData.templateId)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
