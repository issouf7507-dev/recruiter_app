"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MessageCircle, Send } from "lucide-react";

interface InitiateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidat: {
    id: string;
    name: string;
    email: string;
  };
  jobOffer: {
    id: number;
    title: string;
    company: string;
  };
  onSuccess?: (conversationId: string) => void;
}

export default function InitiateChatModal({
  isOpen,
  onClose,
  candidat,
  jobOffer,
  onSuccess,
}: InitiateChatModalProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Veuillez écrire un message");
      return;
    }

    try {
      setSending(true);
      const response = await fetch("/api/recruteur/initiate-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobOfferId: jobOffer.id,
          candidatId: candidat.id,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Message envoyé avec succès !");
        setMessage("");
        onClose();

        // Rediriger vers la messagerie si une fonction de succès est fournie
        if (onSuccess) {
          onSuccess(data.conversationId);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Erreur lors de l'envoi du message");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Nouvelle conversation
          </DialogTitle>
          <DialogDescription>
            Initiez une conversation avec {candidat.name} concernant le poste de{" "}
            <strong>{jobOffer.title}</strong> chez {jobOffer.company}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidat">Candidat</Label>
            <Input
              id="candidat"
              value={`${candidat.name} (${candidat.email})`}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobOffer">Offre d'emploi</Label>
            <Input
              id="jobOffer"
              value={`${jobOffer.title} - ${jobOffer.company}`}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Votre message</Label>
            <Textarea
              id="message"
              placeholder="Écrivez votre message ici..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              disabled={sending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Annuler
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={sending || !message.trim()}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? "Envoi..." : "Envoyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
