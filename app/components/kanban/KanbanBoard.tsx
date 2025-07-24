"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  MoreVertical,
  RefreshCcw,
  Calendar as CalendarIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { useQuery } from "@tanstack/react-query";
import { deleteData, fetchDataById, postData, putData } from "@/utils/utilts";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/store/userStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEdgeStore } from "@/lib/edgestore";
import { FileUpload } from "@/components/ui/file-upload";

// Types
type KanbanColumn = {
  color: string;
  createdAt?: string;
  id?: string;
  isDefault?: boolean;
  jobOfferId?: string;
  name: string;
  order?: number;
  updatedAt?: string;
};

type Note = {
  id?: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorType: string;
  createdAt?: string;
};

type Collaborateur = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type ApplicationCollaborateur = {
  id: string;
  collaborateur: Collaborateur;
  assignedAt: string;
  assignedBy: string;
};

type Collaborateurs = {
  id: string;
  collaborateur: Collaborateur;
  assignedAt: string;
  assignedBy: string;
};

type Application = {
  id: string;
  candidat: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    competences: string[];
    competencesList: { competence: string }[];
    cv: string;
    letterm: string;
  };
  note?: string;
  rating?: number;
  message?: string;
  cv?: string;
  createdAt: string;
  columnId: string;
  duedate?: string | null;
  notes: Note[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  files: ApplicationFile[];
  collaborateurs: Collaborateurs[];
  // assignedCollaborateurs?: ApplicationCollaborateur[];
};

type ChecklistItem = {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  applicationId: string;
  createdById: string;
  createdByType: string;
  createdAt: string;
  updatedAt: string;
};

type Attachment = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedById: string;
  uploadedByType: string;
  createdAt: string;
  updatedAt: string;
};

type ApplicationFile = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedById: string;
  uploadedByType: string;
  createdAt: string;
  updatedAt: string;
};

// Couleurs disponibles pour les colonnes
const availableColors = [
  { value: "bg-blue-300/30", label: "Bleu" },
  { value: "bg-green-300/30", label: "Vert" },
  { value: "bg-pink-300/30", label: "Rose" },
  { value: "bg-yellow-300/30", label: "Jaune" },
  { value: "bg-purple-300/30", label: "Violet" },
  { value: "bg-red-300/30", label: "Rouge" },
];

// Fonction utilitaire pour couleur aléatoire
function getRandomColor() {
  const colors = [
    "#F59E42", // orange
    "#60A5FA", // blue
    "#34D399", // green
    "#F472B6", // pink
    "#FACC15", // yellow
    "#A78BFA", // purple
    "#F87171", // red
    "#38BDF8", // sky
    "#4ADE80", // emerald
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function KanbanBoard({
  offerId,
  selectedCardId,
  onCardSelect,
  queryoffresbyidrefetchP,
  applications: externalApplications,
  updateApplication,
}: {
  offerId: string;
  selectedCardId?: string | null;
  onCardSelect?: (cardId: string | null) => void;
  queryoffresbyidrefetchP: () => void;
  applications?: Application[];
  updateApplication?: (applicationId: string, updates: any) => void;
}) {
  const { user } = useUserStore();
  const { edgestore } = useEdgeStore();

  const {
    data: queryoffresbyid,
    refetch: queryoffresbyidrefetch,
    isPending: queryoffresbyidrefetchisPending,
    isLoading,
  } = useQuery({
    queryKey: ["queryoffresbyid2", offerId],
    queryFn: () => fetchDataById(`/api/recruteur/offres/${offerId}`),
    staleTime: 30000, // Les données sont considérées comme fraîches pendant 30 secondes
    gcTime: 60000, // Les données sont gardées en cache pendant 1 minute
  });

  console.log("queryoffresbyid", queryoffresbyid);

  // Hook WebSocket pour les mises à jour en temps réel
  const { socket, isConnected } = useWebSocket({
    offerId,
    enabled: true,
  });

  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("bg-blue-300/30");
  const [visibleAddColumn, setVisibleAddColumn] = useState<boolean>(false);

  // Ajout des états pour la modal de détail de carte
  const [selectedCard, setSelectedCard] = useState<Application | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  // État pour la gestion des colonnes
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [newColumn, setNewColumn] = useState<Partial<KanbanColumn>>({
    id: "",
    name: "",
    color: "bg-blue-300",
  });

  const [isReordering, setIsReordering] = useState(false);

  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<KanbanColumn | null>(
    null
  );

  const [cardNote, setCardNote] = useState("");

  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);
  const [isUpdatingChecklistItem, setIsUpdatingChecklistItem] = useState(false);
  const [isEditingChecklistItem, setIsEditingChecklistItem] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] =
    useState<ChecklistItem | null>(null);
  const [editingChecklistTitle, setEditingChecklistTitle] = useState("");
  const [editingChecklistDescription, setEditingChecklistDescription] =
    useState("");

  const [cardApplicationDetailSpet, setCardApplicationDetailSpet] = useState(1);

  // États pour les pièces jointes
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [applicationFiles, setApplicationFiles] = useState<ApplicationFile[]>(
    []
  );
  const [isUpdatingMessage, setIsUpdatingMessage] = useState(false);

  // États pour l'affectation des collaborateurs
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [assignedCollaborateurs, setAssignedCollaborateurs] = useState<
    ApplicationCollaborateur[]
  >([]);
  const [selectedCollaborateurs, setSelectedCollaborateurs] = useState<
    string[]
  >([]);
  const [isLoadingCollaborateurs, setIsLoadingCollaborateurs] = useState(false);
  const [isAssigningCollaborateurs, setIsAssigningCollaborateurs] =
    useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // États pour la date d'échéance
  const [isDueDateModalOpen, setIsDueDateModalOpen] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>(
    undefined
  );
  const [isUpdatingDueDate, setIsUpdatingDueDate] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Gestion des événements WebSocket
  useEffect(() => {
    if (!socket || !isConnected()) return;

    // Écouter les événements de déplacement d'application
    const handleApplicationMoved = (data: {
      applicationId: string;
      newColumnId: string;
      application: Application;
    }) => {
      console.log("Application déplacée via WebSocket:", data);
      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === data.applicationId
            ? { ...data.application, columnId: data.newColumnId }
            : app
        )
      );
    };

    // Écouter les événements de mise à jour d'application
    const handleApplicationUpdated = (data: {
      applicationId: string;
      application: Application;
    }) => {
      console.log("Application mise à jour via WebSocket:", data);
      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === data.applicationId ? data.application : app
        )
      );
    };

    // Écouter les événements de mise à jour de date d'échéance
    const handleDuedateUpdated = (data: {
      applicationId: string;
      duedate: string | null;
      offerId: string;
    }) => {
      console.log("Date d'échéance mise à jour via WebSocket:", data);
      queryoffresbyidrefetchP();
      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === data.applicationId
            ? { ...app, duedate: data.duedate }
            : app
        )
      );

      // Mettre à jour les applications externes si la fonction est fournie
      if (updateApplication) {
        updateApplication(data.applicationId, { duedate: data.duedate });
      }
    };

    // Écouter les événements de nouvelle application
    const handleApplicationCreated = (data: { application: Application }) => {
      console.log("Nouvelle application via WebSocket:", data);
      setApplications((prevApps) => [...prevApps, data.application]);
    };

    // Écouter les événements de suppression d'application
    const handleApplicationDeleted = (data: { applicationId: string }) => {
      console.log("Application supprimée via WebSocket:", data);
      setApplications((prevApps) =>
        prevApps.filter((app) => app.id !== data.applicationId)
      );
    };

    // Écouter les événements de notes
    const handleNoteAdded = (data: {
      applicationId: string;
      note: any;
      offerId: string;
    }) => {
      console.log("Note ajoutée via WebSocket:", data);
      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === data.applicationId
            ? { ...app, notes: [data.note, ...app.notes] }
            : app
        )
      );
    };

    const handleNoteUpdated = (data: {
      applicationId: string;
      note: any;
      offerId: string;
    }) => {
      console.log("Note modifiée via WebSocket:", data);
      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === data.applicationId
            ? {
                ...app,
                notes: app.notes.map((note) =>
                  note.id === data.note.id ? data.note : note
                ),
              }
            : app
        )
      );
    };

    // S'abonner aux événements
    socket.on("application:moved", handleApplicationMoved);
    socket.on("application:updated", handleApplicationUpdated);
    socket.on("duedate:updated", handleDuedateUpdated);
    socket.on("application:created", handleApplicationCreated);
    socket.on("application:deleted", handleApplicationDeleted);
    socket.on("note:added", handleNoteAdded);
    socket.on("note:updated", handleNoteUpdated);

    // Joindre la room pour cette offre
    socket.emit("join:offer", offerId);

    return () => {
      socket.off("application:moved", handleApplicationMoved);
      socket.off("application:updated", handleApplicationUpdated);
      socket.off("duedate:updated", handleDuedateUpdated);
      socket.off("application:created", handleApplicationCreated);
      socket.off("application:deleted", handleApplicationDeleted);
      socket.off("note:added", handleNoteAdded);
      socket.off("note:updated", handleNoteUpdated);
      socket.emit("leave:offer", offerId);
    };
  }, [socket, isConnected, offerId]);

  // Mettre à jour les états locaux quand les données changent
  useEffect(() => {
    if (queryoffresbyid?.data?.[0]) {
      setColumns(queryoffresbyid.data[0].kanbanColumns || []);
      setApplications(queryoffresbyid.data[0].applications || []);
    }
  }, [queryoffresbyid?.data]);

  // Mettre à jour la checklist quand une carte est sélectionnée
  useEffect(() => {
    if (selectedCard) {
      setChecklist(selectedCard.checklist || []);
    }
  }, [selectedCard]);

  // Mettre à jour les attachments quand une carte est sélectionnée
  useEffect(() => {
    if (selectedCard) {
      setAttachments(selectedCard.attachments || []);
    }
  }, [selectedCard]);

  // Mettre à jour les fichiers de l'application quand une carte est sélectionnée
  useEffect(() => {
    if (selectedCard) {
      setApplicationFiles(selectedCard.files || []);
    }
  }, [selectedCard?.files]);

  // Synchroniser les fichiers quand les données de l'application changent
  useEffect(() => {
    if (selectedCard && applications.length > 0) {
      const updatedApplication = applications.find(
        (app) => app.id === selectedCard.id
      );
      if (updatedApplication && updatedApplication.files) {
        setApplicationFiles(updatedApplication.files);
      }
    }
  }, [applications, selectedCard?.id]);

  // Synchroniser la carte sélectionnée avec les données mises à jour
  useEffect(() => {
    if (selectedCard && applications.length > 0) {
      const updatedCard = applications.find(
        (app) => app.id === selectedCard.id
      );
      if (updatedCard) {
        console.log("updatedCard", updatedCard);
        setSelectedCard(updatedCard);
      }
    }
  }, [applications, selectedCard?.id]);

  // Effet pour mettre en surbrillance la carte sélectionnée depuis le calendrier
  useEffect(() => {
    if (selectedCardId && applications.length > 0) {
      const cardToHighlight = applications.find(
        (app) => app.id === selectedCardId
      );
      if (cardToHighlight) {
        setSelectedCard(cardToHighlight);
        setIsCardModalOpen(true);
        // Effacer la sélection après un délai
        setTimeout(() => {
          onCardSelect?.(null);
        }, 2000);
      }
    }
  }, [selectedCardId, applications, onCardSelect]);

  const handleAddColumn = async () => {
    if (!newColumn.name) return;

    const column: KanbanColumn = {
      name: newColumn.name,
      color: selectedColor || "bg-blue-300",
      order: columns.length + 1,
      jobOfferId: offerId,
    };

    try {
      setIsAdding(true);
      const response = await postData(column, "/api/recruteur/kanban");
      if (response.sucess) {
        setVisibleAddColumn(false);
        setNewColumn({ id: "", name: "", color: "bg-blue-300/30" });
        queryoffresbyidrefetch();
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la colonne:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditColumn = async () => {
    if (!editingColumn) return;

    const column: KanbanColumn = {
      name: editingColumn.name,
      color: editingColumn.color || "bg-blue-300",
      jobOfferId: offerId,
    };

    try {
      setIsEditing(true);
      const response = await putData(
        column,
        `/api/recruteur/kanban/${editingColumn.id}`
      );
      if (response.sucess) {
        setIsColumnDialogOpen(false);
        setEditingColumn(null);
        queryoffresbyidrefetch();
      }
    } catch (error) {
      console.error("Erreur lors de la modification de la colonne:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!columnId) return;

    try {
      setIsDeleting(true);
      const response = await deleteData(`/api/recruteur/kanban/${columnId}`);
      if (response) {
        setIsDeleteModalOpen(false);
        setColumnToDelete(null);
        queryoffresbyidrefetch();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la colonne:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (type === "column") {
      setIsReordering(true);
      const newColumns = Array.from(columns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);

      // Mettre à jour l'état local immédiatement
      setColumns(
        newColumns.map((col, index) => ({
          ...col,
          order: index + 1,
        }))
      );

      // Mettre à jour l'API en arrière-plan
      try {
        const response = await postData(
          {
            columns: newColumns.map((col, index) => ({
              id: col.id,
              name: col.name,
              color: col.color,
              order: index + 1,
              jobOfferId: col.jobOfferId,
            })),
          },
          "/api/recruteur/kanban/update-order"
        );

        if (!response.success) {
          // En cas d'erreur, revenir à l'état précédent
          await queryoffresbyidrefetch();
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'ordre:", error);
        await queryoffresbyidrefetch();
      } finally {
        setIsReordering(false);
      }
    } else {
      // Optimiser le déplacement des candidatures
      const sourceColumn = columns.find((col) => col.id === source.droppableId);
      const destColumn = columns.find(
        (col) => col.id === destination.droppableId
      );

      if (!sourceColumn || !destColumn) return;

      // Sauvegarder l'état précédent pour rollback en cas d'erreur
      const previousApplications = [...applications];

      // Mettre à jour l'état local immédiatement (mise à jour optimiste)
      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === draggableId ? { ...app, columnId: destColumn.id! } : app
        )
      );

      // Mettre à jour l'API en arrière-plan
      try {
        const response = await postData(
          {
            applicationId: draggableId,
            newColumnId: destination.droppableId,
            sourceColumnId: source.droppableId,
          },
          "/api/recruteur/kanban/move-application"
        );

        if (!response.success) {
          // En cas d'erreur, revenir à l'état précédent
          setApplications(previousApplications);
          console.error("Erreur lors du déplacement:", response.error);
        }
        // Si succès, ne pas refetch - l'état local est déjà correct
        // et les WebSockets mettront à jour si nécessaire
      } catch (error) {
        console.error("Erreur lors du déplacement de la candidature:", error);
        // En cas d'erreur, revenir à l'état précédent
        setApplications(previousApplications);
      }
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setCardNote(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setCardNote("");
  };

  const handleNoteSubmit = async () => {
    if (!selectedCard || !cardNote.trim()) return;
    console.log("handleNoteSubmit - selectedCard:", selectedCard);
    console.log("handleNoteSubmit - cardNote:", cardNote);
    setIsUpdatingMessage(true);

    try {
      if (editingNote) {
        // Modification d'une note existante
        console.log("Modification d'une note existante:", editingNote);
        const response = await fetch(
          `/api/recruteur/kanban/application/${selectedCard.id}/notes/${editingNote.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: cardNote }),
          }
        );

        if (response.ok) {
          const responseData = await response.json();
          console.log("Réponse modification note:", responseData);

          // Mettre à jour l'état local avec la réponse de l'API
          if (responseData.note) {
            const updatedNotes = selectedCard.notes.map((note) =>
              note.id === editingNote.id ? responseData.note : note
            );

            setSelectedCard({ ...selectedCard, notes: updatedNotes });

            // Mettre à jour aussi l'état global des applications
            setApplications((prevApplications) =>
              prevApplications.map((app) =>
                app.id === selectedCard.id
                  ? { ...app, notes: updatedNotes }
                  : app
              )
            );
          }

          setCardNote("");
          setEditingNote(null);
        } else {
          throw new Error("Erreur lors de la modification de la note");
        }
      } else {
        // Création d'une nouvelle note
        console.log("Création d'une nouvelle note");
        const response = await putData(
          { notes: cardNote },
          `/api/recruteur/kanban/application/${selectedCard.id}`
        );

        console.log("Réponse création note:", response);

        if (response.success && response.application) {
          console.log("Application mise à jour:", response.application);
          console.log("Notes de l'application:", response.application.notes);

          // Mettre à jour immédiatement l'état local avec la réponse de l'API
          const updatedNotes = response.application.notes || [];
          setSelectedCard({
            ...selectedCard,
            notes: updatedNotes,
          });

          // Mettre à jour aussi l'état global des applications
          setApplications((prevApplications) =>
            prevApplications.map((app) =>
              app.id === selectedCard.id ? { ...app, notes: updatedNotes } : app
            )
          );

          setCardNote("");

          // Forcer le rechargement des données après un délai pour s'assurer de la synchronisation
          setTimeout(() => {
            console.log("Rechargement des données pour synchronisation...");
            queryoffresbyidrefetch();
          }, 500);
        } else {
          throw new Error("Erreur lors de l'ajout de la note");
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout/modification de la note:", error);
      // En cas d'erreur, recharger les données
      queryoffresbyidrefetch();
    } finally {
      setIsUpdatingMessage(false);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim() || !selectedCard) return;

    try {
      setIsAddingChecklistItem(true);
      const response = await postData(
        { title: newChecklistItem },
        `/api/recruteur/kanban/application/${selectedCard.id}/checklist`
      );

      if (response.success) {
        setNewChecklistItem("");
        queryoffresbyidrefetch();
        if (selectedCard) {
          setSelectedCard({
            ...selectedCard,
            checklist: [
              ...selectedCard.checklist,
              {
                id: response.data.id,
                title: newChecklistItem,
                isCompleted: false,
                applicationId: selectedCard.id,
                createdById: user?.id || "",
                createdByType: "recruteur",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          });
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout de l'élément à la checklist:",
        error
      );
    } finally {
      setIsAddingChecklistItem(false);
    }
  };

  const handleToggleChecklistItem = async (itemId: string) => {
    if (!selectedCard) return;

    try {
      setIsUpdatingChecklistItem(true);
      const item = checklist.find((i) => i.id === itemId);
      if (!item) return;

      // Mettre à jour l'état local immédiatement
      setChecklist((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i
        )
      );

      // Mettre à jour selectedCard
      if (selectedCard) {
        setSelectedCard({
          ...selectedCard,
          checklist: selectedCard.checklist.map((i) =>
            i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i
          ),
        });
      }

      const response = await putData(
        { isCompleted: !item.isCompleted },
        `/api/recruteur/kanban/application/${selectedCard.id}/checklist/${itemId}`
      );

      if (!response.success) {
        // En cas d'erreur, revenir à l'état précédent
        queryoffresbyidrefetch();
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de l'élément de la checklist:",
        error
      );
      // En cas d'erreur, revenir à l'état précédent
      queryoffresbyidrefetch();
    } finally {
      setIsUpdatingChecklistItem(false);
    }
  };

  const handleResetChecklist = async () => {
    if (!selectedCard) return;

    try {
      setIsUpdatingChecklistItem(true);

      // Mettre à jour l'état local immédiatement
      setChecklist((prev) =>
        prev.map((item) => ({ ...item, isCompleted: false }))
      );

      // Mettre à jour selectedCard
      if (selectedCard) {
        setSelectedCard({
          ...selectedCard,
          checklist: selectedCard.checklist.map((item) => ({
            ...item,
            isCompleted: false,
          })),
        });
      }

      // Mettre à jour chaque élément dans l'API
      const updatePromises = checklist
        .filter((item) => item.isCompleted)
        .map((item) =>
          putData(
            { isCompleted: false },
            `/api/recruteur/kanban/application/${selectedCard.id}/checklist/${item.id}`
          )
        );

      const results = await Promise.all(updatePromises);

      // Si une mise à jour échoue, recharger les données
      if (results.some((result) => !result.success)) {
        queryoffresbyidrefetch();
      }
    } catch (error) {
      console.error(
        "Erreur lors de la réinitialisation de la checklist:",
        error
      );
      queryoffresbyidrefetch();
    } finally {
      setIsUpdatingChecklistItem(false);
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!selectedCard) return;

    try {
      setIsUpdatingChecklistItem(true);
      const response = await deleteData(
        `/api/recruteur/kanban/application/${selectedCard.id}/checklist/${itemId}`
      );

      if (response.success) {
        setChecklist((prev) => prev.filter((item) => item.id !== itemId));
        setSelectedCard({
          ...selectedCard,
          checklist: selectedCard.checklist.filter(
            (item) => item.id !== itemId
          ),
        });
        queryoffresbyidrefetch();
      }
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de l'élément de la checklist:",
        error
      );
    } finally {
      setIsUpdatingChecklistItem(false);
    }
  };

  const handleEditChecklistItem = (item: ChecklistItem) => {
    setEditingChecklistItem(item);
    setEditingChecklistTitle(item.title);
    setEditingChecklistDescription(item.description || "");
    setIsEditingChecklistItem(true);
  };

  const handleCancelEditChecklistItem = () => {
    setEditingChecklistItem(null);
    setEditingChecklistTitle("");
    setEditingChecklistDescription("");
    setIsEditingChecklistItem(false);
  };

  const handleUpdateChecklistItem = async () => {
    if (!selectedCard || !editingChecklistItem || !editingChecklistTitle.trim())
      return;

    try {
      setIsUpdatingChecklistItem(true);

      // Mettre à jour l'état local immédiatement
      setChecklist((prev) =>
        prev.map((item) =>
          item.id === editingChecklistItem.id
            ? {
                ...item,
                title: editingChecklistTitle,
                description: editingChecklistDescription,
              }
            : item
        )
      );

      // Mettre à jour selectedCard
      if (selectedCard) {
        setSelectedCard({
          ...selectedCard,
          checklist: selectedCard.checklist.map((item) =>
            item.id === editingChecklistItem.id
              ? {
                  ...item,
                  title: editingChecklistTitle,
                  description: editingChecklistDescription,
                }
              : item
          ),
        });
      }

      const response = await putData(
        {
          title: editingChecklistTitle,
          description: editingChecklistDescription,
        },
        `/api/recruteur/kanban/application/${selectedCard.id}/checklist/${editingChecklistItem.id}`
      );

      if (!response.success) {
        // En cas d'erreur, revenir à l'état précédent
        queryoffresbyidrefetch();
      } else {
        // Réinitialiser l'état d'édition
        handleCancelEditChecklistItem();
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de l'élément de la checklist:",
        error
      );
      // En cas d'erreur, revenir à l'état précédent
      queryoffresbyidrefetch();
    } finally {
      setIsUpdatingChecklistItem(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!selectedCard) return;

    try {
      // Trouver le fichier à supprimer
      const fileToDelete = applicationFiles.find(
        (file) => file.id === attachmentId
      );

      if (!fileToDelete) {
        alert("Fichier non trouvé");
        return;
      }

      // Supprimer le fichier d'EdgeStore si c'est une URL EdgeStore
      if (fileToDelete.fileUrl && fileToDelete.fileUrl.includes("edgestore")) {
        try {
          // Extraire l'URL du fichier EdgeStore
          const fileUrl = fileToDelete.fileUrl;

          // Supprimer le fichier d'EdgeStore
          await edgestore.kanbanAttachments.delete({
            url: fileUrl,
          });

          console.log("Fichier EdgeStore supprimé:", fileUrl);
        } catch (edgeStoreError) {
          console.error(
            "Erreur lors de la suppression EdgeStore:",
            edgeStoreError
          );
          // On continue même si la suppression EdgeStore échoue
        }
      }

      // Supprimer de la base de données
      const response = await fetch(
        `/api/recruteur/kanban/application/attachment/${attachmentId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        setApplicationFiles((prev) =>
          prev.filter((file) => file.id !== attachmentId)
        );

        // Mettre à jour selectedCard
        if (selectedCard) {
          setSelectedCard({
            ...selectedCard,
            files: selectedCard.files.filter(
              (file) => file.id !== attachmentId
            ),
          });
        }

        // Recharger les données pour s'assurer de la synchronisation
        await queryoffresbyidrefetch();
      } else {
        alert(`Erreur lors de la suppression: ${result.error}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du fichier");
    }
  };

  const handleDownloadCV = (cvPath: string) => {
    // Ici, vous implémenteriez la logique de téléchargement
    console.log("Téléchargement du CV:", cvPath);

    window.open(cvPath, "_blank");
  };

  const handleDownloadLettreMotivation = (cvPath: string) => {
    if (cvPath) {
      window.open(cvPath, "_blank");
    }
  };

  // Fonctions pour gérer l'affectation des collaborateurs
  const loadCollaborateurs = async () => {
    setIsLoadingCollaborateurs(true);
    try {
      const response = await fetch("/api/recruteur/collaborateurs");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCollaborateurs(data.data);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des collaborateurs:", error);
    } finally {
      setIsLoadingCollaborateurs(false);
    }
  };

  const loadAssignedCollaborateurs = async (applicationId: string) => {
    try {
      const response = await fetch(
        `/api/recruteur/kanban/application/assign-collaborateurs?applicationId=${applicationId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssignedCollaborateurs(data.data);
          setSelectedCollaborateurs(
            data.data.map(
              (assignment: ApplicationCollaborateur) =>
                assignment.collaborateur.id
            )
          );
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des collaborateurs affectés:",
        error
      );
    }
  };

  const handleAssignCollaborateurs = async () => {
    if (!selectedCard) return;

    setIsAssigningCollaborateurs(true);
    try {
      const response = await fetch(
        "/api/recruteur/kanban/application/assign-collaborateurs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId: selectedCard.id,
            collaborateurIds: selectedCollaborateurs,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Recharger les collaborateurs affectés
          await loadAssignedCollaborateurs(selectedCard.id);

          // Recharger toutes les données pour s'assurer de la cohérence
          await queryoffresbyidrefetch();

          setIsAssignModalOpen(false);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'affectation des collaborateurs:", error);
    } finally {
      setIsAssigningCollaborateurs(false);
    }
  };

  const handleOpenAssignModal = async (card: Application) => {
    setSelectedCard(card);
    setIsAssignModalOpen(true);
    await loadCollaborateurs();
    await loadAssignedCollaborateurs(card.id);
  };

  // desassigner un collaborateur
  const [isDeletingCollaborator, setIsDeletingCollaborator] = useState(false);
  const handleDeleteCollaborator = async (collaboratorId: string) => {
    if (!selectedCard) return;

    setIsDeletingCollaborator(true);
    try {
      await deleteData(
        `/api/recruteur/kanban/application/assign-collaborateurs?assignmentId=${collaboratorId}`
      );

      // Mettre à jour l'état local immédiatement
      const updatedCollaborateurs = selectedCard.collaborateurs.filter(
        (collab) => collab.id !== collaboratorId
      );

      // Mettre à jour la carte sélectionnée
      setSelectedCard((prev) =>
        prev
          ? {
              ...prev,
              collaborateurs: updatedCollaborateurs,
            }
          : null
      );

      // Mettre à jour la liste des applications
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === selectedCard.id
            ? { ...app, collaborateurs: updatedCollaborateurs }
            : app
        )
      );

      // Recharger les données depuis l'API pour s'assurer de la cohérence
      await queryoffresbyidrefetch();
    } catch (error) {
      console.error("Erreur lors de la suppression du collaborateur:", error);
    } finally {
      setIsDeletingCollaborator(false);
    }
  };

  // Fonctions pour gérer la date d'échéance
  const handleOpenDueDateModal = (card: Application) => {
    setSelectedCard(card);
    setSelectedDueDate(card.duedate ? new Date(card.duedate) : undefined);
    setIsCalendarOpen(false);
    setIsDueDateModalOpen(true);
  };

  const handleUpdateDueDate = async () => {
    if (!selectedCard) return;

    setIsUpdatingDueDate(true);
    try {
      const response = await fetch(
        `/api/recruteur/kanban/application/${selectedCard.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            duedate: selectedDueDate ? selectedDueDate.toISOString() : null,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Mettre à jour l'état local immédiatement
          const updatedCard = {
            ...selectedCard,
            duedate: selectedDueDate ? selectedDueDate.toISOString() : null,
          };

          setSelectedCard(updatedCard);

          // Mettre à jour la liste des applications
          setApplications((prevApplications) =>
            prevApplications.map((app) =>
              app.id === selectedCard.id ? updatedCard : app
            )
          );

          // Mettre à jour les applications externes si la fonction est fournie
          if (updateApplication) {
            updateApplication(selectedCard.id, {
              duedate: selectedDueDate ? selectedDueDate.toISOString() : null,
            });
          }

          // Recharger les données depuis l'API pour synchroniser avec le CalendarView
          await queryoffresbyidrefetch();

          setIsDueDateModalOpen(false);
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de la date d'échéance:",
        error
      );
    } finally {
      setIsUpdatingDueDate(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDueDate(date);
    if (date) {
      setIsCalendarOpen(false);
    }
  };

  const handleRemoveDueDate = async () => {
    if (!selectedCard) return;

    setIsUpdatingDueDate(true);
    try {
      const response = await fetch(
        `/api/recruteur/kanban/application/${selectedCard.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            duedate: null,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Mettre à jour l'état local immédiatement
          const updatedCard = {
            ...selectedCard,
            duedate: null,
          };

          setSelectedCard(updatedCard);

          // Mettre à jour la liste des applications
          setApplications((prevApplications) =>
            prevApplications.map((app) =>
              app.id === selectedCard.id ? updatedCard : app
            )
          );

          // Mettre à jour les applications externes si la fonction est fournie
          if (updateApplication) {
            updateApplication(selectedCard.id, { duedate: null });
          }

          // Recharger les données depuis l'API pour synchroniser avec le CalendarView
          await queryoffresbyidrefetch();

          setIsDueDateModalOpen(false);
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la date d'échéance:",
        error
      );
    } finally {
      setIsUpdatingDueDate(false);
    }
  };

  // Fonction utilitaire pour calculer le statut de la date d'échéance
  const getDueDateStatus = (duedate: string | null) => {
    if (!duedate) return null;

    const dueDate = new Date(duedate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: "overdue",
        days: Math.abs(diffDays),
        color: "text-red-600 bg-red-50",
      };
    } else if (diffDays === 0) {
      return {
        status: "today",
        days: 0,
        color: "text-orange-600 bg-orange-50",
      };
    } else if (diffDays <= 3) {
      return {
        status: "urgent",
        days: diffDays,
        color: "text-yellow-600 bg-yellow-50",
      };
    } else {
      return {
        status: "upcoming",
        days: diffDays,
        color: "text-green-600 bg-green-50",
      };
    }
  };

  if (isLoading || isReordering || queryoffresbyidrefetchisPending) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (queryoffresbyid?.data?.[0].kanbanColumns) {
    return (
      <div className=" space-y-6 w-full h-screen overflow-auto mt-10">
        {/* Breadcrumb */}

        <div className="flex gap-6 overflow-x-auto  pb-4">
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
                      const columnApps = applications.filter(
                        (app) => app.columnId === column.id
                      );
                      return (
                        <Draggable
                          key={column.id}
                          draggableId={column.id || "temp-id"}
                          index={index}
                        >
                          {(provided: DraggableProvided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex-shrink-0 w-72  rounded-2xl  p-3 ${column.color} flex flex-col min-h-[400px] h-full`}
                            >
                              {/* Colonne header */}
                              <div
                                className="flex items-center justify-between mb-3"
                                {...provided.dragHandleProps}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-lg">
                                    {column.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="bg-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium">
                                    {columnApps.length}
                                  </span>

                                  <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button
                                          className="p-1 hover:bg-gray-100 rounded"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingColumn(column);
                                            setIsColumnDialogOpen(true);
                                          }}
                                        >
                                          <svg
                                            width="16"
                                            height="16"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            className="mr-2"
                                          >
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                          </svg>
                                          Modifier
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setColumnToDelete(column);
                                            setIsDeleteModalOpen(true);
                                          }}
                                          className="text-red-500"
                                        >
                                          <svg
                                            width="16"
                                            height="16"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            className="mr-2"
                                          >
                                            <path d="M3 6h18" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                          </svg>
                                          Supprimer
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                              {/* Cartes */}
                              <Droppable droppableId={column.id || "temp-id"}>
                                {(provided: DroppableProvided) => (
                                  <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-4 flex-1"
                                  >
                                    {columnApps.map((application, idx) => {
                                      // Couleur aléatoire pour le tag
                                      const tagColor = getRandomColor();
                                      // Priorité aléatoire pour la démo
                                      const priorities = [
                                        {
                                          label: "High",
                                          color: "bg-red-100 text-red-700",
                                        },
                                        {
                                          label: "Medium",
                                          color:
                                            "bg-yellow-100 text-yellow-700",
                                        },
                                        {
                                          label: "Low",
                                          color: "bg-green-100 text-green-700",
                                        },
                                      ];
                                      const priority =
                                        priorities[
                                          Math.floor(
                                            Math.random() * priorities.length
                                          )
                                        ];
                                      return (
                                        <Draggable
                                          key={application.id}
                                          draggableId={application.id}
                                          index={idx}
                                        >
                                          {(provided: DraggableProvided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col gap-2 hover:shadow-md transition-shadow min-h-[120px] cursor-pointer dark:bg-background dark:border-gray-700"
                                              onClick={() => {
                                                setSelectedCard(application);
                                                setIsCardModalOpen(true);
                                                console.log(
                                                  "Carte sélectionnée:",
                                                  application
                                                );
                                                console.log(
                                                  "Notes de la carte:",
                                                  application.notes
                                                );
                                                // Charger les collaborateurs affectés
                                                loadAssignedCollaborateurs(
                                                  application.id
                                                );
                                                // setDescription(
                                                //   application.note || ""
                                                // );
                                                console.log(application);
                                              }}
                                            >
                                              {/* ID et priorité */}
                                              <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                  OZS-{application.id.slice(-1)}
                                                </span>
                                                <span
                                                  className={`text-xs font-semibold px-2 py-0.5 rounded ${priority.color}`}
                                                >
                                                  {priority.label}
                                                </span>
                                              </div>
                                              {/* Titre */}
                                              <div className="font-semibold text-blue-700 text-base">
                                                {application.candidat.nom}{" "}
                                                {application.candidat.prenom}
                                              </div>
                                              {/* Description */}
                                              <div className="text-xs text-gray-500">
                                                {application.message ||
                                                  application.note ||
                                                  "Aucune description."}
                                              </div>
                                              {/* Tags */}
                                              <div className="flex flex-wrap gap-2 mt-1">
                                                <span
                                                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                                                  style={{
                                                    backgroundColor: tagColor,
                                                    color: "#fff",
                                                  }}
                                                >
                                                  {column.name}
                                                </span>
                                              </div>
                                              {/* Date d'échéance */}
                                              {application.duedate && (
                                                <div className="mt-2">
                                                  {(() => {
                                                    const dueDateStatus =
                                                      getDueDateStatus(
                                                        application.duedate
                                                      );
                                                    if (!dueDateStatus)
                                                      return null;

                                                    return (
                                                      <div
                                                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${dueDateStatus.color}`}
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
                                                        {dueDateStatus.status ===
                                                          "overdue" && (
                                                          <span>
                                                            En retard (
                                                            {dueDateStatus.days}
                                                            j)
                                                          </span>
                                                        )}
                                                        {dueDateStatus.status ===
                                                          "today" && (
                                                          <span>
                                                            Aujourd'hui
                                                          </span>
                                                        )}
                                                        {dueDateStatus.status ===
                                                          "urgent" && (
                                                          <span>
                                                            Urgent (
                                                            {dueDateStatus.days}
                                                            j)
                                                          </span>
                                                        )}
                                                        {dueDateStatus.status ===
                                                          "upcoming" && (
                                                          <span>
                                                            {dueDateStatus.days}
                                                            j restants
                                                          </span>
                                                        )}
                                                      </div>
                                                    );
                                                  })()}
                                                </div>
                                              )}
                                              {/* Footer : assigné, commentaires, pièces jointes */}
                                              <div className="flex items-center justify-between mt-2">
                                                {/* Collaborateurs affectés */}
                                                <div className="flex items-center gap-1">
                                                  {application.collaborateurs &&
                                                  application.collaborateurs
                                                    .length > 0 ? (
                                                    <div className="flex -space-x-1">
                                                      {application.collaborateurs
                                                        .slice(0, 3)
                                                        .map((assignment) => (
                                                          <div
                                                            key={assignment.id}
                                                            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                                                            title={`${assignment.collaborateur.prenom} ${assignment.collaborateur.nom}`}
                                                          >
                                                            {assignment.collaborateur.nom.slice(
                                                              0,
                                                              1
                                                            )}
                                                            {assignment.collaborateur.prenom.slice(
                                                              0,
                                                              1
                                                            )}
                                                          </div>
                                                        ))}
                                                      {application
                                                        .collaborateurs.length >
                                                        3 && (
                                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white">
                                                          +
                                                          {application
                                                            .collaborateurs
                                                            .length - 3}
                                                        </div>
                                                      )}
                                                    </div>
                                                  ) : (
                                                    <span className="bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold border">
                                                      {application.candidat.nom.slice(
                                                        0,
                                                        1
                                                      )}
                                                      {application.candidat.prenom?.slice(
                                                        0,
                                                        1
                                                      )}
                                                    </span>
                                                  )}
                                                </div>

                                                <div className="flex items-center gap-2 text-gray-400">
                                                  {/* Bouton d'affectation des collaborateurs */}
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleOpenAssignModal(
                                                        application
                                                      );
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                    title="Affecter des collaborateurs"
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
                                                      <circle
                                                        cx="9"
                                                        cy="7"
                                                        r="4"
                                                      />
                                                      <path d="m22 21-2-2" />
                                                      <path d="M16 16h6" />
                                                    </svg>
                                                  </button>

                                                  {/* Bouton de date d'échéance */}
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleOpenDueDateModal(
                                                        application
                                                      );
                                                    }}
                                                    className={`p-1 hover:bg-gray-100 rounded transition-colors ${
                                                      application.duedate
                                                        ? "text-orange-500"
                                                        : ""
                                                    }`}
                                                    title={
                                                      application.duedate
                                                        ? "Modifier la date d'échéance"
                                                        : "Définir une date d'échéance"
                                                    }
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
                                                  </button>

                                                  {/* Icône pièce jointe */}
                                                  <svg
                                                    width="16"
                                                    height="16"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path d="M21 15V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8" />
                                                    <rect
                                                      width="16"
                                                      height="12"
                                                      x="4"
                                                      y="7"
                                                      rx="2"
                                                    />
                                                    <path d="M16 3v4" />
                                                  </svg>
                                                  {/* Icône commentaire */}
                                                  <svg
                                                    width="16"
                                                    height="16"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                  </svg>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    })}
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

          <div className="flex-1 relative">
            <Button
              className="bg-transparent border border-dashed border-gray-300 text-gray-500 hover:bg-transparent hover:text-primary hover:border-primary"
              onClick={() => setVisibleAddColumn(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une étape
            </Button>

            {visibleAddColumn && (
              <div className="absolute top-10 w-72 right-0 bg-white p-4 rounded-lg shadow-md ">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      Ajouter une étape
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full mt-4">
                  <div className="w-full">
                    <Input
                      type="text"
                      placeholder="Titre de l'étape"
                      className="w-full bg-transparent"
                      value={newColumn.name}
                      onChange={(e) =>
                        setNewColumn({
                          ...newColumn,
                          name: e.target.value, // TODO: add validation
                        })
                      }
                    />

                    <div className="grid grid-cols-3 items-center gap-2 mt-2 ">
                      {availableColors.map((color) => (
                        <div
                          onClick={() => setSelectedColor(color.value)}
                          key={color.value}
                          className={` w-full h-10 rounded-md  ${color.value} ${
                            selectedColor === color.value
                              ? "border-2 border-primary"
                              : ""
                          }`}
                        ></div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-2 w-full ">
                      <Button onClick={handleAddColumn} disabled={isAdding}>
                        {isAdding ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Ajout en cours...
                          </>
                        ) : (
                          "Ajouter"
                        )}
                      </Button>
                      <Button
                        type="button"
                        className="bg-gray-100 text-gray-500 hover:bg-gray-200"
                        onClick={() => setVisibleAddColumn(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de détail de carte */}
        <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
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
                        <div className="bg-gradient-to-br from-primary to-primary/70 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-xl">
                          {selectedCard.candidat.nom.slice(0, 1)}
                          {selectedCard.candidat.prenom?.slice(0, 1)}
                        </div>
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedCard.candidat.nom}{" "}
                            {selectedCard.candidat.prenom}
                          </h1>
                          <p className="text-primary font-medium">
                            {selectedCard.candidat.email}
                          </p>
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

                      {/* Compétences */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white ">
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCard.candidat.competencesList?.map(
                            (competence) => (
                              <span
                                key={competence.competence}
                                className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                              >
                                {competence.competence}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Documents téléchargeables */}
                      <div className="bg-gray-50 rounded-lg py-4 dark:bg-background">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 dark:text-white ">
                          Documents
                        </h3>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() =>
                              handleDownloadCV(selectedCard.candidat.cv || "")
                            }
                            disabled={!selectedCard.candidat.cv}
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
                            {selectedCard.cv
                              ? "Télécharger CV"
                              : "CV non disponible"}
                          </Button>
                          {selectedCard.message && (
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                              onClick={() =>
                                handleDownloadLettreMotivation(
                                  selectedCard.candidat.letterm || ""
                                )
                              }
                              disabled={!selectedCard.candidat.letterm}
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
                              Télécharger Lettre
                            </Button>
                          )}
                        </div>
                        {!selectedCard.candidat.cv && (
                          <p className="text-xs text-gray-500 mt-2">
                            Aucun CV n'a été fourni par le candidat
                          </p>
                        )}
                      </div>

                      {/* Informations supplémentaires */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white">
                            Informations de contact
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span>{selectedCard.candidat.email}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white">
                            Statut de candidature
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>
                                Candidature reçue le{" "}
                                {new Date(
                                  selectedCard.createdAt
                                ).toLocaleDateString("fr-FR")}
                              </span>
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
                            (a, b) =>
                              new Date(b.createdAt || "").getTime() -
                              new Date(a.createdAt || "").getTime()
                          )
                          .slice(0, 3)
                          .map((note) => (
                            <div
                              key={note.id}
                              className={`flex gap-3 ${
                                user?.id === note.authorId
                                  ? "flex-row-reverse"
                                  : ""
                              }`}
                            >
                              {/* Avatar */}
                              <div
                                className={`flex-shrink-0 ${
                                  user?.id === note.authorId ? "ml-3" : "mr-3"
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-sm">
                                  {user?.id === note.authorId
                                    ? user?.name?.[0]?.toUpperCase() || "U"
                                    : note.authorType === "RECRUTEUR"
                                    ? "R"
                                    : "C"}
                                </div>
                              </div>

                              {/* Message bubble */}
                              <div
                                className={`flex-1 max-w-xs ${
                                  user?.id === note.authorId ? "text-right" : ""
                                }`}
                              >
                                <div
                                  className={`inline-block p-3 rounded-2xl ${
                                    user?.id === note.authorId
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
                                    user?.id === note.authorId
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {note.authorName ||
                                      (user?.id === note.authorId
                                        ? user?.name || "Vous"
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
                                  {user?.id === note.authorId && (
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
                          <p className="text-sm">
                            Aucun message pour le moment
                          </p>
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
                        <div className="bg-gradient-to-br from-primary to-primary/70 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-xl">
                          {selectedCard.candidat.nom.slice(0, 1)}
                          {selectedCard.candidat.prenom?.slice(0, 1)}
                        </div>
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedCard.candidat.nom}{" "}
                            {selectedCard.candidat.prenom}
                          </h1>
                          <p className="text-primary font-medium">
                            {selectedCard.candidat.email}
                          </p>
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

                      {/* Compétences */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white">
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCard.candidat.competencesList?.map(
                            (competence) => (
                              <span
                                key={competence.competence}
                                className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                              >
                                {competence.competence}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Documents téléchargeables */}
                      <div className="bg-gray-50 rounded-lg dark:bg-background  ">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 dark:text-white">
                          Documents
                        </h3>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() =>
                              handleDownloadCV(selectedCard.candidat.cv || "")
                            }
                            disabled={!selectedCard.candidat.cv}
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
                            {selectedCard.cv
                              ? "Télécharger CV"
                              : "CV non disponible"}
                          </Button>
                          {selectedCard.message && (
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                              onClick={() => {
                                handleDownloadLettreMotivation(
                                  selectedCard.candidat.letterm || ""
                                );
                              }}
                              disabled={!selectedCard.candidat.letterm}
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
                              Télécharger Lettre
                            </Button>
                          )}
                        </div>
                        {!selectedCard.candidat.cv && (
                          <p className="text-xs text-gray-500 mt-2">
                            Aucun CV n'a été fourni par le candidat
                          </p>
                        )}
                      </div>

                      {/* Informations supplémentaires */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white">
                            Informations de contact
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span>{selectedCard.candidat.email}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            Statut de candidature
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>
                                Candidature reçue le{" "}
                                {new Date(
                                  selectedCard.createdAt
                                ).toLocaleDateString("fr-FR")}
                              </span>
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
                                (a, b) =>
                                  new Date(b.createdAt || "").getTime() -
                                  new Date(a.createdAt || "").getTime()
                              )
                              .map((note) => (
                                <div
                                  key={note.id}
                                  className={`flex gap-3 ${
                                    user?.id === note.authorId
                                      ? "flex-row-reverse"
                                      : ""
                                  }`}
                                >
                                  {/* Avatar */}
                                  <div
                                    className={`flex-shrink-0 ${
                                      user?.id === note.authorId
                                        ? "ml-3"
                                        : "mr-3"
                                    }`}
                                  >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-sm">
                                      {user?.id === note.authorId
                                        ? user?.name?.[0]?.toUpperCase() || "U"
                                        : note.authorType === "RECRUTEUR"
                                        ? "R"
                                        : "C"}
                                    </div>
                                  </div>

                                  {/* Message bubble */}
                                  <div
                                    className={`flex-1 max-w-xs ${
                                      user?.id === note.authorId
                                        ? "text-right"
                                        : ""
                                    }`}
                                  >
                                    <div
                                      className={`inline-block p-3 rounded-2xl ${
                                        user?.id === note.authorId
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
                                        user?.id === note.authorId
                                          ? "justify-end"
                                          : "justify-start"
                                      }`}
                                    >
                                      <span className="font-medium">
                                        {note.authorName ||
                                          (user?.id === note.authorId
                                            ? user?.name || "Vous"
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
                                      {user?.id === note.authorId && (
                                        <>
                                          <span>•</span>
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() =>
                                                handleEditNote(note)
                                              }
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
                        <div className="bg-gradient-to-br from-primary to-primary/70 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-xl">
                          {selectedCard.candidat.nom.slice(0, 1)}
                          {selectedCard.candidat.prenom?.slice(0, 1)}
                        </div>
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold text-gray-900">
                            {selectedCard.candidat.nom}{" "}
                            {selectedCard.candidat.prenom}
                          </h1>
                          <p className="text-primary font-medium">
                            {selectedCard.candidat.email}
                          </p>
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

                      {/* Compétences */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white">
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCard.candidat.competencesList?.map(
                            (competence) => (
                              <span
                                key={competence.competence}
                                className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                              >
                                {competence.competence}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Documents téléchargeables */}
                      <div className="bg-gray-50 rounded-lg dark:bg-background ">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 dark:text-white">
                          Documents
                        </h3>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() =>
                              handleDownloadCV(selectedCard.candidat.cv || "")
                            }
                            disabled={!selectedCard.candidat.cv}
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
                            {selectedCard.cv
                              ? "Télécharger CV"
                              : "CV non disponible"}
                          </Button>
                          {selectedCard.message && (
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                              onClick={() => {
                                handleDownloadLettreMotivation(
                                  selectedCard.candidat.letterm || ""
                                );
                              }}
                              disabled={!selectedCard.candidat.letterm}
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
                              Télécharger Lettre
                            </Button>
                          )}
                        </div>
                        {!selectedCard.candidat.cv && (
                          <p className="text-xs text-gray-500 mt-2">
                            Aucun CV n'a été fourni par le candidat
                          </p>
                        )}
                      </div>

                      {/* Informations supplémentaires */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white">
                            Informations de contact
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span>{selectedCard.candidat.email}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white">
                            Statut de candidature
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>
                                Candidature reçue le{" "}
                                {new Date(
                                  selectedCard.createdAt
                                ).toLocaleDateString("fr-FR")}
                              </span>
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
                              : checklist.filter((i) => i.isCompleted)
                                  .length === checklist.length
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
                            onChange={(e) =>
                              setNewChecklistItem(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                newChecklistItem.trim()
                              ) {
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
                                              onClick={
                                                handleUpdateChecklistItem
                                              }
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
                                        {editingChecklistItem?.id !==
                                          item.id && (
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
                                                handleDeleteChecklistItem(
                                                  item.id
                                                )
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
                                          {user?.id === item.createdById
                                            ? user?.name?.[0]?.toUpperCase() ||
                                              "U"
                                            : "U"}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {user?.id === item.createdById
                                          ? user?.name || "Vous"
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
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-blue-800 mb-2">
                            Statistiques
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-blue-700">
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

                {/* Attachment */}
                {cardApplicationDetailSpet === 5 && (
                  <div className="col-span-2 p-6 bg-white dark:bg-background dark:border dark:border-gray-700">
                    {/* En-tête avec informations du candidat */}
                    <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 mb-6">
                      {/* Avatar et nom */}
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-primary to-primary/70 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-xl">
                          {selectedCard.candidat.nom.slice(0, 1)}
                          {selectedCard.candidat.prenom?.slice(0, 1)}
                        </div>
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedCard.candidat.nom}{" "}
                            {selectedCard.candidat.prenom}
                          </h1>
                          <p className="text-primary font-medium">
                            {selectedCard.candidat.email}
                          </p>
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

                      {/* Compétences */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-white mb-2">
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCard.candidat.competencesList?.map(
                            (competence) => (
                              <span
                                key={competence.competence}
                                className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                              >
                                {competence.competence}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Documents téléchargeables */}
                      <div className="bg-gray-50 rounded-lg dark:bg-background ">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 dark:text-white">
                          Documents
                        </h3>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() =>
                              handleDownloadCV(selectedCard.candidat.cv || "")
                            }
                            disabled={!selectedCard.candidat.cv}
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
                            {selectedCard.cv
                              ? "Télécharger CV"
                              : "CV non disponible"}
                          </Button>
                          {selectedCard.message && (
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                              onClick={() => {
                                handleDownloadLettreMotivation(
                                  selectedCard.candidat.letterm || ""
                                );
                              }}
                              disabled={!selectedCard.candidat.letterm}
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
                              Télécharger Lettre
                            </Button>
                          )}
                        </div>
                        {!selectedCard.candidat.cv && (
                          <p className="text-xs text-gray-500 mt-2">
                            Aucun CV n'a été fourni par le candidat
                          </p>
                        )}
                      </div>

                      {/* Informations supplémentaires */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white">
                            Informations de contact
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span>{selectedCard.candidat.email}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2 dark:text-white">
                            Statut de candidature
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>
                                Candidature reçue le{" "}
                                {new Date(
                                  selectedCard.createdAt
                                ).toLocaleDateString("fr-FR")}
                              </span>
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
                          onUpload={async (fileData) => {
                            if (!selectedCard) return;

                            try {
                              // Créer l'objet fichier pour l'API
                              const apiFileData = {
                                ...fileData,
                                uploadedById: user?.id || "",
                                uploadedByType: "RECRUTEUR",
                                applicationId: selectedCard.id,
                              };

                              // Sauvegarder dans la base de données via l'API
                              const response = await fetch(
                                "/api/recruteur/kanban/application/attachment",
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

                                  // Mettre à jour selectedCard
                                  if (selectedCard) {
                                    setSelectedCard({
                                      ...selectedCard,
                                      files: [
                                        ...selectedCard.files,
                                        result.data,
                                      ],
                                    });
                                  }

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
                                  `Erreur lors de la sauvegarde: ${errorData.error}`
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
                          {applicationFiles.length === 0 ? (
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
                                Ajoutez des documents, images ou autres fichiers
                                à cette candidature
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
                                      <span>
                                        {formatFileSize(file.fileSize)}
                                      </span>
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
                                        const link =
                                          document.createElement("a");
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
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-blue-800 mb-2">
                            Types de fichiers acceptés
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-700">
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
                          {selectedCard.collaborateurs.map((assignment) => (
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

        {/* Modal de modification de colonne */}
        <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier la colonne</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  type="text"
                  placeholder="Nom de la colonne"
                  value={editingColumn?.name || ""}
                  onChange={(e) =>
                    setEditingColumn(
                      editingColumn
                        ? { ...editingColumn, name: e.target.value }
                        : null
                    )
                  }
                />
                <div className="grid grid-cols-3 items-center gap-2 mt-2">
                  {availableColors.map((color) => (
                    <div
                      onClick={() =>
                        setEditingColumn(
                          editingColumn
                            ? { ...editingColumn, color: color.value }
                            : null
                        )
                      }
                      key={color.value}
                      className={`w-full h-10 rounded-md ${color.value} ${
                        editingColumn?.color === color.value
                          ? "border-2 border-primary"
                          : ""
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsColumnDialogOpen(false)}
                disabled={isEditing}
              >
                Annuler
              </Button>
              <Button onClick={handleEditColumn} disabled={isEditing}>
                {isEditing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Modification...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmation de suppression */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Supprimer la colonne</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer la colonne "
                {columnToDelete?.name}" ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setColumnToDelete(null);
                }}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button
                onClick={() =>
                  columnToDelete && handleDeleteColumn(columnToDelete.id!)
                }
                variant="destructive"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal d'affectation des collaborateurs */}
        <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Affecter des collaborateurs</DialogTitle>
              <DialogDescription>
                Sélectionnez les collaborateurs à affecter à cette candidature.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Informations sur la candidature */}
              {selectedCard && (
                <div className="bg-gray-50 rounded-lg p-4 dark:bg-background dark:border dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 mb-2 dark:text-white">
                    Candidature de {selectedCard.candidat.prenom}{" "}
                    {selectedCard.candidat.nom}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-white">
                    {selectedCard.candidat.email}
                  </p>
                </div>
              )}

              {/* Liste des collaborateurs */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 dark:text-white">
                  Collaborateurs disponibles
                </h4>
                {isLoadingCollaborateurs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-gray-600">Chargement...</span>
                  </div>
                ) : collaborateurs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm">Aucun collaborateur disponible</p>
                    <p className="text-xs text-gray-400">
                      Invitez des collaborateurs depuis votre dashboard
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {collaborateurs.map((collaborateur) => (
                      <label
                        key={collaborateur.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCollaborateurs.includes(
                            collaborateur.id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCollaborateurs([
                                ...selectedCollaborateurs,
                                collaborateur.id,
                              ]);
                            } else {
                              setSelectedCollaborateurs(
                                selectedCollaborateurs.filter(
                                  (id) => id !== collaborateur.id
                                )
                              );
                            }
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-sm">
                          {collaborateur.prenom.slice(0, 1)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {collaborateur.prenom} {collaborateur.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {collaborateur.email}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {collaborateur.role}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Collaborateurs actuellement affectés */}
              {assignedCollaborateurs.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Collaborateurs actuellement affectés
                  </h4>
                  <div className="space-y-2">
                    {assignedCollaborateurs.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                          {assignment.collaborateur.prenom.slice(0, 1)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {assignment.collaborateur.prenom}{" "}
                            {assignment.collaborateur.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            Affecté le{" "}
                            {new Date(assignment.assignedAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          Affecté
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAssignModalOpen(false)}
                disabled={isAssigningCollaborateurs}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAssignCollaborateurs}
                disabled={isAssigningCollaborateurs || isLoadingCollaborateurs}
              >
                {isAssigningCollaborateurs ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Affectation...
                  </>
                ) : (
                  "Affecter les collaborateurs"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de date d'échéance */}
        <Dialog open={isDueDateModalOpen} onOpenChange={setIsDueDateModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Date d'échéance</DialogTitle>
              <DialogDescription>
                Définissez une date d'échéance pour cette candidature.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Informations sur la candidature */}
              {selectedCard && (
                <div className="bg-gray-50 rounded-lg p-4 dark:bg-background dark:border dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 mb-2 dark:text-white">
                    Candidature de {selectedCard.candidat.prenom}{" "}
                    {selectedCard.candidat.nom}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedCard.candidat.email}
                  </p>
                </div>
              )}

              {/* Sélection de la date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'échéance
                </label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDueDate ? (
                        format(selectedDueDate, "PPP", { locale: fr })
                      ) : (
                        <span className="text-muted-foreground">
                          Sélectionner une date
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                      <Calendar
                        mode="single"
                        selected={selectedDueDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                        locale={fr}
                      />
                    </div>
                    {selectedDueDate && (
                      <div className="p-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDueDate(undefined);
                            setIsCalendarOpen(false);
                          }}
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Effacer la date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500 mt-1">
                  Sélectionnez une date pour définir l'échéance de cette
                  candidature
                </p>
              </div>

              {/* Affichage de la date actuelle si elle existe */}
              {selectedCard?.duedate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-background dark:border dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2 dark:text-white">
                    Date d'échéance actuelle
                  </h4>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
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
                    <span className="text-sm text-blue-700">
                      {new Date(selectedCard.duedate).toLocaleDateString(
                        "fr-FR"
                      )}
                    </span>
                    {(() => {
                      const dueDateStatus = getDueDateStatus(
                        selectedCard.duedate
                      );
                      if (!dueDateStatus) return null;

                      return (
                        <span
                          className={`text-xs px-2 py-1 rounded ${dueDateStatus.color}`}
                        >
                          {dueDateStatus.status === "overdue" &&
                            `En retard (${dueDateStatus.days}j)`}
                          {dueDateStatus.status === "today" && "Aujourd'hui"}
                          {dueDateStatus.status === "urgent" &&
                            `Urgent (${dueDateStatus.days}j)`}
                          {dueDateStatus.status === "upcoming" &&
                            `${dueDateStatus.days}j restants`}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              {selectedCard?.duedate && (
                <Button
                  variant="outline"
                  onClick={handleRemoveDueDate}
                  disabled={isUpdatingDueDate}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isUpdatingDueDate ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Supprimer"
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsDueDateModalOpen(false)}
                disabled={isUpdatingDueDate}
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpdateDueDate}
                disabled={isUpdatingDueDate || selectedDueDate === undefined}
              >
                {isUpdatingDueDate ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

// Fonctions utilitaires pour les fichiers
const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) {
    return (
      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center dark:bg-background">
        <svg
          className="w-6 h-6 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  } else if (type.includes("doc") || type.includes("word")) {
    return (
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center dark:bg-background">
        <svg
          className="w-6 h-6 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  } else if (type.includes("excel")) {
    return (
      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center dark:bg-background">
        <svg
          className="w-6 h-6 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  } else if (type.includes("powerpoint")) {
    return (
      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center dark:bg-background">
        <svg
          className="w-6 h-6 text-yellow-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  } else if (type.includes("image")) {
    return (
      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center dark:bg-background">
        <svg
          className="w-6 h-6 text-pink-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  } else if (type.includes("text")) {
    return (
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center dark:bg-background">
        <svg
          className="w-6 h-6 text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  } else {
    return (
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center dark:bg-background">
        <svg
          className="w-6 h-6 text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
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
