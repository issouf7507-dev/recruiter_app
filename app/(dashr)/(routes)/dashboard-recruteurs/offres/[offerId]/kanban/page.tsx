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
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { deleteData, fetchDataById, postData } from "@/utils/utilts";

import React from "react";

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

type Candidat = {
  id: string;
  nom: string;
  email: string;
  date: string;
  status: string;
};

type Application = {
  id: string;
  candidat: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  note?: string;
  rating?: number;
  message?: string;
  cv?: string;
  createdAt: string;
  columnId: string;
};

// Couleurs disponibles pour les colonnes
const availableColors = [
  //  },
  { value: "#FACC15", label: "Grwdwiss" },
  { value: "#34D399", label: "Grsisswdws" },
  { value: "#60A5FA", label: "dwdw" },
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

export default function KanbanPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = use(params);

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

  // const { data: offertData, isLoading } = useQuery({
  //   queryKey: ["offerbyid", id],
  //   queryFn: () => fetchData(`/api/recruteur/offres/${id}`),
  // });

  // Optimiser la gestion des colonnes
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Mettre à jour les états locaux quand les données changent
  useEffect(() => {
    if (queryoffresbyid?.data?.[0]) {
      setColumns(queryoffresbyid.data[0].kanbanColumns || []);
      setApplications(queryoffresbyid.data[0].applications || []);
    }
  }, [queryoffresbyid?.data]);

  // État pour la gestion des colonnes
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [newColumn, setNewColumn] = useState<Partial<KanbanColumn>>({
    id: "",
    name: "",
    color: "bg-blue-500",
  });

  const [isReordering, setIsReordering] = useState(false);

  const [editingNote, setEditingNote] = useState<{
    id: string;
    note: string;
  } | null>(null);
  const [newNote, setNewNote] = useState("");

  // Ajout des états pour la modal de détail de carte
  const [selectedCard, setSelectedCard] = useState<Application | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [checklist, setChecklist] = useState([
    { text: "Choose a Design agency", checked: true },
    { text: "Share detailed design directives", checked: false },
    { text: "Share color palette", checked: false },
  ]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [description, setDescription] = useState("");
  const [activity, setActivity] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleAddColumn = async () => {
    if (!newColumn.name) return;

    // const id = newColumn.name.toLowerCase().replace(/\s+/g, "_");
    const column: KanbanColumn = {
      name: newColumn.name,
      color: newColumn.color || "bg-blue-500",
      order: queryoffresbyid?.data?.[0].kanbanColumns.length + 1,
      jobOfferId: offerId,
    };
    // queryoffresbyid

    await postData(column, "/api/recruteur/kanban").then((res) => {
      console.log(res);
      if (res.sucess) {
        setIsColumnDialogOpen(false);
        queryoffresbyidrefetch();
      }
    });
  };

  const handleEditColumn = () => {
    if (!editingColumn) return;

    const column: KanbanColumn = {
      name: editingColumn.name,
      color: editingColumn.color || "bg-blue-500",
      order: editingColumn.order,
      jobOfferId: offerId,
    };
  };

  const handleDeleteColumn = async (columnId: string) => {
    // Déplacer les candidatures vers la colonne "nouvelle"

    await deleteData(`/api/recruteur/kanban/${columnId}`).then((res) => {
      if (res) {
        queryoffresbyidrefetch();
      }
    });
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

  const handleRatingChange = async (
    applicationId: string,
    newRating: number
  ) => {
    // Mettre à jour le rating dans les données fictives

    // Ici, vous devrez ajouter l'appel API pour sauvegarder le rating
    console.log(`Rating mis à jour pour ${applicationId}: ${newRating}`);
  };

  const handleNoteSubmit = async () => {
    if (!editingNote) return;

    // console.log("ss");

    try {
      const response = await postData(
        editingNote,
        "/api/recruteur/kanban/application"
      );
      if (response.success) {
        setEditingNote(null);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la note:", error);
    }
  };

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

  const handleDeleteNote = async (applicationId: string) => {
    // Supprimer la note dans les données fictives

    // Ici, vous devrez ajouter l'appel API pour supprimer la note
    console.log(`Note supprimée pour ${applicationId}`);
  };

  console.log(queryoffresbyid?.data);

  if (isLoading || isReordering || queryoffresbyidrefetchisPending) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (queryoffresbyid?.data?.[0].kanbanColumns) {
    return (
      <div className="p-6 space-y-6 w-full h-screen overflow-auto">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard-recruteurs/offres">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Gestion des candidatures</h1>
          </div>
          <Button onClick={() => setIsColumnDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une étape
          </Button>
        </div>
        <div>
          <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
            <span className="font-medium cursor-pointer">Offres</span>
            <span className="mx-1">›</span>
            <span className="text-blue-600 font-medium cursor-pointer">
              {queryoffresbyid?.data?.[0].title}
            </span>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto h-full pb-4">
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
                              className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 flex flex-col min-h-[400px]"
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
                                  <span className="bg-gray-200 text-xs px-2 py-0.5 rounded-full font-medium">
                                    {columnApps.length}
                                  </span>
                                </div>
                                <button className="text-blue-600 text-xs font-medium hover:underline">
                                  + Add Task
                                </button>
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
                                                setDescription(
                                                  application.note || ""
                                                );
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
        </div>

        <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingColumn ? "Modifier l'étape" : "Ajouter une étape"}
              </DialogTitle>
              <DialogDescription>
                {editingColumn
                  ? "Modifiez les détails de l'étape"
                  : "Créez une nouvelle étape pour votre processus de recrutement"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'étape</Label>
                <Input
                  id="title"
                  value={editingColumn?.name || newColumn.name}
                  onChange={(e) =>
                    editingColumn
                      ? setEditingColumn({
                          ...editingColumn,
                          name: e.target.value,
                        })
                      : setNewColumn({ ...newColumn, name: e.target.value })
                  }
                  placeholder="Ex: Entretien technique"
                />
              </div>
              <div className="space-y-2">
                <Label>Couleur</Label>
                <Select
                  value={editingColumn?.color || newColumn.color}
                  onValueChange={(value) =>
                    editingColumn
                      ? setEditingColumn({ ...editingColumn, color: value })
                      : setNewColumn({ ...newColumn, color: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une couleur" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            style={{
                              backgroundColor: color.value,
                            }}
                            className={`w-4 h-4 rounded-full `}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsColumnDialogOpen(false);
                  setEditingColumn(null);
                  setNewColumn({ id: "", name: "", color: "bg-blue-500" });
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={editingColumn ? handleEditColumn : handleAddColumn}
                disabled={!editingColumn?.name && !newColumn.name}
              >
                {editingColumn ? "Modifier" : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de détail de carte */}
        <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
          <DialogContent className="max-w-3xl w-full p-0 overflow-hidden">
            {selectedCard && (
              <div className="flex flex-col md:flex-row w-full h-full">
                {/* Partie principale */}
                <div className="flex-1 p-6 bg-white">
                  {/* Titre et colonne */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg">
                      {selectedCard.candidat.nom} {selectedCard.candidat.prenom}
                    </span>
                    <span className="text-xs text-gray-500">in list</span>
                    <span className="text-blue-600 text-xs font-semibold">
                      {
                        columns.find((col) => col.id === selectedCard.columnId)
                          ?.name
                      }
                    </span>
                  </div>
                  {/* Membres et labels */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold border">
                      {selectedCard.candidat.nom.slice(0, 1)}
                      {selectedCard.candidat.prenom?.slice(0, 1)}
                    </span>
                    {/* Labels (tags) */}
                    <span className="bg-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                      External
                    </span>
                    <span className="bg-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                      Design
                    </span>
                  </div>
                  {/* Date et statut */}
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked
                      readOnly
                      className="accent-green-500"
                    />
                    <span className="text-xs">yesterday at 4:47 PM</span>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-semibold">
                      COMPLETE
                    </span>
                  </div>
                  {/* Description */}
                  <div className="mb-6">
                    <div className="font-semibold mb-1">Description</div>
                    <textarea
                      className="w-full border rounded p-2 text-sm min-h-[60px]"
                      placeholder="Add a more detailed description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  {/* Checklist */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold">Checklist</div>
                      <button className="text-xs text-gray-500 hover:underline">
                        Hide completed items
                      </button>
                      <button className="text-xs text-gray-500 hover:underline">
                        Delete
                      </button>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-2 bg-blue-500"
                        style={{
                          width: `${Math.round(
                            (checklist.filter((i) => i.checked).length /
                              checklist.length) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="space-y-2 mb-2">
                      {checklist.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => {
                              setChecklist((cl) =>
                                cl.map((it, i) =>
                                  i === idx
                                    ? { ...it, checked: !it.checked }
                                    : it
                                )
                              );
                            }}
                          />
                          <span
                            className={
                              item.checked ? "line-through text-gray-400" : ""
                            }
                          >
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        className="border rounded px-2 py-1 text-xs flex-1"
                        placeholder="Add an item"
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                      />
                      <button
                        className="bg-gray-100 px-2 py-1 rounded text-xs font-medium"
                        onClick={() => {
                          if (newChecklistItem.trim()) {
                            setChecklist((cl) => [
                              ...cl,
                              { text: newChecklistItem, checked: false },
                            ]);
                            setNewChecklistItem("");
                          }
                        }}
                      >
                        Add an item
                      </button>
                    </div>
                  </div>
                  {/* Activity */}
                  <div className="mb-2">
                    <div className="font-semibold mb-1">Activity</div>
                    <div className="flex gap-2 items-start mb-2">
                      <span className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold border">
                        {selectedCard.candidat.nom.slice(0, 1)}
                        {selectedCard.candidat.prenom?.slice(0, 1)}
                      </span>
                      <input
                        className="border rounded px-2 py-1 text-xs flex-1"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newComment.trim()) {
                            setActivity((act) => [newComment, ...act]);
                            setNewComment("");
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      {activity.map((comment, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-gray-700 bg-gray-100 rounded p-2 mb-1"
                        >
                          {comment}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Sidebar actions */}
                <div className="w-full md:w-64 bg-gray-50 border-l p-4 flex flex-col gap-2">
                  <div className="font-semibold text-xs text-gray-500 mb-2">
                    SUGGESTED
                  </div>
                  <button className="text-left text-sm font-medium text-blue-600 hover:underline mb-2">
                    Join
                  </button>
                  <div className="font-semibold text-xs text-gray-500 mt-4 mb-2">
                    ADD TO CARD
                  </div>
                  <button className="text-left text-sm hover:bg-gray-100 rounded px-2 py-1">
                    Members
                  </button>
                  <button className="text-left text-sm hover:bg-gray-100 rounded px-2 py-1">
                    Labels
                  </button>
                  <button className="text-left text-sm hover:bg-gray-100 rounded px-2 py-1">
                    Checklist
                  </button>
                  <button className="text-left text-sm hover:bg-gray-100 rounded px-2 py-1">
                    Due date
                  </button>
                  <button className="text-left text-sm hover:bg-gray-100 rounded px-2 py-1">
                    Attachment
                  </button>
                  <button className="text-left text-sm hover:bg-gray-100 rounded px-2 py-1">
                    Location
                  </button>
                  <button className="text-left text-sm hover:bg-gray-100 rounded px-2 py-1">
                    Cover
                  </button>
                  <div className="font-semibold text-xs text-gray-500 mt-4 mb-2">
                    POWER-UPS
                  </div>
                  <button className="text-left text-sm hover:bg-gray-100 rounded px-2 py-1">
                    Google Drive
                  </button>
                  <button className="text-left text-sm hover:bg-gray-100 rounded px-2 py-1">
                    + Add Power-Ups
                  </button>
                  <div className="font-semibold text-xs text-gray-500 mt-4 mb-2">
                    BUTLER
                  </div>
                  <button className="text-left text-sm hover:bg-gray-100 rounded px-2 py-1">
                    + Add button
                  </button>
                  <div className="font-semibold text-xs text-gray-500 mt-4 mb-2">
                    ACTIONS
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}
