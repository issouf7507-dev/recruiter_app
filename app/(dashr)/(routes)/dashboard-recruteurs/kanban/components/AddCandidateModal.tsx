"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Loader2, Upload } from "lucide-react";
import { postData } from "@/utils/utilts";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: string;
  onCandidateAdded: () => void;
}

type NewCandidate = {
  nom: string;
  prenom: string;
  email: string;
  message?: string;
  competences: string[];
};

export default function AddCandidateModal({
  isOpen,
  onClose,
  offerId,
  onCandidateAdded,
}: AddCandidateModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newCandidate, setNewCandidate] = useState<NewCandidate>({
    nom: "",
    prenom: "",
    email: "",
    message: "",
    competences: [],
  });
  const [competenceInput, setCompetenceInput] = useState("");

  const handleAddCompetence = () => {
    if (
      competenceInput.trim() &&
      !newCandidate.competences.includes(competenceInput.trim())
    ) {
      setNewCandidate({
        ...newCandidate,
        competences: [...newCandidate.competences, competenceInput.trim()],
      });
      setCompetenceInput("");
    }
  };

  const handleRemoveCompetence = (competence: string) => {
    setNewCandidate({
      ...newCandidate,
      competences: newCandidate.competences.filter((c) => c !== competence),
    });
  };

  const handleSubmit = async () => {
    if (!newCandidate.nom || !newCandidate.prenom || !newCandidate.email) {
      return;
    }

    setIsLoading(true);
    try {
      // Créer d'abord le candidat
      const candidateResponse = await postData(
        {
          nom: newCandidate.nom,
          prenom: newCandidate.prenom,
          email: newCandidate.email,
          competences: newCandidate.competences,
        },
        "/api/candidat/register"
      );

      if (candidateResponse.success) {
        // Puis créer la candidature
        const applicationResponse = await postData(
          {
            candidatId: candidateResponse.candidat.id,
            jobOfferId: parseInt(offerId),
            message: newCandidate.message,
          },
          "/api/candidat/postuler"
        );

        if (applicationResponse.success) {
          onCandidateAdded();
          handleClose();
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du candidat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewCandidate({
      nom: "",
      prenom: "",
      email: "",
      message: "",
      competences: [],
    });
    setCompetenceInput("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un candidat</DialogTitle>
          <DialogDescription>
            Ajoutez manuellement un candidat à cette offre d'emploi.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prénom *</label>
              <Input
                placeholder="Prénom du candidat"
                value={newCandidate.prenom}
                onChange={(e) =>
                  setNewCandidate({ ...newCandidate, prenom: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom *</label>
              <Input
                placeholder="Nom du candidat"
                value={newCandidate.nom}
                onChange={(e) =>
                  setNewCandidate({ ...newCandidate, nom: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              placeholder="email@exemple.com"
              value={newCandidate.email}
              onChange={(e) =>
                setNewCandidate({ ...newCandidate, email: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Message de candidature
            </label>
            <Textarea
              placeholder="Message ou motivation du candidat..."
              value={newCandidate.message}
              onChange={(e) =>
                setNewCandidate({ ...newCandidate, message: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Compétences</label>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter une compétence"
                value={competenceInput}
                onChange={(e) => setCompetenceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCompetence();
                  }
                }}
              />
              <Button type="button" onClick={handleAddCompetence}>
                Ajouter
              </Button>
            </div>
            {newCandidate.competences.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newCandidate.competences.map((competence, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {competence}
                    <button
                      onClick={() => handleRemoveCompetence(competence)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              "Ajouter le candidat"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
