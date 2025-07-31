"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Trash2,
  Archive,
  Star,
  StarOff,
  MessageCircle,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Clock,
  Smile,
  Image as ImageIcon,
  File,
  X,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  content: string;
  senderType: "CANDIDAT" | "RECRUTEUR";
  createdAt: string;
  isRead: boolean;
  status?: "SENT" | "DELIVERED" | "READ";
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
}

interface Conversation {
  id: string;
  recruteur: {
    id: string;
    name: string;
    entreprise: string | null;
    logo: string | null;
    isOnline?: boolean;
    lastSeen?: string;
  };
  jobOffer: {
    id: number;
    title: string;
    company: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    sender: "CANDIDAT" | "RECRUTEUR";
  } | null;
  unreadCount: number;
  updatedAt: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

const MessageriePage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<"all" | "unread" | "archived">(
    "all"
  );
  const [showConversationInfo, setShowConversationInfo] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Charger les conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markConversationAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  // Simuler les mises à jour en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/candidat/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        toast.error("Erreur lors du chargement des conversations");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/candidat/conversations/${conversationId}/messages`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        toast.error("Erreur lors du chargement des messages");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des messages");
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    try {
      await fetch(`/api/candidat/conversations/${conversationId}/read`, {
        method: "POST",
      });
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);

      const formData = new FormData();
      formData.append("content", newMessage);

      attachments.forEach((file, index) => {
        formData.append(`attachment-${index}`, file);
      });

      const response = await fetch(
        `/api/candidat/conversations/${selectedConversation}/messages`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const newMsg = await response.json();
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");
        setAttachments([]);

        // Mettre à jour la conversation dans la liste
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation
              ? {
                  ...conv,
                  lastMessage: {
                    content: newMessage,
                    timestamp: new Date().toISOString(),
                    sender: "CANDIDAT" as const,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : conv
          )
        );

        toast.success("Message envoyé");
      } else {
        toast.error("Erreur lors de l'envoi du message");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    setTypingTimeout(timeout);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024); // 10MB limit

    if (validFiles.length !== files.length) {
      toast.error("Certains fichiers sont trop volumineux (max 10MB)");
    }

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const togglePinConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, isPinned: !conv.isPinned }
          : conv
      )
    );
  };

  const archiveConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, isArchived: true } : conv
      )
    );
  };

  const getFilteredAndSortedConversations = () => {
    let filtered = conversations.filter((conv) => {
      if (filterType === "unread") return conv.unreadCount > 0;
      if (filterType === "archived") return conv.isArchived;
      return !conv.isArchived;
    });

    filtered = filtered.filter(
      (conv) =>
        conv.recruteur.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.recruteur.entreprise
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        conv.jobOffer.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Trier par épinglé puis par date
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();

      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case "SENT":
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case "DELIVERED":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case "READ":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Hier";
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = getFilteredAndSortedConversations();
  const selectedConv = conversations.find(
    (conv) => conv.id === selectedConversation
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Chargement des conversations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background w-full">
      {/* Liste des conversations */}
      <div className="w-1/3 border-r bg-card">
        <div className="p-4 border-b space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une conversation..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  {filterType === "all"
                    ? "Toutes"
                    : filterType === "unread"
                    ? "Non lues"
                    : "Archivées"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType("all")}>
                  Toutes les conversations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("unread")}>
                  Non lues
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("archived")}>
                  Archivées
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
            >
              {sortOrder === "desc" ? (
                <SortDesc className="h-4 w-4" />
              ) : (
                <SortAsc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-8rem)]">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Aucune conversation trouvée"
                  : "Aucune conversation pour le moment"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedConversation === conversation.id ? "bg-muted" : ""
                } ${
                  conversation.isPinned ? "bg-blue-50 dark:bg-blue-950/20" : ""
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={conversation.recruteur.logo || ""} />
                      <AvatarFallback>
                        {conversation.recruteur.entreprise?.charAt(0) ||
                          conversation.recruteur.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.recruteur.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">
                          {conversation.recruteur.entreprise ||
                            conversation.recruteur.name}
                        </h3>
                        {conversation.isPinned && (
                          <Star className="h-3 w-3 text-blue-500 fill-current" />
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() =>
                              togglePinConversation(conversation.id)
                            }
                          >
                            {conversation.isPinned ? "Désépingler" : "Épingler"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => archiveConversation(conversation.id)}
                          >
                            Archiver
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.jobOffer.title}
                    </p>

                    {conversation.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.updatedAt)}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Détails de la conversation */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col">
          {/* Header de la conversation */}
          <div className="p-4 border-b bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConv.recruteur.logo || ""} />
                  <AvatarFallback>
                    {selectedConv.recruteur.entreprise?.charAt(0) ||
                      selectedConv.recruteur.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {selectedConv.recruteur.entreprise ||
                      selectedConv.recruteur.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedConv.jobOffer.title}
                  </p>
                  {selectedConv.recruteur.isOnline && (
                    <p className="text-xs text-green-600">En ligne</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConversationInfo(!showConversationInfo)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Zone des messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucun message pour le moment. Attendez la réponse du
                    recruteur.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderType === "CANDIDAT"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderType === "CANDIDAT"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-center gap-2 p-2 bg-background/50 rounded"
                              >
                                {attachment.type.startsWith("image/") ? (
                                  <ImageIcon className="h-4 w-4" />
                                ) : (
                                  <File className="h-4 w-4" />
                                )}
                                <span className="text-xs truncate">
                                  {attachment.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {formatTime(message.createdAt)}
                        </span>
                        {message.senderType === "CANDIDAT" && (
                          <div className="flex items-center gap-1">
                            {getMessageStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        En train d'écrire...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Zone de saisie */}
          <div className="p-4 border-t bg-card">
            {/* Pièces jointes */}
            {attachments.length > 0 && (
              <div className="mb-3 p-2 bg-muted rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-background rounded text-xs"
                    >
                      <File className="h-3 w-3" />
                      <span className="truncate max-w-20">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx"
              />

              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="icon">
                <Smile className="h-4 w-4" />
              </Button>

              <Textarea
                placeholder="Écrivez votre message..."
                className="flex-1 resize-none"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending}
                rows={1}
              />

              <Button
                onClick={handleSendMessage}
                disabled={
                  sending || (!newMessage.trim() && attachments.length === 0)
                }
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Sélectionnez une conversation pour commencer
            </p>
          </div>
        </div>
      )}

      {/* Panneau d'informations de la conversation */}
      {showConversationInfo && selectedConv && (
        <div className="w-80 border-l bg-card p-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Informations</h3>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium">Recruteur</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedConv.recruteur.name}
                </p>
                {selectedConv.recruteur.entreprise && (
                  <p className="text-sm text-muted-foreground">
                    {selectedConv.recruteur.entreprise}
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium">Offre d'emploi</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedConv.jobOffer.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedConv.jobOffer.company}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Statut</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedConv.recruteur.isOnline ? "En ligne" : "Hors ligne"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageriePage;
