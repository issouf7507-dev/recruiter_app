"use client";

import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from "@hello-pangea/dnd";

import { Button } from "@/components/ui/button";
import {
  Plus,
  MoreVertical,
  Users,
  Briefcase,
  MapPin,
  DollarSign,
  Loader2,
  RefreshCcw,
  Building2,
  FileText,
  X,
  Download,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

import { useUserStore } from "@/store/userStore";
import SimpleCandidatesKanban from "./components/SimpleCandidatesKanban";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RichTextEditorWrapper } from "@/components/ui/rich-text-editor-wrapper";
import { useSession } from "@/lib/auth-client";

// Types pour le Kanban des offres d'emploi
type OfferColumn = {
  id: string;
  name: string;
  color: string;
  order: number;
};

type KanbanCandidate = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  cv?: string;
  lettreMotivation?: string;
  competences: string[];
  notes?: string;
  createdAt: string;
};

type JobOfferCard = {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: string;
  competences: string[];
  columnId: string;
  createdAt: string;
  candidates: KanbanCandidate[];
};

type NewJobOffer = {
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryPeriod: string;
  skills: string[];
};

// Schéma de validation Zod pour le formulaire
const offerFormSchema = z.object({
  title: z.string().min(1, "Le titre du poste est requis"),
  description: z.string().min(1, "La description est requise"),
  company: z.string().optional(),
  location: z.string().optional(),
});

type OfferFormValues = z.infer<typeof offerFormSchema>;

export default function OffresPage() {
  // const { user } = useUserStore();
  const { data: session } = useSession();

  const [columns, setColumns] = useState<OfferColumn[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOfferCard[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<JobOfferCard | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Variables pour le Dialog - données fictives pour les tests
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [cardApplicationDetailSpet, setCardApplicationDetailSpet] = useState(1);
  const [cardNote, setCardNote] = useState("");
  const [editingNote, setEditingNote] = useState<any>(null);
  const [isUpdatingMessage, setIsUpdatingMessage] = useState(false);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);
  const [isUpdatingChecklistItem, setIsUpdatingChecklistItem] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] = useState<any>(null);
  const [editingChecklistTitle, setEditingChecklistTitle] = useState("");
  const [applicationFiles, setApplicationFiles] = useState<any[]>([]);
  const [isDeletingCollaborator, setIsDeletingCollaborator] = useState(false);

  // États pour les modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDueDateModalOpen, setIsDueDateModalOpen] = useState(false);
  const [availableCollaborators, setAvailableCollaborators] = useState<any[]>(
    []
  );
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>(
    []
  );
  const [selectedDueDate, setSelectedDueDate] = useState("");
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
  const [isAssigningCollaborators, setIsAssigningCollaborators] =
    useState(false);
  const [isUpdatingDueDate, setIsUpdatingDueDate] = useState(false);

  // Variables pour l'ajout manuel de candidat
  const [newCandidateData, setNewCandidateData] = useState({
    cv: null as File | null,
    cvUrl: "",
  });
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [cvPreview, setCvPreview] = useState<string>("");
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Array<{
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
    }>
  >([]);

  // Fonctions mock pour les tests

  const handleNoteSubmit = async () => {
    if (!selectedCard || !cardNote.trim()) return;

    // console.log(editingNote ? "Modification note:" : "Envoi note:", cardNote);
    setIsUpdatingMessage(true);

    try {
      if (editingNote) {
        // Modifier une note existante
        const response = await fetch(
          `/api/recruteur/kanban/custom/applications/${selectedCard.id}/notes/${editingNote.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: cardNote }),
          }
        );

        if (response.ok) {
          setCardNote("");
          setEditingNote(null);
          await queryoffresbyidrefetch();
        } else {
          throw new Error("Erreur lors de la modification de la note");
        }
      } else {
        // Créer une nouvelle note
        const response = await fetch(
          `/api/recruteur/kanban/custom/applications/${selectedCard.id}/notes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: cardNote }),
          }
        );

        if (response.ok) {
          setCardNote("");
          await queryoffresbyidrefetch();
        } else {
          throw new Error("Erreur lors de l'envoi de la note");
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert(
        editingNote
          ? "Erreur lors de la modification de la note"
          : "Erreur lors de l'envoi de la note"
      );
    } finally {
      setIsUpdatingMessage(false);
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setCardNote(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setCardNote("");
  };

  const handleAddChecklistItem = async () => {
    if (!selectedCard || !newChecklistItem.trim()) return;

    // console.log("Ajout item checklist:", newChecklistItem);
    setIsAddingChecklistItem(true);

    try {
      const response = await fetch(
        `/api/recruteur/kanban/custom/applications/${selectedCard.id}/checklist`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newChecklistItem }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setChecklist([...checklist, result.data]);
        setNewChecklistItem("");
      } else {
        throw new Error("Erreur lors de l'ajout de l'élément");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'ajout de l'élément");
    } finally {
      setIsAddingChecklistItem(false);
    }
  };

  const handleToggleChecklistItem = async (itemId: string) => {
    if (!selectedCard) return;

    console.log("Toggle checklist item:", itemId);
    setIsUpdatingChecklistItem(true);

    const item = checklist.find((i) => i.id === itemId);
    if (!item) return;

    try {
      const response = await fetch(
        `/api/recruteur/kanban/custom/applications/${selectedCard.id}/checklist/${itemId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCompleted: !item.isCompleted }),
        }
      );

      if (response.ok) {
        setChecklist(
          checklist.map((checkItem) =>
            checkItem.id === itemId
              ? { ...checkItem, isCompleted: !checkItem.isCompleted }
              : checkItem
          )
        );
      } else {
        throw new Error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour");
    } finally {
      setIsUpdatingChecklistItem(false);
    }
  };

  const handleEditChecklistItem = (item: any) => {
    setEditingChecklistItem(item);
    setEditingChecklistTitle(item.title);
  };

  const handleUpdateChecklistItem = async () => {
    if (!selectedCard || !editingChecklistItem || !editingChecklistTitle.trim())
      return;

    // console.log("Update checklist item:", editingChecklistTitle);
    setIsUpdatingChecklistItem(true);

    try {
      const response = await fetch(
        `/api/recruteur/kanban/custom/applications/${selectedCard.id}/checklist/${editingChecklistItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: editingChecklistTitle }),
        }
      );

      if (response.ok) {
        setChecklist(
          checklist.map((item) =>
            item.id === editingChecklistItem.id
              ? { ...item, title: editingChecklistTitle }
              : item
          )
        );
        setEditingChecklistItem(null);
        setEditingChecklistTitle("");
      } else {
        throw new Error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour");
    } finally {
      setIsUpdatingChecklistItem(false);
    }
  };

  const handleCancelEditChecklistItem = () => {
    setEditingChecklistItem(null);
    setEditingChecklistTitle("");
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!selectedCard) return;

    // console.log("Delete checklist item:", itemId);

    try {
      const response = await fetch(
        `/api/recruteur/kanban/custom/applications/${selectedCard.id}/checklist/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setChecklist(checklist.filter((item) => item.id !== itemId));
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const handleResetChecklist = async () => {
    if (!selectedCard) return;

    const confirmReset = window.confirm(
      "Êtes-vous sûr de vouloir réinitialiser toute la checklist ? Cette action est irréversible."
    );

    if (!confirmReset) return;

    // console.log("Reset checklist");
    setIsUpdatingChecklistItem(true);

    try {
      // Supprimer tous les items de la checklist
      const deletePromises = checklist.map((item) =>
        fetch(
          `/api/recruteur/kanban/custom/applications/${selectedCard.id}/checklist/${item.id}`,
          {
            method: "DELETE",
          }
        )
      );

      await Promise.all(deletePromises);

      // Vider la checklist localement
      setChecklist([]);

      // Optionnel : recharger les données pour s'assurer de la synchronisation
      await queryoffresbyidrefetch();
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      alert("Erreur lors de la réinitialisation de la checklist");
    } finally {
      setIsUpdatingChecklistItem(false);
    }
  };

  const handleOpenAssignModal = async (card: any) => {
    // console.log("Open assign modal for card:", card.id);
    setSelectedCard(card);
    setIsLoadingCollaborators(true);

    try {
      // Charger les collaborateurs disponibles
      const response = await fetch(
        "/api/recruteur/kanban/custom/collaborateurs"
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableCollaborators(data.collaborateurs || []);

        // Pré-sélectionner les collaborateurs déjà affectés
        const assignedIds =
          card.collaborateurs?.map((c: any) => c.collaborateur.id) || [];
        setSelectedCollaborators(assignedIds);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des collaborateurs:", error);
      alert("Erreur lors du chargement des collaborateurs");
    } finally {
      setIsLoadingCollaborators(false);
      setIsAssignModalOpen(true);
    }
  };

  const handleOpenDueDateModal = (card: any) => {
    // console.log("Open due date modal for card:", card.id);
    setSelectedCard(card);
    setSelectedDueDate(card.duedate || "");
    setIsDueDateModalOpen(true);
  };

  const handleRefuseCandidate = async (card: any) => {
    const confirmRefuse = window.confirm(
      `Êtes-vous sûr de vouloir refuser la candidature de ${card.candidat.prenom} ${card.candidat.nom} ?`
    );

    if (!confirmRefuse) return;

    // console.log("Refuse candidate:", card.id);

    try {
      const response = await fetch(
        `/api/recruteur/kanban/custom/applications/${card.id}/refuse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: "Candidature refusée par le recruteur",
          }),
        }
      );

      if (response.ok) {
        // Supprimer la card du kanban ou la déplacer vers une colonne "Refusé"
        setJobOffers((prev) => prev.filter((offer) => offer.id !== card.id));
        setIsOfferModalOpen(false);
        alert("Candidature refusée avec succès");
      } else {
        throw new Error("Erreur lors du refus de la candidature");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du refus de la candidature");
    }
  };

  const handleDeleteCollaborator = async (collaboratorId: string) => {
    // console.log("Delete collaborator:", collaboratorId);
    setIsDeletingCollaborator(true);

    try {
      const response = await fetch(
        `/api/recruteur/kanban/custom/applications/${selectedCard.id}/assign-collaborateurs?collaborateurId=${collaboratorId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Recharger les données
        await queryoffresbyidrefetch();
      } else {
        throw new Error("Erreur lors de la suppression du collaborateur");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression du collaborateur");
    } finally {
      setIsDeletingCollaborator(false);
    }
  };

  const handleAssignCollaborators = async () => {
    if (!selectedCard) return;

    setIsAssigningCollaborators(true);

    try {
      const response = await fetch(
        `/api/recruteur/kanban/custom/applications/${selectedCard.id}/assign-collaborateurs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collaborateurIds: selectedCollaborators,
          }),
        }
      );

      if (response.ok) {
        setIsAssignModalOpen(false);
        setSelectedCollaborators([]);
        await queryoffresbyidrefetch();
        alert("Collaborateurs affectés avec succès");
      } else {
        throw new Error("Erreur lors de l'affectation des collaborateurs");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'affectation des collaborateurs");
    } finally {
      setIsAssigningCollaborators(false);
    }
  };

  const handleUpdateDueDate = async () => {
    if (!selectedCard) return;

    setIsUpdatingDueDate(true);

    try {
      const response = await fetch(
        `/api/recruteur/kanban/custom/applications/${selectedCard.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            duedate: selectedDueDate || null,
          }),
        }
      );

      if (response.ok) {
        setIsDueDateModalOpen(false);
        await queryoffresbyidrefetch();
        alert(selectedDueDate ? "Échéance mise à jour" : "Échéance supprimée");
      } else {
        throw new Error("Erreur lors de la mise à jour de l'échéance");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour de l'échéance");
    } finally {
      setIsUpdatingDueDate(false);
    }
  };

  const handleDeleteAttachment = async (fileId: string) => {
    if (!selectedCard) return;

    // console.log("Delete attachment:", fileId);

    try {
      const response = await fetch(
        `/api/recruteur/kanban/custom/applications/${selectedCard.id}/files/${fileId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setApplicationFiles(
          applicationFiles.filter((file) => file.id !== fileId)
        );
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression du fichier");
    }
  };

  const handleSubmitNewCandidate = async () => {
    // Validation des champs requis
    if (!selectedCard) {
      alert("Aucune application sélectionnée");
      return;
    }

    if (uploadedDocuments.length === 0) {
      alert("Veuillez télécharger au moins un document");
      return;
    }

    setIsAddingCandidate(true);

    try {
      // console.log("Ajout du candidat:", {
      //   documents: uploadedDocuments,
      //   applicationId: selectedCard.id,
      // });

      const response = await fetch("/api/recruteur/kanban/custom/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv: uploadedDocuments[0]?.fileName || "",
          cvUrl: uploadedDocuments[0]?.fileUrl || "",
          documents: uploadedDocuments,
          applicationId: selectedCard.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // console.log("Candidat ajouté avec succès:", result);

        // Réinitialiser le formulaire
        setUploadedDocuments([]);
        setCvPreview("");
        fetchCandidates(selectedCard.id);

        alert("Candidat ajouté avec succès !");
        await queryoffresbyidrefetch();
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de l'ajout du candidat"
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du candidat:", error);
      alert("Erreur lors de l'ajout du candidat");
    } finally {
      setIsAddingCandidate(false);
    }
  };

  const resetNewCandidateForm = () => {
    setNewCandidateData({
      cvUrl: "",
      cv: null,
    });
    setCvPreview("");
    setUploadedDocuments([]);
  };

  const getDueDateStatus = (duedate: string) => {
    const today = new Date();
    const due = new Date(duedate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: "overdue",
        days: Math.abs(diffDays),
        color: "text-red-600",
      };
    } else if (diffDays === 0) {
      return { status: "today", days: 0, color: "text-orange-600" };
    } else if (diffDays <= 3) {
      return { status: "urgent", days: diffDays, color: "text-yellow-600" };
    } else {
      return { status: "upcoming", days: diffDays, color: "text-green-600" };
    }
  };

  const getFileIcon = (fileType: string) => {
    const iconClass = "w-8 h-8";
    const type = fileType.toLowerCase();

    switch (type) {
      case "pdf":
        return (
          <svg
            className={`${iconClass} text-red-500`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 18h12V6l-4-4H4v16zm8-14v4h4l-4-4z" />
          </svg>
        );
      case "doc":
      case "docx":
        return (
          <svg
            className={`${iconClass} text-blue-500`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 18h12V6l-4-4H4v16zm8-14v4h4l-4-4z" />
          </svg>
        );
      case "xls":
      case "xlsx":
        return (
          <svg
            className={`${iconClass} text-green-500`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 18h12V6l-4-4H4v16zm8-14v4h4l-4-4z" />
          </svg>
        );
      case "ppt":
      case "pptx":
        return (
          <svg
            className={`${iconClass} text-orange-500`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M4 18h12V6l-4-4H4v16zm8-14v4h4l-4-4z" />
          </svg>
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return (
          <svg
            className={`${iconClass} text-purple-500`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "txt":
        return (
          <svg
            className={`${iconClass} text-gray-500`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className={`${iconClass} text-gray-400`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Fonction pour recharger les données
  const queryoffresbyidrefetch = async () => {
    await refetch();

    // Si une card est sélectionnée, recharger ses données aussi
    if (selectedCard && selectedCard.id) {
      await loadApplicationData(selectedCard.id);
    }
  };

  // Fonction pour charger les données spécifiques d'une application
  const loadApplicationData = async (applicationId: string) => {
    try {
      // Charger les données détaillées de l'application
      const response = await fetch(
        `/api/recruteur/kanban/custom/applications/${applicationId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const appData = data.data;

          // Mettre à jour les données spécifiques
          setChecklist(appData.checklist || []);
          setApplicationFiles(appData.files || []);

          // Mettre à jour selectedCard avec les vraies données
          setSelectedCard((prev: any) => ({
            ...prev,
            notes: appData.notes || [],
            checklist: appData.checklist || [],
            files: appData.files || [],
            collaborateurs: appData.collaborateurs || [],
            duedate: appData.duedate,
            // Utiliser les vraies données du candidat si disponibles
            candidat: appData.candidatCustom?.[0] ||
              prev?.candidat || {
                cvUrl: null,
                cv: null,
              },
          }));

          // console.log("Application data loaded successfully:", {
          //   notes: appData.notes?.length || 0,
          //   checklist: appData.checklist?.length || 0,
          //   files: appData.files?.length || 0,
          //   collaborateurs: appData.collaborateurs?.length || 0,
          //   candidats: appData.candidatCustom?.length || 0,
          // });
        }
      } else {
        console.warn("Failed to load application data:", response.status);
        // Utiliser des données vides par défaut
        setChecklist([]);
        setApplicationFiles([]);

        // Garder les données de base mais vider les données détaillées
        setSelectedCard((prev: any) => ({
          ...prev,
          notes: [],
          checklist: [],
          files: [],
          collaborateurs: [],
        }));
      }
    } catch (error) {
      console.error("Error loading application data:", error);
      // Utiliser des données vides par défaut en cas d'erreur
      setChecklist([]);
      setApplicationFiles([]);

      // Garder les données de base mais vider les données détaillées
      setSelectedCard((prev: any) => ({
        ...prev,
        notes: [],
        checklist: [],
        files: [],
        collaborateurs: [],
      }));
    }
  };

  // Synchroniser selectedOffer avec selectedCard pour la modal
  React.useEffect(() => {
    if (selectedOffer && isOfferModalOpen) {
      // console.log("Opening modal for offer:", selectedOffer);

      // Transformer selectedOffer en format attendu par la modal
      const cardData = {
        id: selectedOffer.id,
        title: selectedOffer.title,
        description: selectedOffer.description,
        company: selectedOffer.company,
        location: selectedOffer.location,
        type: selectedOffer.type,
        experience: selectedOffer.experience,
        salaryMin: selectedOffer.salaryMin,
        salaryMax: selectedOffer.salaryMax,
        salaryCurrency: selectedOffer.salaryCurrency,
        salaryPeriod: selectedOffer.salaryPeriod,
        competences: selectedOffer.competences,
        columnId: selectedOffer.columnId,
        createdAt: selectedOffer.createdAt,
        candidates: selectedOffer.candidates || [],
        // Utiliser les vraies données du candidat depuis selectedOffer si disponibles
        candidat: (selectedOffer as any).candidatCustom?.[0] ||
          selectedOffer.candidates?.[0] || {
            cvUrl: null,
            cv: null,
          },
        // Données par défaut qui seront remplacées par loadApplicationData
        notes: (selectedOffer as any).notes || [],
        checklist: (selectedOffer as any).checklist || [],
        files: (selectedOffer as any).files || [],
        collaborateurs: (selectedOffer as any).collaborateurs || [],
        cv:
          (selectedOffer as any).candidatCustom?.[0]?.cv ||
          selectedOffer.candidates?.[0]?.cv ||
          null,
        message:
          (selectedOffer as any).candidatCustom?.[0]?.message ||
          (selectedOffer.candidates?.[0] as any)?.message ||
          null,
        duedate: (selectedOffer as any).duedate || null,
      };

      setSelectedCard(cardData);

      // Initialiser les données locales
      setChecklist((selectedOffer as any).checklist || []);
      setApplicationFiles((selectedOffer as any).files || []);
      setCardNote("");
      setEditingNote(null);
      setCardApplicationDetailSpet(1); // Retour à l'onglet principal

      // Charger les données détaillées depuis l'API
      loadApplicationData(selectedOffer.id);
    } else if (!isOfferModalOpen) {
      // Nettoyer quand la modal se ferme
      setSelectedCard(null);
      setChecklist([]);
      setApplicationFiles([]);
      setCardNote("");
      setEditingNote(null);
    }
  }, [selectedOffer, isOfferModalOpen]);

  const [isNewOfferModalOpen, setIsNewOfferModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCandidatesView, setShowCandidatesView] = useState(false);
  const [selectedOfferForCandidates, setSelectedOfferForCandidates] =
    useState<JobOfferCard | null>(null);

  // États pour la gestion des colonnes
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isDeleteColumnModalOpen, setIsDeleteColumnModalOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<OfferColumn | null>(
    null
  );
  const [newColumnName, setNewColumnName] = useState("");
  const [selectedColumnColor, setSelectedColumnColor] =
    useState("bg-blue-300/30");

  // État pour la colonne sélectionnée lors de la création d'offre
  const [selectedColumnForOffer, setSelectedColumnForOffer] = useState<
    string | null
  >(null);

  // Form pour la création d'une nouvelle offre
  const form = useForm<OfferFormValues>({
    // resolver: zodResolver(offerFormSchema),
    defaultValues: {
      title: "",
      description: "",
      company: "",
      location: "",
    },
  });

  // États pour la création d'une nouvelle offre (pour les champs non gérés par le form)
  const [newOffer, setNewOffer] = useState<NewJobOffer>({
    title: "",
    description: "",
    company: "",
    location: "",
    type: "CDI",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "EUR",
    salaryPeriod: "month",
    skills: [],
  });

  // Fetch data from API
  const queryClient = useQueryClient();

  const {
    data: kanbanData,
    isLoading: isLoadingData,
    refetch,
  } = useQuery({
    queryKey: ["kanban-custom", session?.user?.id],
    queryFn: async () => {
      const response = await fetch("/api/recruteur/kanban/custom");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  // console.log("kanbanData", kanbanData);

  // const {
  //   data: candidatesData,
  //   isLoading: isLoadingCandidates,
  //   refetch: refetchCandidates,
  // } = useQuery({
  //   queryKey: ["candidates", user?.id],
  //   queryFn: async () => {
  //     const response = await fetch(`/api/recruteur/kanban/custom/candidates/${id}`);
  //     if (!response.ok) {
  //       throw new Error("Erreur lors de la récupération des candidats");
  //     }
  //     return response.json();
  //   },
  //   enabled: !!user?.id,
  // });

  const [candidatesData, setCandidatesData] = useState<any>([]);
  const fetchCandidates = async (id: string) => {
    try {
      const response = await fetch(
        `/api/recruteur/kanban/custom/candidates/${id}`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des candidats");
      }
      const data = await response.json();
      console.log("data", data);
      setCandidatesData(data);
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des candidats:", error);
    }
    // return data;
  };

  // console.log(candidatesData);

  // Initialize data from API
  useEffect(() => {
    if (kanbanData?.success && kanbanData.data) {
      setColumns(kanbanData.data);
      // Transform applications to job offers format
      const allApplications = kanbanData.data.flatMap(
        (column: any) =>
          column.applicationsCustom?.map((app: any) => ({
            id: app.id,
            title: app.title,
            description: app.description,
            company: app.company,
            location: app.location,
            type: app.type,
            experience: app.experience,
            salaryMin: app.salaryMin,
            salaryMax: app.salaryMax,
            salaryCurrency: app.salaryCurrency,
            salaryPeriod: app.salaryPeriod,
            competences: app.skills ? app.skills.split(",") : [],
            columnId: app.kanbanColumnCustomid,
            createdAt: app.createdAt,
            candidates: app.candidatCustom || [],
          })) || []
      );
      setJobOffers(allApplications);
    }
  }, [kanbanData]);

  // Auto-initialize default columns if none exist
  useEffect(() => {
    if (
      kanbanData?.success &&
      kanbanData.data &&
      kanbanData.data.length === 0
    ) {
      const initializeDefaultColumns = async () => {
        try {
          const response = await fetch("/api/recruteur/kanban/custom/init", {
            method: "POST",
          });
          if (response.ok) {
            refetch(); // Reload data after initialization
          }
        } catch (error) {
          console.error("Erreur lors de l'initialisation:", error);
        }
      };
      initializeDefaultColumns();
    }
  }, [kanbanData, refetch]);

  // Mutations for API calls
  const createColumnMutation = useMutation({
    mutationFn: async (columnData: {
      name: string;
      color: string;
      order: number;
    }) => {
      const response = await fetch("/api/recruteur/kanban/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(columnData),
      });
      if (!response.ok)
        throw new Error("Erreur lors de la création de la colonne");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kanban-custom", session?.user?.id],
      });
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: async (columnId: string) => {
      const response = await fetch(
        `/api/recruteur/kanban/custom/columns/${columnId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok)
        throw new Error("Erreur lors de la suppression de la colonne");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kanban-custom", session?.user?.id],
      });
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (offerData: any) => {
      const response = await fetch(
        "/api/recruteur/kanban/custom/applications",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(offerData),
        }
      );
      if (!response.ok)
        throw new Error("Erreur lors de la création de l'offre");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kanban-custom", session?.user?.id],
      });
    },
  });

  const moveApplicationMutation = useMutation({
    mutationFn: async ({
      applicationId,
      newColumnId,
    }: {
      applicationId: string;
      newColumnId: string;
    }) => {
      const response = await fetch(
        "/api/recruteur/kanban/custom/applications",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId, newColumnId }),
        }
      );
      if (!response.ok)
        throw new Error("Erreur lors du déplacement de l'application");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kanban-custom", session?.user?.id],
      });
    },
  });

  const reorderColumnsMutation = useMutation({
    mutationFn: async (reorderedColumns: OfferColumn[]) => {
      const response = await fetch(
        "/api/recruteur/kanban/custom/columns/reorder",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ columns: reorderedColumns }),
        }
      );
      if (!response.ok)
        throw new Error("Erreur lors de la réorganisation des colonnes");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kanban-custom", session?.user?.id],
      });
    },
  });

  // Couleurs disponibles pour les colonnes
  const availableColors = [
    { value: "bg-blue-300/30", label: "Bleu" },
    { value: "bg-green-300/30", label: "Vert" },
    { value: "bg-pink-300/30", label: "Rose" },
    { value: "bg-yellow-300/30", label: "Jaune" },
    { value: "bg-purple-300/30", label: "Violet" },
    { value: "bg-red-300/30", label: "Rouge" },
    { value: "bg-gray-300/30", label: "Gris" },
  ];

  // Fonction pour créer une nouvelle colonne
  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) return;

    try {
      await createColumnMutation.mutateAsync({
        name: newColumnName.trim(),
        color: selectedColumnColor,
        order: columns.length + 1,
      });
      setNewColumnName("");
      setSelectedColumnColor("bg-blue-300/30");
      setIsColumnModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la création de la colonne:", error);
      alert("Erreur lors de la création de la colonne");
    }
  };

  // Fonction pour supprimer une colonne
  const handleDeleteColumn = async (columnId: string) => {
    try {
      await deleteColumnMutation.mutateAsync(columnId);
      setIsDeleteColumnModalOpen(false);
      setColumnToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la colonne:", error);
      alert("Erreur lors de la suppression de la colonne");
    }
  };

  // Gestion du drag and drop
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (type === "column") {
      // Réorganisation des colonnes
      const newColumns = Array.from(columns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);

      // Mettre à jour l'ordre des colonnes
      const updatedColumns = newColumns.map((col, index) => ({
        ...col,
        order: index + 1,
      }));

      // Mise à jour optimiste
      setColumns(updatedColumns);

      try {
        // Appel API pour mettre à jour l'ordre des colonnes
        await reorderColumnsMutation.mutateAsync(updatedColumns);
      } catch (error) {
        console.error("Erreur lors de la réorganisation des colonnes:", error);
        // Revert optimistic update on error
        refetch();
      }
    } else {
      // Déplacement d'une offre entre colonnes
      if (destination.droppableId === source.droppableId) return;

      const newColumnId = destination.droppableId;

      // Mise à jour optimiste
      setJobOffers((prevOffers) =>
        prevOffers.map((offer) =>
          offer.id === draggableId ? { ...offer, columnId: newColumnId } : offer
        )
      );

      try {
        await moveApplicationMutation.mutateAsync({
          applicationId: draggableId,
          newColumnId,
        });
      } catch (error) {
        console.error("Erreur lors du déplacement:", error);
        // Revert optimistic update on error
        refetch();
      }
    }
  };

  // Création d'une nouvelle offre
  const handleCreateOffer = async (values: OfferFormValues) => {
    if (columns.length === 0) {
      alert("Veuillez créer au moins une colonne avant d'ajouter une offre.");
      return;
    }

    setIsLoading(true);
    // console.log("offer values", values);

    try {
      // Utiliser la colonne sélectionnée ou la première colonne par défaut
      const targetColumnId = selectedColumnForOffer || columns[0].id;

      await createOfferMutation.mutateAsync({
        title: values.title,
        description: values.description,
        company: values.company || "Non spécifié",
        location: values.location || "Non spécifié",
        type: newOffer.type || "CDI",
        experience: newOffer.experience || "Non spécifié",
        salaryMin: newOffer.salaryMin,
        salaryMax: newOffer.salaryMax,
        salaryCurrency: newOffer.salaryCurrency,
        salaryPeriod: newOffer.salaryPeriod,
        skills: Array.isArray(newOffer.skills)
          ? newOffer.skills.join(",")
          : newOffer.skills,
        columnId: targetColumnId,
      });

      handleCloseOfferModal();
    } catch (error) {
      console.error("Erreur lors de la création de l'offre:", error);
      alert("Erreur lors de la création de l'offre");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour fermer le modal et reset le formulaire
  const handleCloseOfferModal = () => {
    setIsNewOfferModalOpen(false);
    setSelectedColumnForOffer(null);
    form.reset();
    setNewOffer({
      title: "",
      description: "",
      company: "",
      location: "",
      type: "CDI",
      experience: "",
      salaryMin: "",
      salaryMax: "",
      salaryCurrency: "EUR",
      salaryPeriod: "month",
      skills: [],
    });
  };

  // Fonction pour ouvrir le modal de création d'offre avec une colonne spécifique
  const handleOpenOfferModal = (columnId?: string) => {
    setSelectedColumnForOffer(columnId || null);
    setIsNewOfferModalOpen(true);
  };

  // Fonctions pour gérer la vue des candidatures
  const handleViewCandidates = (offer: JobOfferCard) => {
    setSelectedOfferForCandidates(offer);
    setShowCandidatesView(true);
  };

  const handleBackFromCandidates = () => {
    setShowCandidatesView(false);
    setSelectedOfferForCandidates(null);
  };

  // Fonction pour ajouter un candidat à une offre
  const addCandidateToOffer = (offerId: string, candidate: KanbanCandidate) => {
    setJobOffers((prevOffers) =>
      prevOffers.map((offer) =>
        offer.id === offerId
          ? { ...offer, candidates: [...offer.candidates, candidate] }
          : offer
      )
    );
  };

  const handleDownloadCV = (cvUrl: string) => {
    window.open(cvUrl, "_blank");
  };

  // Affichage du loading
  if (isLoadingData) {
    return (
      <div className="p-6 space-y-6 w-full h-screen overflow-auto">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-6">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <p className="text-gray-600 dark:text-gray-400">
              Chargement de vos données...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Message d'accueil si aucune colonne n'existe
  if (columns.length === 0) {
    return (
      <div className="p-6 space-y-6 w-full h-screen overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des offres d'emploi
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Créez votre premier tableau Kanban pour gérer vos offres
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Commencez par créer vos colonnes
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Organisez votre processus de recrutement avec des colonnes
                personnalisées
              </p>
              <Button
                onClick={() => setIsColumnModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Créer ma première colonne
              </Button>
            </div>
          </div>
        </div>

        {/* Modal de création de colonne */}
        <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle colonne</DialogTitle>
              <DialogDescription>
                Ajoutez une colonne à votre tableau Kanban pour organiser vos
                offres.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom de la colonne</label>
                <Input
                  placeholder="Ex: En attente, En cours, Finalisée..."
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Couleur</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColumnColor(color.value)}
                      className={`h-10 rounded-md ${color.value} border-2 ${
                        selectedColumnColor === color.value
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsColumnModalOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateColumn}
                disabled={!newColumnName.trim()}
              >
                Créer la colonne
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Vue des candidatures
  if (showCandidatesView && selectedOfferForCandidates) {
    return (
      <SimpleCandidatesKanban
        offerId={selectedOfferForCandidates.id}
        offerTitle={selectedOfferForCandidates.title}
        onBack={handleBackFromCandidates}
        candidates={selectedOfferForCandidates.candidates}
        onCandidateAdded={(candidate) =>
          addCandidateToOffer(selectedOfferForCandidates.id, candidate)
        }
      />
    );
  }

  return (
    <div className="p-6 space-y-6 w-full h-screen overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des offres d'emplois
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos offres d'emploi et suivez leur progression
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsColumnModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle colonne
          </Button>
          <Button
            onClick={() => handleOpenOfferModal()}
            className="flex items-center gap-2"
            disabled={columns.length === 0}
          >
            <Plus className="h-4 w-4" />
            Nouvelle offre
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="all-columns"
            direction="horizontal"
            type="column"
          >
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex gap-6"
              >
                {columns
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((column, index) => {
                    const columnOffers = jobOffers.filter(
                      (offer) => offer.columnId === column.id
                    );

                    return (
                      <Draggable
                        key={column.id}
                        draggableId={column.id}
                        index={index}
                      >
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex-shrink-0 w-80 rounded-2xl p-4 ${column.color} flex flex-col min-h-[500px]`}
                          >
                            {/* En-tête de colonne */}
                            <div
                              className="flex items-center justify-between mb-4"
                              {...provided.dragHandleProps}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg">
                                  {column.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="dark:bg-neutral-600 bg-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium">
                                  {columnOffers.length}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      className="p-1 dark:hover:bg-neutral-600 hover:bg-gray-100 rounded"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setColumnToDelete(column);
                                        setIsDeleteColumnModalOpen(true);
                                      }}
                                      className="text-red-500"
                                    >
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* Zone de drop pour offres */}
                            <Droppable droppableId={column.id}>
                              {(provided: DroppableProvided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="space-y-3 flex-1"
                                >
                                  {columnOffers.map((offer, offerIndex) => (
                                    <Draggable
                                      key={offer.id}
                                      draggableId={offer.id}
                                      index={offerIndex}
                                    >
                                      {(provided: DraggableProvided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700"
                                          onClick={() => {
                                            setSelectedOffer(offer);
                                            setIsOfferModalOpen(true);
                                            fetchCandidates(offer.id);
                                          }}
                                        >
                                          {/* En-tête de carte */}
                                          <div className="flex items-start justify-between">
                                            <h3 className="font-semibold text-blue-700 dark:text-blue-400 text-base leading-tight">
                                              {offer.title}
                                            </h3>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <button
                                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                                  onClick={(e) =>
                                                    e.stopPropagation()
                                                  }
                                                >
                                                  <MoreVertical className="h-4 w-4" />
                                                </button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewCandidates(offer);
                                                  }}
                                                >
                                                  <Users className="h-4 w-4 mr-2" />
                                                  Voir candidats
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>

                                          {/* Informations de l'offre */}
                                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                              <Briefcase className="h-4 w-4" />
                                              <span>{offer.company}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <MapPin className="h-4 w-4" />
                                              <span>{offer.location}</span>
                                            </div>
                                          </div>

                                          {/* Footer */}
                                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                              <Users className="h-4 w-4" />
                                              <span>
                                                {offer.candidates.length}{" "}
                                                candidat
                                                {offer.candidates.length > 1
                                                  ? "s"
                                                  : ""}
                                              </span>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                              {new Date(
                                                offer.createdAt
                                              ).toLocaleDateString("fr-FR")}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}

                                  {/* Bouton d'ajout d'offre dans la colonne */}
                                  <div className="mt-4">
                                    <button
                                      onClick={() =>
                                        handleOpenOfferModal(column.id)
                                      }
                                      className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors group"
                                    >
                                      <div className="flex items-center justify-center gap-2 text-gray-500 group-hover:text-primary">
                                        <Plus className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                          Ajouter une offre
                                        </span>
                                      </div>
                                    </button>
                                  </div>

                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Modal de détail d'offre */}
      <Dialog open={isOfferModalOpen} onOpenChange={setIsOfferModalOpen}>
        <DialogContent className="max-w-6xl w-full p-0 overflow-hidden h-[calc(100vh-20px)] dark:bg-background">
          {selectedCard && (
            <div className="grid grid-cols-3 w-full h-full">
              {/* Partie principale */}
              {cardApplicationDetailSpet === 1 && (
                <div className="col-span-2 p-6 bg-white h-[calc(100vh-10px)] overflow-y-auto dark:bg-background">
                  {/* En-tête avec informations du candidat */}
                  <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 mb-6">
                    {/* Avatar et nom */}
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-primary to-primary/70 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-xl">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedOffer?.title}
                        </h1>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-semibold uppercase">
                          {
                            columns.find(
                              (col) => col.id === selectedCard.columnId
                            )?.name
                          }
                        </span>
                      </div>
                    </div>

                    {/* Documents téléchargeables */}
                    <div className="bg-gray-50 rounded-lg py-4 dark:bg-background">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 dark:text-white flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                      </h3>

                      <div
                        className="text-sm text-gray-500 mb-3 dark:text-gray-400 "
                        dangerouslySetInnerHTML={{
                          __html: selectedOffer?.description || "",
                        }}
                      />
                    </div>

                    {/* Informations supplémentaires */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Entreprise
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{selectedOffer?.company}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Localisation
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{selectedOffer?.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Discussion */}
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 dark:text-white">
                      {editingNote ? "Modifier la note" : "Discussion"}
                    </h2>

                    <div className="flex items-center gap-2 mb-4">
                      <Input
                        className="w-full bg-gray-50 rounded-full p-3 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-none border dark:bg-background"
                        placeholder="Écrire un message..."
                        value={cardNote}
                        onChange={(e) => {
                          setCardNote(e.target.value);
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium"
                          onClick={handleNoteSubmit}
                          disabled={cardNote.length === 0}
                        >
                          {isUpdatingMessage ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {editingNote ? "Modifier" : "Envoyer"}
                            </>
                          ) : editingNote ? (
                            "Modifier"
                          ) : (
                            "Envoyer"
                          )}
                        </Button>
                        {editingNote && (
                          <Button
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors text-sm font-medium"
                            onClick={handleCancelEdit}
                          >
                            Annuler
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="bg-gray-50 rounded-lg p-4 dark:bg-background dark:border dark:border-gray-700">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {selectedCard.notes
                        .sort(
                          (a: any, b: any) =>
                            new Date(b.createdAt || "").getTime() -
                            new Date(a.createdAt || "").getTime()
                        )
                        .slice(0, 3)
                        .map((note: any) => (
                          <div
                            key={note.id}
                            className={`flex gap-3 ${
                              session?.user?.id === note.authorId
                                ? "flex-row-reverse"
                                : ""
                            }`}
                          >
                            {/* Avatar */}
                            <div
                              className={`flex-shrink-0 ${
                                session?.user?.id === note.authorId
                                  ? "ml-3"
                                  : "mr-3"
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-sm">
                                {session?.user?.id === note.authorId
                                  ? session?.user?.name?.[0]?.toUpperCase() ||
                                    "U"
                                  : note.authorType === "RECRUTEUR"
                                    ? "R"
                                    : "C"}
                              </div>
                            </div>

                            {/* Message bubble */}
                            <div
                              className={`flex-1 max-w-xs ${
                                session?.user?.id === note.authorId
                                  ? "text-right"
                                  : ""
                              }`}
                            >
                              <div
                                className={`inline-block p-3 rounded-2xl ${
                                  session?.user?.id === note.authorId
                                    ? "bg-primary text-white rounded-br-md"
                                    : "bg-white text-gray-800 rounded-bl-md shadow-sm border"
                                }`}
                              >
                                <p className="text-sm leading-relaxed">
                                  {note.content}
                                </p>
                              </div>

                              {/* Message info */}
                              <div
                                className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                                  session?.user?.id === note.authorId
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <span className="font-medium">
                                  {note.authorName ||
                                    (session?.user?.id === note.authorId
                                      ? session?.user?.name || "Vous"
                                      : note.authorType === "RECRUTEUR"
                                        ? "Recruteur"
                                        : "Candidat")}
                                </span>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    note.createdAt || ""
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {session?.user?.id === note.authorId && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleEditNote(note)}
                                        className="text-gray-400 hover:text-primary transition-colors"
                                        title="Modifier"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-3 w-3"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {selectedCard.notes.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm">Aucun message pour le moment</p>
                        <p className="text-xs text-gray-400">
                          Soyez le premier à commenter !
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end w-full mt-4">
                      <Button
                        variant="link"
                        className="text-xs p-0 text-primary hover:underline"
                        onClick={() => setCardApplicationDetailSpet(2)}
                      >
                        Voir tous les messages ({selectedCard.notes.length})
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {cardApplicationDetailSpet === 2 && (
                <div className="col-span-2 p-6 bg-white h-[calc(100vh-10px)]  overflow-hidden dark:bg-background">
                  {/* En-tête avec informations du candidat */}
                  <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 mb-6">
                    {/* Avatar et nom */}
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-primary to-primary/70 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-xl">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedOffer?.title}
                        </h1>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-semibold uppercase">
                          {
                            columns.find(
                              (col) => col.id === selectedCard.columnId
                            )?.name
                          }
                        </span>
                      </div>
                    </div>

                    {/* Documents téléchargeables */}
                    <div className="bg-gray-50 rounded-lg py-4 dark:bg-background">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 dark:text-white flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                      </h3>

                      <div
                        className="text-sm text-gray-500 mb-3 dark:text-gray-400"
                        dangerouslySetInnerHTML={{
                          __html: selectedOffer?.description || "",
                        }}
                      />
                      {/* <p className="text-sm text-gray-500 mb-3 dark:text-gray-400">
                        {selectedOffer?.description}
                      </p> */}
                    </div>

                    {/* Informations supplémentaires */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Entreprise
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{selectedOffer?.company}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Localisation
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{selectedOffer?.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>
                      <div className="mb-6">
                        <h1 className="text-xl font-semibold text-gray-700 mb-4 dark:text-white">
                          {editingNote ? "Modifier la note" : "Discussion"}
                        </h1>
                        <div className="flex items-center gap-2">
                          <Input
                            className="w-full bg-gray-50 rounded-full p-3 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-none border dark:bg-background"
                            placeholder="Écrire un message..."
                            value={cardNote}
                            onChange={(e) => {
                              setCardNote(e.target.value);
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium "
                              onClick={handleNoteSubmit}
                              disabled={cardNote.length === 0}
                            >
                              {isUpdatingMessage ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  {editingNote ? "Modifier" : "Envoyer"}
                                </>
                              ) : editingNote ? (
                                "Modifier"
                              ) : (
                                "Envoyer"
                              )}
                            </Button>

                            {editingNote && (
                              <Button
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors text-sm font-medium"
                                onClick={handleCancelEdit}
                              >
                                Annuler
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 dark:bg-background dark:border dark:border-gray-700">
                        <div className="space-y-3 h-[calc(100vh-590px)] overflow-y-auto ">
                          {selectedCard.notes
                            .sort(
                              (a: any, b: any) =>
                                new Date(b.createdAt || "").getTime() -
                                new Date(a.createdAt || "").getTime()
                            )
                            .map((note: any) => (
                              <div
                                key={note.id}
                                className={`flex gap-3 ${
                                  session?.user?.id === note.authorId
                                    ? "flex-row-reverse"
                                    : ""
                                }`}
                              >
                                {/* Avatar */}
                                <div
                                  className={`flex-shrink-0 ${
                                    session?.user?.id === note.authorId
                                      ? "ml-3"
                                      : "mr-3"
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-sm">
                                    {session?.user?.id === note.authorId
                                      ? session?.user?.name?.[0]?.toUpperCase() ||
                                        "U"
                                      : note.authorType === "RECRUTEUR"
                                        ? "R"
                                        : "C"}
                                  </div>
                                </div>

                                {/* Message bubble */}
                                <div
                                  className={`flex-1 max-w-xs ${
                                    session?.user?.id === note.authorId
                                      ? "text-right"
                                      : ""
                                  }`}
                                >
                                  <div
                                    className={`inline-block p-3 rounded-2xl ${
                                      session?.user?.id === note.authorId
                                        ? "bg-primary text-white rounded-br-md"
                                        : "bg-white text-gray-800 rounded-bl-md shadow-sm border"
                                    }`}
                                  >
                                    <p className="text-sm leading-relaxed">
                                      {note.content}
                                    </p>
                                  </div>

                                  {/* Message info */}
                                  <div
                                    className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                                      session?.user?.id === note.authorId
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                                  >
                                    <span className="font-medium">
                                      {note.authorName ||
                                        (session?.user?.id === note.authorId
                                          ? session?.user?.name || "Vous"
                                          : note.authorType === "RECRUTEUR"
                                            ? "Recruteur"
                                            : "Candidat")}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {new Date(
                                        note.createdAt || ""
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    {session?.user?.id === note.authorId && (
                                      <>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => handleEditNote(note)}
                                            className="text-gray-400 hover:text-primary transition-colors"
                                            title="Modifier"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-3 w-3"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Checklist */}
              {cardApplicationDetailSpet === 3 && selectedCard && (
                <div className="col-span-2 p-6 bg-white h-[calc(100vh-10px)] overflow-y-auto dark:bg-background dark:border dark:border-gray-700">
                  {/* En-tête avec informations du candidat */}
                  <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 mb-6">
                    {/* Avatar et nom */}
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-primary to-primary/70 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-xl">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedOffer?.title}
                        </h1>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-semibold uppercase">
                          {
                            columns.find(
                              (col) => col.id === selectedCard.columnId
                            )?.name
                          }
                        </span>
                      </div>
                    </div>

                    {/* Documents téléchargeables */}
                    <div className="bg-gray-50 rounded-lg py-4 dark:bg-background">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 dark:text-white flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                      </h3>

                      <div
                        className="text-sm text-gray-500 mb-3 dark:text-gray-400 "
                        dangerouslySetInnerHTML={{
                          __html: selectedOffer?.description || "",
                        }}
                      />
                    </div>

                    {/* Informations supplémentaires */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Entreprise
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{selectedOffer?.company}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Localisation
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{selectedOffer?.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Checklist */}
                  <div className="space-y-6">
                    {/* En-tête de la checklist */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-white">
                          Checklist
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 dark:text-white">
                          Suivez les étapes du processus de recrutement
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetChecklist}
                        disabled={isUpdatingChecklistItem}
                        className="flex items-center gap-2"
                      >
                        {isUpdatingChecklistItem ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCcw className="h-4 w-4" />
                        )}
                        Réinitialiser
                      </Button>
                    </div>

                    {/* Barre de progression */}
                    <div className="bg-gray-50 rounded-lg p-4 dark:bg-background dark:border dark:border-gray-700 ">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-white">
                          Progression
                        </span>
                        <span className="text-sm text-gray-500 dark:text-white">
                          {checklist.filter((i) => i.isCompleted).length} sur{" "}
                          {checklist.length}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-3 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round(
                              (checklist.filter((i) => i.isCompleted).length /
                                (checklist.length || 1)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-white">
                          {checklist.length === 0
                            ? "Aucune tâche"
                            : checklist.filter((i) => i.isCompleted).length ===
                                checklist.length
                              ? "Toutes les tâches sont terminées !"
                              : `${Math.round(
                                  (checklist.filter((i) => i.isCompleted)
                                    .length /
                                    (checklist.length || 1)) *
                                    100
                                )}% terminé`}
                        </span>
                        {checklist.length > 0 && (
                          <span className="text-xs text-gray-500 dark:text-white">
                            {checklist.filter((i) => i.isCompleted).length ===
                            checklist.length
                              ? "🎉"
                              : "📋"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ajouter un nouvel élément */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-background dark:border dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 dark:text-white">
                        Ajouter une tâche
                      </h3>
                      <div className="flex gap-3">
                        <Input
                          className="flex-1 bg-transparent border border-gray-300 p-3 text-sm  "
                          placeholder="Ex: Contacter le candidat pour un entretien..."
                          value={newChecklistItem}
                          onChange={(e) => setNewChecklistItem(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newChecklistItem.trim()) {
                              handleAddChecklistItem();
                            }
                          }}
                          disabled={isAddingChecklistItem}
                        />
                        <Button
                          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                          onClick={handleAddChecklistItem}
                          disabled={
                            isAddingChecklistItem || !newChecklistItem.trim()
                          }
                        >
                          {isAddingChecklistItem ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Ajouter"
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Liste des éléments de la checklist */}
                    <div className="space-y-3">
                      {checklist.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-white">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center dark:bg-background">
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                              />
                            </svg>
                          </div>
                          <p className="text-lg font-medium mb-2">
                            Aucune tâche
                          </p>
                          <p className="text-sm text-gray-400">
                            Commencez par ajouter des tâches pour suivre le
                            processus de recrutement
                          </p>
                        </div>
                      ) : (
                        checklist
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt || "").getTime() -
                              new Date(a.createdAt || "").getTime()
                          )
                          .map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 ${
                                item.isCompleted
                                  ? "bg-green-50 border-green-200 dark:bg-green-900 dark:border dark:border-green-700"
                                  : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-background dark:border dark:border-gray-700 "
                              }`}
                            >
                              {/* Checkbox personnalisé */}
                              <div className="flex-shrink-0 mt-1">
                                <button
                                  onClick={() =>
                                    handleToggleChecklistItem(item.id)
                                  }
                                  disabled={isUpdatingChecklistItem}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                    item.isCompleted
                                      ? "bg-primary border-primary text-white"
                                      : "border-gray-300 hover:border-primary"
                                  } ${
                                    isUpdatingChecklistItem
                                      ? "opacity-50 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  {item.isCompleted && (
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </div>

                              {/* Contenu de la tâche */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    {editingChecklistItem?.id === item.id ? (
                                      // Mode édition
                                      <div className="space-y-3">
                                        <Input
                                          className="w-full bg-transparent border border-gray-300 p-2 text-sm"
                                          placeholder="Titre de la tâche..."
                                          value={editingChecklistTitle}
                                          onChange={(e) =>
                                            setEditingChecklistTitle(
                                              e.target.value
                                            )
                                          }
                                          onKeyDown={(e) => {
                                            if (
                                              e.key === "Enter" &&
                                              editingChecklistTitle.trim()
                                            ) {
                                              handleUpdateChecklistItem();
                                            }
                                          }}
                                        />

                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={handleUpdateChecklistItem}
                                            disabled={
                                              isUpdatingChecklistItem ||
                                              !editingChecklistTitle.trim()
                                            }
                                            className="px-3 py-1 text-xs"
                                          >
                                            {isUpdatingChecklistItem ? (
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                              "Modifier"
                                            )}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={
                                              handleCancelEditChecklistItem
                                            }
                                            disabled={isUpdatingChecklistItem}
                                            className="px-3 py-1 text-xs"
                                          >
                                            Annuler
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      // Mode affichage
                                      <>
                                        <h3
                                          className={`font-medium ${
                                            item.isCompleted
                                              ? "line-through text-gray-500 dark:text-white"
                                              : "text-gray-900 dark:text-white"
                                          }`}
                                        >
                                          {item.title}
                                        </h3>
                                        {item.description && (
                                          <p
                                            className={`text-sm mt-1 ${
                                              item.isCompleted
                                                ? "text-gray-400"
                                                : "text-gray-600"
                                            }`}
                                          >
                                            {item.description}
                                          </p>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  {/* Actions */}

                                  {!item.isCompleted && (
                                    <div className="flex items-center gap-1">
                                      {editingChecklistItem?.id !== item.id && (
                                        <>
                                          {/* Bouton modifier */}
                                          <button
                                            onClick={() =>
                                              handleEditChecklistItem(item)
                                            }
                                            className="text-gray-400 hover:text-primary p-1 transition-colors"
                                            disabled={isUpdatingChecklistItem}
                                            title="Modifier"
                                          >
                                            <svg
                                              className="w-4 h-4"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                              />
                                            </svg>
                                          </button>
                                          {/* Bouton supprimer */}
                                          <button
                                            onClick={() =>
                                              handleDeleteChecklistItem(item.id)
                                            }
                                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                            disabled={isUpdatingChecklistItem}
                                            title="Supprimer"
                                          >
                                            <svg
                                              className="w-4 h-4"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                              />
                                            </svg>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Métadonnées */}
                                <div className="flex items-center gap-3 mt-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">
                                        {session?.user?.id === item.createdById
                                          ? session?.user?.name?.[0]?.toUpperCase() ||
                                            "U"
                                          : "U"}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {session?.user?.id === item.createdById
                                        ? session?.user?.name || "Vous"
                                        : "Utilisateur"}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    •
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {item.createdByType === "recruteur"
                                      ? "Recruteur"
                                      : "Candidat"}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    •
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      item.createdAt
                                    ).toLocaleDateString("fr-FR")}
                                  </span>
                                  {item.isCompleted && (
                                    <>
                                      <span className="text-xs text-gray-400">
                                        •
                                      </span>
                                      <span className="text-xs text-green-600 font-medium">
                                        ✓ Terminé
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>

                    {/* Statistiques */}
                    {checklist.length > 0 && (
                      <div className=" border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold  mb-2">
                          Statistiques
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs ">
                          <div>
                            <div className="font-semibold">
                              {checklist.length}
                            </div>
                            <div>Tâches totales</div>
                          </div>
                          <div>
                            <div className="font-semibold">
                              {checklist.filter((i) => i.isCompleted).length}
                            </div>
                            <div>Tâches terminées</div>
                          </div>
                          <div>
                            <div className="font-semibold">
                              {checklist.filter((i) => !i.isCompleted).length}
                            </div>
                            <div>Tâches en cours</div>
                          </div>
                          <div>
                            <div className="font-semibold">
                              {checklist.length > 0
                                ? Math.round(
                                    (checklist.filter((i) => i.isCompleted)
                                      .length /
                                      checklist.length) *
                                      100
                                  )
                                : 0}
                              %
                            </div>
                            <div>Taux de completion</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ajouter candidat */}
              {cardApplicationDetailSpet === 4 && (
                <div className="col-span-2 p-6 bg-white h-[calc(100vh-10px)] overflow-y-auto dark:bg-background">
                  <div className="space-y-6">
                    {/* En-tête */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-white">
                          Ajouter un candidat manuellement
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                          Créez une nouvelle candidature avec les informations
                          du candidat
                        </p>
                      </div>
                    </div>

                    {/* Formulaire d'ajout de candidat */}
                    <div className="space-y-6">
                      {/* Informations personnelles */}

                      {/* Upload des documents */}
                      <div className="bg-gray-50 rounded-lg p-4 dark:bg-background dark:border dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 dark:text-white">
                          Documents du candidat
                        </h3>
                        <div className="space-y-4">
                          <FileUpload
                            onUpload={(fileData: {
                              fileName: string;
                              fileUrl: string;
                              fileType: string;
                              fileSize: number;
                            }) => {
                              setUploadedDocuments((prev) => [
                                ...prev,
                                fileData,
                              ]);
                              // Mettre à jour cvPreview avec le premier document
                              if (uploadedDocuments.length === 0) {
                                setCvPreview(fileData.fileName);
                              }
                            }}
                            multiple={true}
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.ppt,.pptx"
                            disabled={isAddingCandidate}
                            buttonText="Sélectionner des documents"
                            bucket="kanbanAttachments"
                            className="w-full"
                          />

                          {/* {uploadedDocuments.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-white">
                                Documents uploadés ({uploadedDocuments.length})
                              </h4>
                              {uploadedDocuments.map((doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                                >
                                  <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <div className="flex-1">
                                    <span className="text-sm font-medium text-green-700">
                                      {doc.fileName}
                                    </span>
                                    <p className="text-xs text-green-600">
                                      {(doc.fileSize / 1024 / 1024).toFixed(2)}{" "}
                                      MB
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setUploadedDocuments((prev) =>
                                        prev.filter((_, i) => i !== index)
                                      );
                                      if (
                                        index === 0 &&
                                        uploadedDocuments.length > 1
                                      ) {
                                        setCvPreview(
                                          uploadedDocuments[1].fileName
                                        );
                                      } else if (
                                        uploadedDocuments.length === 1
                                      ) {
                                        setCvPreview("");
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )} */}
                        </div>
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                          onClick={handleSubmitNewCandidate}
                          disabled={isAddingCandidate}
                          className="flex-1 bg-primary text-white hover:bg-primary/90"
                        >
                          {isAddingCandidate ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Ajout en cours...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter le candidat
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={resetNewCandidateForm}
                          disabled={isAddingCandidate}
                          className="px-6"
                        >
                          Annuler
                        </Button>
                      </div>

                      {/* Candidats */}
                      <div className="border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold  mb-2">
                          CVs candidats
                        </h4>
                        <ul className="text-xs  space-y-1">
                          {candidatesData?.candidates.length > 0 ? (
                            candidatesData?.candidates?.map(
                              (candidate: any) => (
                                <li key={candidate.id}>
                                  <div className="flex items-center justify-between">
                                    <p className="text-gray-500 text-lg">
                                      {candidate.cv}{" "}
                                    </p>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        handleDownloadCV(candidate.cvUrl);
                                      }}
                                    >
                                      <Download className="h-20 w-20" />
                                    </Button>
                                  </div>
                                </li>
                              )
                            )
                          ) : (
                            <li>Aucun candidat trouvé</li>
                          )}
                        </ul>
                      </div>

                      {/* Informations d'aide */}
                      <div className=" border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold  mb-2">
                          Informations importantes
                        </h4>
                        <ul className="text-xs  space-y-1">
                          <li>
                            • Les champs marqués d'un astérisque (*) sont
                            obligatoires
                          </li>
                          <li>
                            • Le candidat sera automatiquement ajouté à la
                            première colonne du Kanban
                          </li>
                          <li>
                            • Un email de notification peut être envoyé au
                            candidat (selon configuration)
                          </li>
                          <li>
                            • Vous pourrez modifier ces informations après
                            création
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachment */}
              {cardApplicationDetailSpet === 5 && (
                <div className="col-span-2 p-6 bg-white dark:bg-background dark:border dark:border-gray-700">
                  {/* En-tête avec informations du candidat */}
                  <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 mb-6">
                    {/* Avatar et nom */}
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-primary to-primary/70 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-xl">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedOffer?.title}
                        </h1>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-semibold uppercase">
                          {
                            columns.find(
                              (col) => col.id === selectedCard.columnId
                            )?.name
                          }
                        </span>
                      </div>
                    </div>

                    {/* Documents téléchargeables */}
                    <div className="bg-gray-50 rounded-lg py-4 dark:bg-background">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 dark:text-white flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                      </h3>
                      {/* <p className="text-sm text-gray-500 mb-3 dark:text-gray-400">
                        {selectedOffer?.description}
                      </p> */}
                      <div
                        className="flex gap-2"
                        dangerouslySetInnerHTML={{
                          __html: selectedOffer?.description || "",
                        }}
                      />
                    </div>

                    {/* Informations supplémentaires */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Entreprise
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{selectedOffer?.company}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Localisation
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{selectedOffer?.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-white">
                          Pièces jointes
                        </h2>
                      </div>

                      {/* Composant FileUpload */}
                      <FileUpload
                        onUpload={async (fileData: any) => {
                          if (!selectedCard) return;

                          try {
                            // Créer l'objet fichier pour l'API
                            const apiFileData = {
                              fileName: fileData.fileName,
                              fileUrl: fileData.fileUrl,
                              fileType: fileData.fileType,
                              fileSize: fileData.fileSize,
                              uploadedByType: "RECRUTEUR",
                            };

                            // Sauvegarder dans la base de données via l'API
                            const response = await fetch(
                              `/api/recruteur/kanban/custom/applications/${selectedCard.id}/files`,
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify(apiFileData),
                              }
                            );

                            if (response.ok) {
                              const result = await response.json();
                              if (result.success) {
                                setApplicationFiles((prev) => [
                                  ...prev,
                                  result.data,
                                ]);

                                // Recharger les données pour s'assurer de la synchronisation
                                await queryoffresbyidrefetch();
                              } else {
                                alert(
                                  `Erreur lors de la sauvegarde: ${result.error}`
                                );
                              }
                            } else {
                              const errorData = await response.json();
                              alert(
                                `Erreur lors de la sauvegarde: ${
                                  errorData.error || "Erreur inconnue"
                                }`
                              );
                            }
                          } catch (error) {
                            console.error(
                              "Erreur lors de la sauvegarde:",
                              error
                            );
                            alert("Erreur lors de la sauvegarde du fichier");
                          }
                        }}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.ppt,.pptx"
                        multiple={true}
                        maxSize={10 * 1024 * 1024} // 10MB
                        disabled={!selectedCard}
                        buttonText="Ajouter des fichiers"
                        bucket="kanbanAttachments"
                      />

                      {/* Liste des pièces jointes */}
                      <div className="space-y-3">
                        {applicationFiles?.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-background rounded-full flex items-center justify-center">
                              <svg
                                className="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <p className="text-lg font-medium mb-2">
                              Aucune pièce jointe
                            </p>
                            <p className="text-sm text-gray-400">
                              Ajoutez des documents, images ou autres fichiers à
                              cette candidature
                            </p>
                          </div>
                        ) : (
                          applicationFiles
                            .sort(
                              (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime()
                            )
                            .map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-background rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                              >
                                {/* Icône du fichier */}
                                <div className="flex-shrink-0 dark:bg-background">
                                  {getFileIcon(file.fileType)}
                                </div>

                                {/* Informations du fichier */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                      {file.fileName}
                                    </h3>
                                    <span className="text-xs text-gray-500 bg-gray-200 dark:bg-background px-2 py-1 rounded">
                                      {file.fileType}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                    <span>{formatFileSize(file.fileSize)}</span>
                                    <span>•</span>
                                    <span>
                                      Ajouté le{" "}
                                      {new Date(
                                        file.createdAt
                                      ).toLocaleDateString("fr-FR")}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {file.uploadedByType === "RECRUTEUR"
                                        ? "Par vous"
                                        : "Par le candidat"}
                                    </span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(file.fileUrl, "_blank")
                                    }
                                    className="flex items-center gap-1"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                    Voir
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const link = document.createElement("a");
                                      link.href = file.fileUrl;
                                      link.download = file.fileName;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                    Télécharger
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteAttachment(file.id)
                                    }
                                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                    Supprimer
                                  </Button>
                                </div>
                              </div>
                            ))
                        )}
                      </div>

                      {/* Informations sur les types de fichiers acceptés */}
                      <div className="border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold  mb-2">
                          Types de fichiers acceptés
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs ">
                          <div>• PDF (.pdf)</div>
                          <div>• Word (.doc, .docx)</div>
                          <div>• Excel (.xls, .xlsx)</div>
                          <div>• PowerPoint (.ppt, .pptx)</div>
                          <div>• Images (.jpg, .jpeg, .png, .gif)</div>
                          <div>• Texte (.txt)</div>
                          <div>• Taille max: 10MB</div>
                          <div>• Plusieurs fichiers</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sidebar actions */}
              <div className="w-full bg-gray-50 border-l p-4 flex flex-col gap-2 dark:bg-background dark:border dark:border-gray-700">
                <div className="font-semibold text-xs text-gray-500 mb-2 dark:text-white">
                  SUGGERER
                </div>

                <button
                  onClick={() => setCardApplicationDetailSpet(1)}
                  className={`text-left text-sm hover:bg-primary/10 text-primary rounded px-2 py-1 ${
                    cardApplicationDetailSpet === 1 ? "bg-primary/10" : ""
                  }`}
                >
                  Accueil
                </button>
                <div className="font-semibold text-xs text-gray-500 mt-4 mb-2">
                  Ajouter à la carte
                </div>

                <button
                  onClick={() => setCardApplicationDetailSpet(2)}
                  className={`text-left text-sm hover:bg-primary/10 text-primary rounded px-2 py-1 ${
                    cardApplicationDetailSpet === 2 ? "bg-primary/10" : ""
                  }`}
                >
                  Discussion
                </button>
                <button
                  onClick={() => setCardApplicationDetailSpet(3)}
                  className={`text-left text-sm hover:bg-primary/10 text-primary rounded px-2 py-1 ${
                    cardApplicationDetailSpet === 3 ? "bg-primary/10" : ""
                  }`}
                >
                  Checklist
                </button>

                <button
                  onClick={() => setCardApplicationDetailSpet(4)}
                  className={`text-left text-sm hover:bg-primary/10 text-primary rounded px-2 py-1 ${
                    cardApplicationDetailSpet === 4 ? "bg-primary/10" : ""
                  }`}
                >
                  Ajouter candidat
                </button>

                <button
                  onClick={() => setCardApplicationDetailSpet(5)}
                  className={`text-left text-sm hover:bg-primary/10 text-primary rounded px-2 py-1 ${
                    cardApplicationDetailSpet === 5 ? "bg-primary/10" : ""
                  }`}
                >
                  Attachment
                </button>

                <div className="font-semibold text-xs text-gray-500 mt-4 mb-2">
                  Gestion
                </div>

                <button
                  onClick={() => handleOpenAssignModal(selectedCard!)}
                  className="text-left text-sm hover:bg-primary/10 text-primary rounded px-2 py-1 flex items-center gap-2"
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="m22 21-2-2" />
                    <path d="M16 16h6" />
                  </svg>
                  Affecter collaborateurs
                </button>

                <button
                  onClick={() => handleOpenDueDateModal(selectedCard!)}
                  className={`text-left text-sm hover:bg-primary/10 text-primary rounded px-2 py-1 flex items-center gap-2 ${
                    selectedCard?.duedate ? "text-orange-600" : ""
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {selectedCard?.duedate
                    ? "Modifier échéance"
                    : "Définir échéance"}
                </button>

                <button
                  onClick={() => handleRefuseCandidate(selectedCard!)}
                  className={`text-left text-sm hover:bg-primary/10 text-primary rounded px-2 py-1 flex items-center gap-2`}
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {/* {selectedCard?.duedate
                      ? "Modifier échéance"
                      : "Définir échéance"} */}
                  Refuser la candidature
                </button>

                {/* Affichage de la date d'échéance */}
                {selectedCard?.duedate && (
                  <div className="mt-4">
                    <div className="font-semibold text-xs text-gray-500 mb-2">
                      DATE D'ÉCHÉANCE
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                      {(() => {
                        const dueDateStatus = getDueDateStatus(
                          selectedCard.duedate
                        );
                        if (!dueDateStatus) return null;

                        return (
                          <div
                            className={`flex items-center gap-2 text-xs font-medium ${dueDateStatus.color}`}
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>
                              {new Date(
                                selectedCard.duedate
                              ).toLocaleDateString("fr-FR")}
                            </span>
                            {dueDateStatus.status === "overdue" && (
                              <span className="text-red-600">
                                • En retard ({dueDateStatus.days}j)
                              </span>
                            )}
                            {dueDateStatus.status === "today" && (
                              <span className="text-orange-600">
                                • Aujourd'hui
                              </span>
                            )}
                            {dueDateStatus.status === "urgent" && (
                              <span className="text-yellow-600">
                                • Urgent ({dueDateStatus.days}j)
                              </span>
                            )}
                            {dueDateStatus.status === "upcoming" && (
                              <span className="text-green-600">
                                • {dueDateStatus.days}j restants
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Affichage des collaborateurs affectés */}
                {selectedCard?.collaborateurs &&
                  selectedCard.collaborateurs.length > 0 && (
                    <div className="mt-4">
                      <div className="font-semibold text-xs text-gray-500 mb-2">
                        COLLABORATEURS AFFECTÉS
                      </div>
                      <div className="space-y-2">
                        {selectedCard.collaborateurs.map((assignment: any) => (
                          <div
                            key={assignment.id}
                            className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/20"
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-xs">
                              {assignment.collaborateur.prenom.slice(0, 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-900 truncate">
                                {assignment.collaborateur.prenom}{" "}
                                {assignment.collaborateur.nom}
                              </div>
                              <div className="text-xs text-gray-500">
                                {assignment.collaborateur.role}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 bg-transparent   hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  handleDeleteCollaborator(assignment.id);
                                }}
                                disabled={isDeletingCollaborator}
                              >
                                {isDeletingCollaborator ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de création d'offre */}
      <Dialog
        open={isNewOfferModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseOfferModal();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle offre</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle offre d'emploi à votre tableau Kanban.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateOffer)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du poste *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Développeur Full Stack"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entreprise</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'entreprise" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localisation</FormLabel>
                      <FormControl>
                        <Input placeholder="Ville, Pays" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez le poste..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormDescription>
                      Utilisez l'éditeur riche pour formater votre description
                      avec du texte en gras, italique, des listes, des liens,
                      etc.
                    </FormDescription>
                    <FormControl>
                      <RichTextEditorWrapper
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Décrivez le poste en détail avec un formatage riche..."
                        className="bg-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseOfferModal}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer l'offre"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de création de colonne */}
      <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle colonne</DialogTitle>
            <DialogDescription>
              Ajoutez une colonne à votre tableau Kanban pour organiser vos
              offres.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de la colonne</label>
              <Input
                placeholder="Ex: En attente, En cours, Finalisée..."
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Couleur</label>
              <div className="grid grid-cols-4 gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColumnColor(color.value)}
                    className={`h-10 rounded-md ${color.value} border-2 ${
                      selectedColumnColor === color.value
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsColumnModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateColumn}
              disabled={!newColumnName.trim()}
            >
              Créer la colonne
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de suppression de colonne */}
      <Dialog
        open={isDeleteColumnModalOpen}
        onOpenChange={setIsDeleteColumnModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer la colonne</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la colonne "
              {columnToDelete?.name}" ?
              {jobOffers.filter(
                (offer) => offer.columnId === columnToDelete?.id
              ).length > 0 && (
                <span className="block mt-2 text-orange-600">
                  Les offres de cette colonne seront déplacées vers la première
                  colonne.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteColumnModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                columnToDelete && handleDeleteColumn(columnToDelete.id)
              }
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'affectation de collaborateurs */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Affecter des collaborateurs</DialogTitle>
            <DialogDescription>
              Sélectionnez les collaborateurs à affecter à cette candidature.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isLoadingCollaborators ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Chargement des collaborateurs...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableCollaborators.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center p-4">
                    Aucun collaborateur disponible
                  </p>
                ) : (
                  availableCollaborators.map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`collab-${collaborator.id}`}
                        checked={selectedCollaborators.includes(
                          collaborator.id
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCollaborators([
                              ...selectedCollaborators,
                              collaborator.id,
                            ]);
                          } else {
                            setSelectedCollaborators(
                              selectedCollaborators.filter(
                                (id) => id !== collaborator.id
                              )
                            );
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor={`collab-${collaborator.id}`}
                        className="flex-1 text-sm"
                      >
                        <div className="font-medium">
                          {collaborator.prenom} {collaborator.nom}
                        </div>
                        <div className="text-gray-500">
                          {collaborator.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          {collaborator.role}
                        </div>
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedCollaborators([]);
              }}
              disabled={isAssigningCollaborators}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAssignCollaborators}
              disabled={
                isAssigningCollaborators || selectedCollaborators.length === 0
              }
            >
              {isAssigningCollaborators ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Affectation...
                </>
              ) : (
                `Affecter (${selectedCollaborators.length})`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de date d'échéance */}
      <Dialog open={isDueDateModalOpen} onOpenChange={setIsDueDateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Définir une échéance</DialogTitle>
            <DialogDescription>
              Choisissez une date limite pour cette candidature.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Date d'échéance
              </label>
              <input
                type="date"
                value={selectedDueDate}
                onChange={(e) => setSelectedDueDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {selectedDueDate && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  Échéance prévue:{" "}
                  {new Date(selectedDueDate).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDueDateModalOpen(false);
                setSelectedDueDate("");
              }}
              disabled={isUpdatingDueDate}
            >
              Annuler
            </Button>
            {selectedCard?.duedate && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDueDate("");
                  handleUpdateDueDate();
                }}
                disabled={isUpdatingDueDate}
                className="text-red-600 hover:text-red-700"
              >
                Supprimer l'échéance
              </Button>
            )}
            <Button
              onClick={handleUpdateDueDate}
              disabled={isUpdatingDueDate || !selectedDueDate}
            >
              {isUpdatingDueDate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Définir l'échéance"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
