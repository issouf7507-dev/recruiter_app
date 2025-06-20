import { Dialog, DialogContent } from "@/components/ui/dialog";
import { KanbanColumn, Application } from "@/types/types";

import React from "react";

export default function CartDetails({
  isCardModalOpen,
  setIsCardModalOpen,
  selectedCard,
  columns,
}: {
  isCardModalOpen: boolean;
  setIsCardModalOpen: (open: boolean) => void;
  selectedCard: Application | null;
  columns: KanbanColumn[];
}) {
  return (
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
  );
}
