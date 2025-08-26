"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  Plus,
  Loader2,
  Users,
  Download,
  Mail,
  Calendar,
  FileText,
  Star,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useQuery } from "@tanstack/react-query";
import { fetchDataById } from "@/utils/utilts";
import AddCandidateModal from "./AddCandidateModal";

// Types pour les candidatures
type Candidate = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  candidatCompetences: Array<{
    competence: string;
  }>;
  cv: string;
  letterm: string;
};

type Application = {
  id: string;
  candidat: Candidate;
  message?: string;
  cv?: string;
  rating?: number;
  createdAt: string;
  columnId: string;
  notes: Array<{
    id: string;
    content: string;
    authorName?: string;
    createdAt: string;
  }>;
};

type KanbanColumn = {
  id: string;
  name: string;
  color: string;
  order: number;
};

interface CandidatesKanbanProps {
  offerId: string;
  offerTitle: string;
  onBack: () => void;
}

export default function CandidatesKanban({
  offerId,
  offerTitle,
  onBack,
}: CandidatesKanbanProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);

  // Récupération des données de l'offre avec candidatures
  const {
    data: offerData,
    refetch: refetchOffer,
    isLoading: isLoadingOffer,
  } = useQuery({
    queryKey: ["offerWithApplications", offerId],
    queryFn: () => fetchDataById(`/api/recruteur/offres/${offerId}`),
    enabled: !!offerId,
  });

  // Mise à jour des données quand elles changent
  useEffect(() => {
    if (offerData?.data?.[0]) {
      const offer = offerData.data[0];
      setColumns(offer.kanbanColumns || []);
      setApplications(offer.applications || []);
    }
  }, [offerData]);

  // Gestion du drag and drop des candidatures
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const applicationId = draggableId;
    const newColumnId = destination.droppableId;

    // Mise à jour optimiste
    setApplications((prevApps) =>
      prevApps.map((app) =>
        app.id === applicationId ? { ...app, columnId: newColumnId } : app
      )
    );

    try {
      // Appel API pour mettre à jour la colonne de l'application
      // Cette logique existe déjà dans le KanbanBoard existant
      const response = await fetch("/api/recruteur/kanban/move-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          newColumnId,
          sourceColumnId: source.droppableId,
        }),
      });

      if (!response.ok) {
        // Rollback en cas d'erreur
        refetchOffer();
      }
    } catch (error) {
      console.error("Erreur lors du déplacement de la candidature:", error);
      refetchOffer();
    }
  };

  // Fonction pour télécharger un fichier
  const handleDownload = (url: string, filename: string) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  if (isLoadingOffer) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full h-screen overflow-auto">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux offres
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Candidatures - {offerTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {applications.length} candidature
            {applications.length > 1 ? "s" : ""} reçue
            {applications.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => setIsAddCandidateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter candidat
        </Button>
      </div>

      {/* Kanban Board pour les candidatures */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6">
            {columns
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((column) => {
                const columnApplications = applications.filter(
                  (app) => app.columnId === column.id
                );

                return (
                  <Droppable key={column.id} droppableId={column.id}>
                    {(provided: DroppableProvided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-shrink-0 w-80 rounded-2xl p-4 ${column.color} flex flex-col min-h-[500px]`}
                      >
                        {/* En-tête de colonne */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">
                              {column.name}
                            </span>
                          </div>
                          <span className="bg-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium">
                            {columnApplications.length}
                          </span>
                        </div>

                        {/* Cartes des candidatures */}
                        <div className="space-y-3 flex-1">
                          {columnApplications.map((application, index) => (
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
                                  className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setIsApplicationModalOpen(true);
                                  }}
                                >
                                  {/* En-tête candidat */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-sm">
                                        {application.candidat.nom.slice(0, 1)}
                                        {application.candidat.prenom.slice(
                                          0,
                                          1
                                        )}
                                      </div>
                                      <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                          {application.candidat.prenom}{" "}
                                          {application.candidat.nom}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {application.candidat.email}
                                        </p>
                                      </div>
                                    </div>
                                    {application.rating && (
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                        <span className="text-sm font-medium">
                                          {application.rating}/5
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Message de candidature */}
                                  {application.message && (
                                    <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                      {application.message}
                                    </div>
                                  )}

                                  {/* Compétences */}
                                  <div className="flex flex-wrap gap-1">
                                    {application.candidat.candidatCompetences &&
                                    application.candidat.candidatCompetences
                                      .length > 0 ? (
                                      <>
                                        {application.candidat.candidatCompetences
                                          .slice(0, 3)
                                          .map((comp, idx) => (
                                            <span
                                              key={idx}
                                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                                            >
                                              {comp.competence}
                                            </span>
                                          ))}
                                        {application.candidat
                                          .candidatCompetences.length > 3 && (
                                          <span className="text-xs text-gray-500">
                                            +
                                            {application.candidat
                                              .candidatCompetences.length - 3}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-xs text-gray-500">
                                        Aucune compétence
                                      </span>
                                    )}
                                  </div>

                                  {/* Footer avec documents */}
                                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      {application.candidat.cv && (
                                        <div className="flex items-center gap-1">
                                          <FileText className="h-3 w-3" />
                                          <span>CV</span>
                                        </div>
                                      )}
                                      {application.candidat.letterm && (
                                        <div className="flex items-center gap-1">
                                          <Mail className="h-3 w-3" />
                                          <span>LM</span>
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                      {new Date(
                                        application.createdAt
                                      ).toLocaleDateString("fr-FR")}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
          </div>
        </DragDropContext>
      </div>

      {/* Modal de détail de candidature */}
      <Dialog
        open={isApplicationModalOpen}
        onOpenChange={setIsApplicationModalOpen}
      >
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden h-[calc(100vh-20px)]">
          {selectedApplication && (
            <div className="grid grid-cols-3 w-full h-full">
              {/* Contenu principal */}
              <div className="col-span-2 p-6 bg-white h-full overflow-y-auto dark:bg-gray-800">
                <div className="space-y-6">
                  {/* En-tête candidat */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-xl">
                        {selectedApplication.candidat.nom.slice(0, 1)}
                        {selectedApplication.candidat.prenom.slice(0, 1)}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedApplication.candidat.prenom}{" "}
                          {selectedApplication.candidat.nom}
                        </h1>
                        <p className="text-primary font-medium">
                          {selectedApplication.candidat.email}
                        </p>
                      </div>
                    </div>

                    {selectedApplication.rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Évaluation:</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < selectedApplication.rating!
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {selectedApplication.rating}/5
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message de candidature */}
                  {selectedApplication.message && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Message de candidature
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        {selectedApplication.message}
                      </p>
                    </div>
                  )}

                  {/* Compétences */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Compétences
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.candidat.candidatCompetences &&
                      selectedApplication.candidat.candidatCompetences.length >
                        0 ? (
                        selectedApplication.candidat.candidatCompetences.map(
                          (comp, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full"
                            >
                              {comp.competence}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-gray-500 text-sm">
                          Aucune compétence spécifiée
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedApplication.notes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Notes et commentaires
                      </h3>
                      <div className="space-y-3">
                        {selectedApplication.notes.slice(0, 3).map((note) => (
                          <div
                            key={note.id}
                            className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg"
                          >
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {note.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <span>{note.authorName || "Recruteur"}</span>
                              <span>•</span>
                              <span>
                                {new Date(note.createdAt).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-full bg-gray-50 dark:bg-gray-900 border-l p-4 flex flex-col gap-4">
                <div className="font-semibold text-xs text-gray-500 dark:text-gray-400 mb-2">
                  DOCUMENTS
                </div>

                {/* Documents téléchargeables */}
                <div className="space-y-2">
                  {selectedApplication.candidat.cv && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        handleDownload(
                          selectedApplication.candidat.cv,
                          `CV_${selectedApplication.candidat.prenom}_${selectedApplication.candidat.nom}.pdf`
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger CV
                    </Button>
                  )}

                  {selectedApplication.candidat.letterm && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        handleDownload(
                          selectedApplication.candidat.letterm,
                          `LM_${selectedApplication.candidat.prenom}_${selectedApplication.candidat.nom}.pdf`
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Lettre de motivation
                    </Button>
                  )}
                </div>

                <div className="mt-6">
                  <div className="font-semibold text-xs text-gray-500 dark:text-gray-400 mb-2">
                    INFORMATIONS
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Candidature reçue le</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 ml-6">
                      {new Date(
                        selectedApplication.createdAt
                      ).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal d'ajout de candidat */}
      <AddCandidateModal
        isOpen={isAddCandidateModalOpen}
        onClose={() => setIsAddCandidateModalOpen(false)}
        offerId={offerId}
        onCandidateAdded={() => {
          refetchOffer();
          setIsAddCandidateModalOpen(false);
        }}
      />
    </div>
  );
}
