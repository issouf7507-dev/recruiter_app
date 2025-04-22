"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  sender: "me" | "other";
  timestamp: string;
};

type Conversation = {
  id: string;
  candidate: {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    unread: number;
  };
  messages: Message[];
};

const mockConversations: Conversation[] = [
  {
    id: "1",
    candidate: {
      id: "1",
      name: "Jean Dupont",
      avatar: "/avatars/jean-dupont.jpg",
      lastMessage: "Je suis disponible pour un entretien",
      unread: 2,
    },
    messages: [
      {
        id: "1",
        content: "Bonjour, je suis intéressé par votre offre",
        sender: "other",
        timestamp: "10:30",
      },
      {
        id: "2",
        content: "Bonjour Jean, merci pour votre intérêt",
        sender: "me",
        timestamp: "10:32",
      },
      {
        id: "3",
        content: "Je suis disponible pour un entretien",
        sender: "other",
        timestamp: "10:35",
      },
    ],
  },
  {
    id: "2",
    candidate: {
      id: "2",
      name: "Marie Martin",
      avatar: "/avatars/marie-martin.jpg",
      lastMessage: "Merci pour votre retour",
      unread: 0,
    },
    messages: [
      {
        id: "1",
        content: "Bonjour, j'ai des questions sur le poste",
        sender: "other",
        timestamp: "09:15",
      },
      {
        id: "2",
        content: "Bien sûr, je suis là pour y répondre",
        sender: "me",
        timestamp: "09:20",
      },
      {
        id: "3",
        content: "Merci pour votre retour",
        sender: "other",
        timestamp: "09:25",
      },
    ],
  },
];

export default function MessageriePage() {
  const [selectedConversation, setSelectedConversation] = useState<string>("1");
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const conversations = mockConversations.filter((conv) =>
    conv.candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversation = conversations.find(
    (conv) => conv.id === selectedConversation
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentConversation) return;

    // Ici, vous implémenteriez l'envoi réel du message
    console.log("Envoi du message:", newMessage);
    setNewMessage("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Liste des conversations */}
      <div className="w-1/3 border-r p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent",
                selectedConversation === conversation.id && "bg-accent"
              )}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <Avatar>
                <AvatarImage src={conversation.candidate.avatar} />
                <AvatarFallback>
                  {conversation.candidate.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {conversation.candidate.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.candidate.lastMessage}
                </p>
              </div>
              {conversation.candidate.unread > 0 && (
                <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {conversation.candidate.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Zone de conversation */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            <div className="border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={currentConversation.candidate.avatar} />
                  <AvatarFallback>
                    {currentConversation.candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {currentConversation.candidate.name}
                  </p>
                  <p className="text-sm text-muted-foreground">En ligne</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {currentConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === "me" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg p-3",
                      message.sender === "me"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Écrivez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">
              Sélectionnez une conversation pour commencer
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
