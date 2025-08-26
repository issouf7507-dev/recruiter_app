"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Users,
  Download,
  Mail,
  FileText,
  Star,
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
import { Textarea } from "@/components/ui/textarea";

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

interface SimpleCandidatesKanbanProps {
  offerId: string;
  offerTitle: string;
  onBack: () => void;
  candidates: KanbanCandidate[];
  onCandidateAdded: (candidate: KanbanCandidate) => void;
}

export default function SimpleCandidatesKanban({
  offerId,
  offerTitle,
  onBack,
  candidates,
  onCandidateAdded,
}: SimpleCandidatesKanbanProps) {
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<KanbanCandidate | null>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  // États pour le nouveau candidat
  const [newCandidate, setNewCandidate] = useState({
    nom: "",
    prenom: "",
    email: "",
    competences: "",
    notes: "",
  });

  const handleAddCandidate = () => {
    if (!newCandidate.nom || !newCandidate.prenom || !newCandidate.email)
      return;

    const candidate: KanbanCandidate = {
      id: `candidate_${Date.now()}`,
      nom: newCandidate.nom,
      prenom: newCandidate.prenom,
      email: newCandidate.email,
      competences: newCandidate.competences
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c),
      notes: newCandidate.notes,
      createdAt: new Date().toISOString(),
    };

    onCandidateAdded(candidate);
    setNewCandidate({
      nom: "",
      prenom: "",
      email: "",
      competences: "",
      notes: "",
    });
    setIsAddCandidateModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 w-full h-screen overflow-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Candidats - {offerTitle}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {candidates.length} candidat{candidates.length > 1 ? "s" : ""}{" "}
              pour cette offre
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddCandidateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un candidat
        </Button>
      </div>

      {/* Liste des candidats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700"
            onClick={() => {
              setSelectedCandidate(candidate);
              setIsCandidateModalOpen(true);
            }}
          >
            {/* En-tête candidat */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
                {candidate.nom.slice(0, 1)}
                {candidate.prenom.slice(0, 1)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {candidate.prenom} {candidate.nom}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {candidate.email}
                </p>
              </div>
            </div>

            {/* Compétences */}
            <div className="flex flex-wrap gap-1">
              {candidate.competences && candidate.competences.length > 0 ? (
                <>
                  {candidate.competences.slice(0, 3).map((comp, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {comp}
                    </span>
                  ))}
                  {candidate.competences.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{candidate.competences.length - 3}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-500">Aucune compétence</span>
              )}
            </div>

            {/* Footer avec documents */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {candidate.cv && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>CV</span>
                  </div>
                )}
                {candidate.lettreMotivation && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>LM</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(candidate.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
        ))}

        {/* Carte d'ajout de candidat */}
        <div
          className="bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 flex flex-col items-center justify-center gap-4 hover:border-primary transition-colors cursor-pointer"
          onClick={() => setIsAddCandidateModalOpen(true)}
        >
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <Plus className="h-6 w-6 text-gray-500" />
          </div>
          <div className="text-center">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Ajouter un candidat
            </h3>
            <p className="text-sm text-gray-500">
              Cliquez pour ajouter un nouveau candidat
            </p>
          </div>
        </div>
      </div>

      {/* Modal de détail candidat */}
      <Dialog
        open={isCandidateModalOpen}
        onOpenChange={setIsCandidateModalOpen}
      >
        <DialogContent className="max-w-2xl">
          {selectedCandidate && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {selectedCandidate.prenom} {selectedCandidate.nom}
                </DialogTitle>
                <DialogDescription>{selectedCandidate.email}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Compétences */}
                <div>
                  <h3 className="font-semibold mb-2">Compétences</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.competences.length > 0 ? (
                      selectedCandidate.competences.map((comp, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full"
                        >
                          {comp}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Aucune compétence spécifiée
                      </span>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedCandidate.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedCandidate.notes}
                    </p>
                  </div>
                )}

                {/* Documents */}
                <div>
                  <h3 className="font-semibold mb-2">Documents</h3>
                  <div className="flex gap-4">
                    {selectedCandidate.cv && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger CV
                      </Button>
                    )}
                    {selectedCandidate.lettreMotivation && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger LM
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setIsCandidateModalOpen(false)}>
                  Fermer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal d'ajout de candidat */}
      <Dialog
        open={isAddCandidateModalOpen}
        onOpenChange={setIsAddCandidateModalOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau candidat</DialogTitle>
            <DialogDescription>
              Ajoutez manuellement un candidat à cette offre.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom *</label>
                <Input
                  placeholder="Jean"
                  value={newCandidate.prenom}
                  onChange={(e) =>
                    setNewCandidate({ ...newCandidate, prenom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom *</label>
                <Input
                  placeholder="Dupont"
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
                placeholder="jean.dupont@email.com"
                value={newCandidate.email}
                onChange={(e) =>
                  setNewCandidate({ ...newCandidate, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Compétences</label>
              <Input
                placeholder="JavaScript, React, Node.js (séparées par des virgules)"
                value={newCandidate.competences}
                onChange={(e) =>
                  setNewCandidate({
                    ...newCandidate,
                    competences: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Notes sur le candidat..."
                value={newCandidate.notes}
                onChange={(e) =>
                  setNewCandidate({ ...newCandidate, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddCandidateModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddCandidate}
              disabled={
                !newCandidate.nom || !newCandidate.prenom || !newCandidate.email
              }
            >
              Ajouter le candidat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
