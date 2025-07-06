"use client";

import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Types

type ManualKanbanColumn = {
  id: string;
  name: string;
  color: string;
  order: number;
};

type ManualKanbanCard = {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  offre: string;
  competences?: string[];
  note?: string;
  columnId: string;
  createdAt: string;
};

const availableColors = [
  { value: "bg-blue-300/30", label: "Bleu" },
  { value: "bg-green-300/30", label: "Vert" },
  { value: "bg-pink-300/30", label: "Rose" },
  { value: "bg-yellow-300/30", label: "Jaune" },
  { value: "bg-purple-300/30", label: "Violet" },
  { value: "bg-red-300/30", label: "Rouge" },
];

function randomId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function ManualKanbanBoard({ offerId }: { offerId: string }) {
  // State
  const [columns, setColumns] = useState<ManualKanbanColumn[]>([]);
  const [cards, setCards] = useState<ManualKanbanCard[]>([]);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnColor, setNewColumnColor] = useState(
    availableColors[0].value
  );
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState<Partial<ManualKanbanCard>>({
    nom: "",
    prenom: "",
    email: "",
    offre: "",
    competences: [],
    note: "",
    columnId: "",
  });
  const [isAddingCard, setIsAddingCard] = useState(false);

  // Add column
  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    setIsAddingColumn(true);
    setColumns((prev) => [
      ...prev,
      {
        id: randomId(),
        name: newColumnName,
        color: newColumnColor,
        order: prev.length + 1,
      },
    ]);
    setNewColumnName("");
    setNewColumnColor(availableColors[0].value);
    setShowAddColumn(false);
    setIsAddingColumn(false);
  };

  // Add card
  const handleAddCard = () => {
    if (
      !newCard.nom?.trim() ||
      !newCard.prenom?.trim() ||
      !newCard.offre?.trim() ||
      !newCard.columnId
    )
      return;
    setIsAddingCard(true);
    setCards((prev) => [
      ...prev,
      {
        id: randomId(),
        nom: newCard.nom!,
        prenom: newCard.prenom!,
        email: newCard.email || "",
        offre: newCard.offre!,
        competences: newCard.competences || [],
        note: newCard.note || "",
        columnId: newCard.columnId!,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewCard({
      nom: "",
      prenom: "",
      email: "",
      offre: "",
      competences: [],
      note: "",
      columnId: "",
    });
    setShowAddCard(false);
    setIsAddingCard(false);
  };

  // Drag & drop
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (type === "column") {
      const newColumns = Array.from(columns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);
      setColumns(newColumns.map((col, idx) => ({ ...col, order: idx + 1 })));
    } else {
      // Card drag
      setCards((prev) =>
        prev.map((card) =>
          card.id === draggableId
            ? { ...card, columnId: destination.droppableId }
            : card
        )
      );
    }
  };

  // Delete column
  const handleDeleteColumn = (columnId: string) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
    setCards((prev) => prev.filter((card) => card.columnId !== columnId));
  };

  // Delete card
  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  // UI
  return (
    <div className="space-y-6 w-full h-screen overflow-auto">
      <div className="flex gap-6 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="all-columns"
            direction="horizontal"
            type="column"
          >
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex gap-6"
              >
                {columns
                  .sort((a, b) => a.order - b.order)
                  .map((column, index) => {
                    const columnCards = cards.filter(
                      (c) => c.columnId === column.id
                    );
                    return (
                      <Draggable
                        key={column.id}
                        draggableId={column.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex-shrink-0 w-72 rounded-2xl p-3 ${column.color} flex flex-col min-h-[400px] h-full`}
                          >
                            {/* Colonne header */}
                            <div
                              className="flex items-center justify-between mb-3"
                              {...provided.dragHandleProps}
                            >
                              <span className="font-semibold text-lg">
                                {column.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="bg-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium">
                                  {columnCards.length}
                                </span>
                                <button
                                  className="p-1 hover:bg-gray-100 rounded"
                                  onClick={() => handleDeleteColumn(column.id)}
                                  title="Supprimer la colonne"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            {/* Cartes */}
                            <Droppable droppableId={column.id} type="card">
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="space-y-4 flex-1"
                                >
                                  {columnCards.map((card, idx) => (
                                    <Draggable
                                      key={card.id}
                                      draggableId={card.id}
                                      index={idx}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col gap-2 hover:shadow-md transition-shadow min-h-[120px] cursor-pointer"
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                              CARD-{card.id.slice(-4)}
                                            </span>
                                            <button
                                              className="text-red-500 text-xs hover:underline"
                                              onClick={() =>
                                                handleDeleteCard(card.id)
                                              }
                                            >
                                              Supprimer
                                            </button>
                                          </div>
                                          <div className="font-semibold text-blue-700 text-base">
                                            {card.nom} {card.prenom}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {card.offre}
                                          </div>
                                          {card.note && (
                                            <div className="text-xs text-gray-400 mt-1">
                                              {card.note}
                                            </div>
                                          )}
                                          {card.competences &&
                                            card.competences.length > 0 && (
                                              <div className="flex flex-wrap gap-2 mt-1">
                                                {card.competences.map((c) => (
                                                  <span
                                                    key={c}
                                                    className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full"
                                                  >
                                                    {c}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                            <Button
                              className="mt-4 bg-white text-primary border border-primary hover:bg-primary hover:text-white"
                              onClick={() => {
                                setShowAddCard(true);
                                setNewCard((prev) => ({
                                  ...prev,
                                  columnId: column.id,
                                }));
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" /> Ajouter une
                              carte
                            </Button>
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
            onClick={() => setShowAddColumn(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Ajouter une étape
          </Button>
        </div>
      </div>

      {/* Modal ajout colonne */}
      <Dialog open={showAddColumn} onOpenChange={setShowAddColumn}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter une colonne</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="text"
              placeholder="Nom de la colonne"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
            />
            <div className="grid grid-cols-3 items-center gap-2 mt-2">
              {availableColors.map((color) => (
                <div
                  onClick={() => setNewColumnColor(color.value)}
                  key={color.value}
                  className={`w-full h-10 rounded-md ${color.value} ${
                    newColumnColor === color.value
                      ? "border-2 border-primary"
                      : ""
                  }`}
                ></div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddColumn(false)}
              disabled={isAddingColumn}
            >
              Annuler
            </Button>
            <Button onClick={handleAddColumn} disabled={isAddingColumn}>
              {isAddingColumn ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Ajouter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal ajout carte */}
      <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter une carte</DialogTitle>
            <DialogDescription>
              Saisissez les informations du candidat et de l'offre.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="text"
              placeholder="Nom du candidat"
              value={newCard.nom || ""}
              onChange={(e) =>
                setNewCard((prev) => ({ ...prev, nom: e.target.value }))
              }
            />
            <Input
              type="text"
              placeholder="Prénom du candidat"
              value={newCard.prenom || ""}
              onChange={(e) =>
                setNewCard((prev) => ({ ...prev, prenom: e.target.value }))
              }
            />
            <Input
              type="email"
              placeholder="Email (optionnel)"
              value={newCard.email || ""}
              onChange={(e) =>
                setNewCard((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <Input
              type="text"
              placeholder="Offre associée"
              value={newCard.offre || ""}
              onChange={(e) =>
                setNewCard((prev) => ({ ...prev, offre: e.target.value }))
              }
            />
            <Input
              type="text"
              placeholder="Compétences (séparées par des virgules)"
              value={newCard.competences?.join(", ") || ""}
              onChange={(e) =>
                setNewCard((prev) => ({
                  ...prev,
                  competences: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
            />
            <Textarea
              placeholder="Note ou message (optionnel)"
              value={newCard.note || ""}
              onChange={(e) =>
                setNewCard((prev) => ({ ...prev, note: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddCard(false)}
              disabled={isAddingCard}
            >
              Annuler
            </Button>
            <Button onClick={handleAddCard} disabled={isAddingCard}>
              {isAddingCard ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Ajouter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
