"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Trash2,
  Archive,
  Star,
  StarOff,
} from "lucide-react";

interface Message {
  id: number;
  expediteur: string;
  entreprise: string;
  sujet: string;
  contenu: string;
  date: Date;
  lu: boolean;
  favori: boolean;
  pieceJointe?: boolean;
}

interface Conversation {
  id: number;
  entreprise: string;
  logo: string;
  dernierMessage: Message;
  nonLus: number;
}

const MessageriePage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      entreprise: "TechCorp Inc.",
      logo: "/logos/techcorp.png",
      nonLus: 2,
      dernierMessage: {
        id: 1,
        expediteur: "Recruteur TechCorp",
        entreprise: "TechCorp Inc.",
        sujet: "Entretien technique",
        contenu:
          "Bonjour, nous avons bien reçu votre candidature et souhaiterions vous proposer un entretien technique la semaine prochaine. Quelles sont vos disponibilités ?",
        date: new Date("2024-03-15T14:30:00"),
        lu: false,
        favori: true,
      },
    },
    {
      id: 2,
      entreprise: "WebSolutions",
      logo: "/logos/websolutions.png",
      nonLus: 0,
      dernierMessage: {
        id: 2,
        expediteur: "RH WebSolutions",
        entreprise: "WebSolutions",
        sujet: "Proposition de mission",
        contenu:
          "Nous avons un projet qui correspond parfaitement à votre profil. Seriez-vous intéressé par une mission de 6 mois ?",
        date: new Date("2024-03-14T09:15:00"),
        lu: true,
        favori: false,
        pieceJointe: true,
      },
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === selectedConversation) {
          return {
            ...conv,
            dernierMessage: {
              id: conv.dernierMessage.id + 1,
              expediteur: "Moi",
              entreprise: conv.entreprise,
              sujet: conv.dernierMessage.sujet,
              contenu: newMessage,
              date: new Date(),
              lu: true,
              favori: conv.dernierMessage.favori,
            },
            nonLus: 0,
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
      setNewMessage("");
    }
  };

  const handleToggleFavorite = (id: number) => {
    setConversations(
      conversations.map((conv) => {
        if (conv.id === id) {
          return {
            ...conv,
            dernierMessage: {
              ...conv.dernierMessage,
              favori: !conv.dernierMessage.favori,
            },
          };
        }
        return conv;
      })
    );
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.entreprise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConv = conversations.find(
    (conv) => conv.id === selectedConversation
  );

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Liste des conversations */}
      <div className="w-1/3 border-r">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une conversation..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b cursor-pointer hover:bg-muted ${
                selectedConversation === conversation.id ? "bg-muted" : ""
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={conversation.logo} />
                  <AvatarFallback>
                    {conversation.entreprise.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold truncate">
                      {conversation.entreprise}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(conversation.id);
                        }}
                      >
                        {conversation.dernierMessage.favori ? (
                          <Star className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.dernierMessage.sujet}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.dernierMessage.contenu}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {conversation.dernierMessage.date.toLocaleDateString()}
                    </span>
                    {conversation.nonLus > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {conversation.nonLus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Détails de la conversation */}
      {selectedConv && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedConv.logo} />
                <AvatarFallback>
                  {selectedConv.entreprise.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{selectedConv.entreprise}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedConv.dernierMessage.sujet}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={selectedConv.logo} />
                      <AvatarFallback>
                        {selectedConv.entreprise.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedConv.dernierMessage.expediteur}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedConv.dernierMessage.date.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-4">{selectedConv.dernierMessage.contenu}</p>
                {selectedConv.dernierMessage.pieceJointe && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Paperclip className="h-4 w-4" />
                    <span>Document.pdf</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Textarea
                placeholder="Écrivez votre message..."
                className="flex-1"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageriePage;
