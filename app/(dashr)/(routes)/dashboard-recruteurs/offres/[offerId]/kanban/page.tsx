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
import { ArrowLeft, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
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
import { Star } from "lucide-react";
import { Calendar } from "lucide-react";

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

// Données fictives de candidatures
// const mockApplications: Application[] = [
//   {
//     id: "1",
//     candidat: {
//       id: "1",
//       nom: "Jean Dupont",
//       email: "jean.dupont@email.com",
//       date: "2024-03-15",
//       status: "Nouvelles",
//     },
//     note: "Profil intéressant avec 5 ans d'expérience",
//     rating: 3,
//     message: "Très motivé par ce poste",
//     cv: "/cvs/cv-jean-dupont.pdf",
//     createdAt: "2024-03-15",
//   },
//   {
//     id: "2",
//     candidat: {
//       id: "2",
//       nom: "Marie Martin",
//       email: "marie.martin@email.com",
//       date: "2024-03-16",
//       status: "En cours",
//     },
//     note: "Compétences techniques solides",
//     rating: 2,
//     message: "Recherche un poste en full remote",
//     cv: "/cvs/cv-marie-martin.pdf",
//     createdAt: "2024-03-16",
//   },
//   {
//     id: "3",
//     candidat: {
//       id: "3",
//       nom: "Pierre Durand",
//       email: "pierre.durand@email.com",
//       date: "2024-03-17",
//       status: "Finalisées",
//     },
//     note: "Excellent profil, très bonnes références",
//     rating: 3,
//     message: "Disponible immédiatement",
//     cv: "/cvs/cv-pierre-durand.pdf",
//     createdAt: "2024-03-17",
//   },
// ];

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

        <div className="flex gap-4 overflow-x-auto h-full">
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
                  className="flex gap-4"
                >
                  {columns
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((column, index) => (
                      <Draggable
                        key={column.id}
                        draggableId={column.id || "temp-id"}
                        index={index}
                      >
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex-shrink-0 w-80"
                          >
                            <Card>
                              <CardHeader className="pb-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="flex items-center justify-between cursor-grab active:cursor-grabbing"
                                >
                                  <CardTitle className="text-sm font-medium">
                                    {column.name}
                                  </CardTitle>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setEditingColumn(column);
                                        setIsColumnDialogOpen(true);
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    {column.id &&
                                      column.id !== "nouvelle" &&
                                      column.id !== "acceptee" &&
                                      column.id !== "refusee" && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            column.id &&
                                            handleDeleteColumn(column.id)
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-6">
                                <Droppable droppableId={column.id || "temp-id"}>
                                  {(provided: DroppableProvided) => (
                                    <div
                                      {...provided.droppableProps}
                                      ref={provided.innerRef}
                                      className="space-y-2 min-h-[100px] border-dashed border rounded-lg p-2"
                                    >
                                      {applications
                                        .filter(
                                          (app) => app.columnId === column.id
                                        )
                                        .map((application, index) => (
                                          <Draggable
                                            key={application.id}
                                            draggableId={application.id}
                                            index={index}
                                          >
                                            {(provided: DraggableProvided) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                                              >
                                                <div className="flex justify-between items-start">
                                                  <div>
                                                    <h4 className="font-medium">
                                                      {application.candidat.nom}{" "}
                                                      {
                                                        application.candidat
                                                          .prenom
                                                      }
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                      {
                                                        application.candidat
                                                          .email
                                                      }
                                                    </p>
                                                    {application.note && (
                                                      <p className="text-sm text-gray-600 mt-2">
                                                        {application.note}
                                                      </p>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-1">
                                                    {[1, 2, 3].map((rating) => (
                                                      <button
                                                        key={rating}
                                                        onClick={() =>
                                                          handleRatingChange(
                                                            application.id,
                                                            rating
                                                          )
                                                        }
                                                        className="focus:outline-none"
                                                      >
                                                        <Star
                                                          className={`h-4 w-4 ${
                                                            application.rating &&
                                                            rating <=
                                                              application.rating
                                                              ? "text-yellow-400 fill-yellow-400"
                                                              : "text-gray-300"
                                                          }`}
                                                        />
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>

                                                {editingNote?.id ===
                                                  application.id && (
                                                  <div className="mt-2 space-y-2">
                                                    <textarea
                                                      value={editingNote.note}
                                                      onChange={(e) =>
                                                        setEditingNote({
                                                          id: application.id,
                                                          note: e.target.value,
                                                        })
                                                      }
                                                      className="w-full p-2 text-sm border rounded-md"
                                                      placeholder="Ajouter une note..."
                                                      rows={2}
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                          setEditingNote(null)
                                                        }
                                                      >
                                                        {/* {application.id} */}
                                                        <X className="h-4 w-4" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        onClick={
                                                          editingNote?.note
                                                            ? handleEditNoteSubmit
                                                            : handleNoteSubmit
                                                        }
                                                      >
                                                        {editingNote?.note
                                                          ? "Modifier"
                                                          : "Enregistrer"}
                                                      </Button>
                                                    </div>
                                                  </div>
                                                )}

                                                <div className="flex items-center justify-between mt-4">
                                                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(
                                                      application.createdAt
                                                    ).toLocaleDateString()}
                                                  </div>

                                                  <div>
                                                    <Button
                                                      size="sm"
                                                      onClick={() =>
                                                        setEditingNote({
                                                          id: application.id,
                                                          note:
                                                            application.note ||
                                                            "",
                                                        })
                                                      }
                                                      disabled={
                                                        editingNote?.id ===
                                                        application.id
                                                      }
                                                    >
                                                      {application.note
                                                        ? "Modifier la note"
                                                        : "Ajouter une note"}
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
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
      </div>
    );
  }
}
