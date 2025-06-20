"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Note {
  id: string;
  content: string;
  author: {
    name: string;
    image: string;
  };
  createdAt: Date;
}

interface ApplicationNotesProps {
  applicationId: string;
  initialNotes: Note[];
}

export function ApplicationNotes({
  applicationId,
  initialNotes,
}: ApplicationNotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (!response.ok) throw new Error("Failed to add note");

      const addedNote = await response.json();
      setNotes([addedNote, ...notes]);
      setNewNote("");
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Ajouter une note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Ajout en cours..." : "Ajouter une note"}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {note.author.image && (
                  <img
                    src={note.author.image}
                    alt={note.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{note.author.name}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(note.createdAt), "PPp", { locale: fr })}
                  </p>
                </div>
              </div>
              <p className="whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
