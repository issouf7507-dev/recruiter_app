"use client";

import { use, useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Plus, Loader2, MoreVertical, RefreshCcw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
import { Textarea } from "@/components/ui/textarea";

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
  id: string;
  content: string;
  authorId: string;
  authorType: string;
  createdAt?: string;
};

type Application = {
  id: string;
  candidat: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    competences: string[];
    cv: string;
    letterm: string;
  };
  note?: string;
  rating?: number;
  message?: string;
  cv?: string;
  createdAt: string;
  columnId: string;
  notes: Note[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  files: ApplicationFile[];
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

export default function KanbanBoard({ offerId }: { offerId: string }) {
  const { user } = useUserStore();

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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // États pour les pièces jointes
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [applicationFiles, setApplicationFiles] = useState<ApplicationFile[]>(
    []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
  }, [selectedCard]);

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

      // Mettre à jour l'état local immédiatement
      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === draggableId ? { ...app, columnId: destColumn.id! } : app
        )
      );

      // Mettre à jour l'API en arrière-plan
      try {
        await postData(
          {
            applicationId: draggableId,
            newColumnId: destination.droppableId,
            sourceColumnId: source.droppableId,
          },
          "/api/recruteur/kanban/move-application"
        ).then((res) => {
          if (res.success) {
            queryoffresbyidrefetch();
          }
        });

        // if (!response.success) {
        //   // En cas d'erreur, revenir à l'état précédent
        //   await queryoffresbyidrefetch();
        // }
      } catch (error) {
        console.error("Erreur lors du déplacement de la candidature:", error);
        await queryoffresbyidrefetch();
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

  const handleDeleteNote = async (noteId: string) => {
    setNoteToDelete(noteId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteNote = async () => {
    if (!selectedCard || !noteToDelete) return;

    try {
      const updatedNotes = selectedCard.notes.filter(
        (note) => note.id !== noteToDelete
      );
      const updatedCard: Application = {
        ...selectedCard,
        notes: updatedNotes,
      };

      setSelectedCard(updatedCard);

      await putData(
        { notes: updatedNotes },
        `/api/recruteur/kanban/application/${selectedCard.id}`
      );

      setShowDeleteDialog(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la note:", error);
    }
  };

  const handleNoteSubmit = async () => {
    if (!selectedCard) return;

    try {
      const newNote: Note = {
        id: editingNote?.id || Date.now().toString(),
        content: cardNote,
        authorId: user?.id || "",
        authorType: "recruteur",
        createdAt: new Date().toISOString(),
      };

      let updatedNotes: Note[];
      if (editingNote) {
        // Modification d'une note existante
        updatedNotes = selectedCard.notes.map((note) =>
          note.id === editingNote.id ? newNote : note
        );
      } else {
        // Ajout d'une nouvelle note
        updatedNotes = [...selectedCard.notes, newNote];
      }

      const updatedCard: Application = {
        ...selectedCard,
        notes: updatedNotes,
      };

      setSelectedCard(updatedCard);
      setCardNote("");
      setEditingNote(null);

      await putData(
        { notes: updatedNotes },
        `/api/recruteur/kanban/application/${selectedCard.id}`
      );
    } catch (error) {
      console.error("Erreur lors de l'ajout/modification de la note:", error);
    }
  };

  // console.log(user);
  // console.log(selectedCard?.notes);

  const handleEditNoteSubmit = async () => {
    if (!editingNote) return;

    try {
      const response = await postData(
        editingNote,
        "/api/recruteur/kanban/application"
      );
      if (response.success) {
        setEditingNote(null);
        queryoffresbyidrefetch();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la note:", error);
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

  // Fonctions pour gérer les pièces jointes
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || !selectedCard) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Vérifier la taille du fichier (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(
            `Le fichier ${file.name} est trop volumineux. Taille maximum: 10MB`
          );
          continue;
        }

        // Créer un FormData pour l'upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("applicationId", selectedCard.id);
        formData.append("uploadedById", user?.id || "");
        formData.append("uploadedByType", "RECRUTEUR");

        // Simuler le progrès d'upload
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        const response = await fetch(
          "/api/recruteur/kanban/application/attachment",
          {
            method: "POST",
            body: formData,
          }
        );

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setApplicationFiles((prev) => [...prev, result.data]);

            // Mettre à jour selectedCard
            if (selectedCard) {
              setSelectedCard({
                ...selectedCard,
                files: [...selectedCard.files, result.data],
              });
            }
          } else {
            alert(`Erreur lors de l'upload de ${file.name}: ${result.error}`);
          }
        } else {
          const errorData = await response.json();
          alert(`Erreur lors de l'upload de ${file.name}: ${errorData.error}`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Erreur lors de l'upload des fichiers");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Réinitialiser l'input file
      event.target.value = "";
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!selectedCard) return;

    try {
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
    console.log("LettreMotivation", cvPath);

    window.open(cvPath, "_blank");
  };

  // http://localhost:3000/api/recruteur/kanban/application/cmbwshkzd0017i3feveqcqwcs/checklist/1749948261866

  if (isLoading || isReordering || queryoffresbyidrefetchisPending) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (queryoffresbyid?.data?.[0].kanbanColumns) {
    return (
      <div className=" space-y-6 w-full h-screen overflow-auto">
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
                                              className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col gap-2 hover:shadow-md transition-shadow min-h-[120px] cursor-pointer"
                                              onClick={() => {
                                                setSelectedCard(application);
                                                setIsCardModalOpen(true);
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
                                              {/* Footer : assigné, commentaires, pièces jointes */}
                                              <div className="flex items-center justify-between mt-2">
                                                {/* Assigné */}
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
                                                <div className="flex items-center gap-2 text-gray-400">
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
          <DialogContent className="max-w-6xl w-full p-0 overflow-hidden h-[calc(100vh-20px)] ">
            {selectedCard && (
              <div className="grid grid-cols-3 w-full h-full">
                {/* Partie principale */}
                {cardApplicationDetailSpet === 1 && (
                  <div className="col-span-2 p-6 bg-white h-[calc(100vh-10px)] overflow-y-auto">
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
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCard.candidat.competences.map(
                            (competence) => (
                              <span
                                key={competence}
                                className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                              >
                                {competence}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Documents téléchargeables */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
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
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">
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

                    {/* Section Discussion */}
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        {editingNote ? "Modifier la note" : "Discussion"}
                      </h2>

                      <div className="flex items-center gap-2 mb-4">
                        <Input
                          className="w-full bg-gray-50 border-0 rounded-full p-3 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-none"
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
                            {editingNote ? "Modifier" : "Envoyer"}
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
                    <div className="bg-gray-50 rounded-lg p-4">
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
                                    {user?.id === note.authorId
                                      ? user?.name || "Vous"
                                      : note.authorType === "RECRUTEUR"
                                      ? "Recruteur"
                                      : "Candidat"}
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
                  <div className="col-span-2 p-6 bg-white h-[calc(100vh-10px)]  overflow-hidden">
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
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCard.candidat.competences.map(
                            (competence) => (
                              <span
                                key={competence}
                                className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                              >
                                {competence}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Documents téléchargeables */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
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
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">
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
                          <h1 className="text-xl font-semibold text-gray-700 mb-4">
                            {editingNote ? "Modifier la note" : "Discussion"}
                          </h1>
                          <div className="flex items-center gap-2">
                            <Input
                              className="w-full bg-gray-50 border-0 rounded-full p-3 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-none"
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
                                {editingNote ? "Modifier" : "Envoyer"}
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

                        <div className="bg-gray-50 rounded-lg p-4">
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
                                        {user?.id === note.authorId
                                          ? user?.name || "Vous"
                                          : note.authorType === "RECRUTEUR"
                                          ? "Recruteur"
                                          : "Candidat"}
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
                                            <button
                                              onClick={() =>
                                                handleDeleteNote(note.id)
                                              }
                                              className="text-gray-400 hover:text-red-500 transition-colors"
                                              title="Supprimer"
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
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
                  <div className="col-span-2 p-6 bg-white h-[calc(100vh-10px)] overflow-y-auto">
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
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCard.candidat.competences.map(
                            (competence) => (
                              <span
                                key={competence}
                                className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                              >
                                {competence}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Documents téléchargeables */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
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
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">
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

                    {/* Section Checklist */}
                    <div className="space-y-6">
                      {/* En-tête de la checklist */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-700">
                            Checklist
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
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
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Progression
                          </span>
                          <span className="text-sm text-gray-500">
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
                          <span className="text-xs text-gray-500">
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
                            <span className="text-xs text-gray-500">
                              {checklist.filter((i) => i.isCompleted).length ===
                              checklist.length
                                ? "🎉"
                                : "📋"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ajouter un nouvel élément */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
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
                          <div className="text-center py-12 text-gray-500">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
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
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-gray-200 hover:bg-gray-50"
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
                                                ? "line-through text-gray-500"
                                                : "text-gray-900"
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
                  <div className="col-span-2 p-6 bg-white">
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
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedCard.candidat.competences.map(
                            (competence) => (
                              <span
                                key={competence}
                                className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                              >
                                {competence}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Documents téléchargeables */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
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
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">
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
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-gray-700">
                            Pièces jointes
                          </h2>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.ppt,.pptx"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="file-upload"
                              disabled={isUploading}
                            />
                            <label
                              htmlFor="file-upload"
                              className={`flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer text-sm font-medium ${
                                isUploading
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Upload en cours...
                                </>
                              ) : (
                                <>
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
                                      d="M12 4v16m8-8H4"
                                    />
                                  </svg>
                                  Ajouter des fichiers
                                </>
                              )}
                            </label>
                          </div>
                        </div>

                        {/* Barre de progression */}
                        {isUploading && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}

                        {/* Liste des pièces jointes */}
                        <div className="space-y-3">
                          {applicationFiles.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
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
                                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                >
                                  {/* Icône du fichier */}
                                  <div className="flex-shrink-0">
                                    {getFileIcon(file.fileType)}
                                  </div>

                                  {/* Informations du fichier */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-gray-900 truncate">
                                        {file.fileName}
                                      </h3>
                                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
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
                <div className="w-full bg-gray-50 border-l p-4 flex flex-col gap-2">
                  <div className="font-semibold text-xs text-gray-500 mb-2">
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
                  <button className="text-left text-sm hover:bg-gray-100 rounded px-2 py-1">
                    Due date
                  </button>

                  <button
                    onClick={() => setCardApplicationDetailSpet(5)}
                    className={`text-left text-sm hover:bg-primary/10 text-primary rounded px-2 py-1 ${
                      cardApplicationDetailSpet === 5 ? "bg-primary/10" : ""
                    }`}
                  >
                    Attachment
                  </button>
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

        {/* Dialog de confirmation de suppression */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Confirmer la suppression
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer cette note ? Cette action est
                irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setNoteToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeleteNote}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Fonctions utilitaires pour les fichiers
const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) {
    return (
      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
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
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
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
      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
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
      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
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
      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
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
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
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
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
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
