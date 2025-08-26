"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  User,
  Clock,
  Check,
  CheckCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read";
  type?: "text" | "options" | "escalation";
  options?: string[];
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Bonjour ! Je suis l'assistant virtuel de Ylsix. Comment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      timestamp: new Date(),
      status: "read",
      type: "options",
      options: [
        "Comment fonctionne la plateforme ?",
        "Tarifs et abonnements",
        "Support technique",
        "Parlons à un conseiller",
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "sent" as const } : msg
        )
      );
    }, 1000);

    // Logique de réponse guidée
    setTimeout(() => {
      const userText = userMessage.text.toLowerCase();
      let botResponse: Message;

      if (userText.includes("fonctionne") || userText.includes("comment")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Ylsix est une plateforme de recrutement intelligente qui vous permet de :\n\n• Publier des offres d'emploi\n• Gérer vos candidatures avec un tableau Kanban\n• Rechercher des candidats qualifiés\n• Collaborer avec votre équipe\n• Analyser vos performances\n\nQue souhaitez-vous savoir de plus ?",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "options",
          options: [
            "Comment créer une offre d'emploi ?",
            "Comment fonctionne le tableau Kanban ?",
            "Tarifs et abonnements",
            "Parlons à un conseiller",
          ],
        };
      } else if (
        userText.includes("tarif") ||
        userText.includes("prix") ||
        userText.includes("abonnement")
      ) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Nos tarifs sont adaptés à tous les besoins :\n\n• **Gratuit** : 3 offres actives, fonctionnalités de base\n• **Pro (15 000 XOF/mois)** : Offres illimitées, collaboration d'équipe\n• **Entreprise (25 000 XOF/mois)** : Fonctionnalités avancées, support dédié\n\nSouhaitez-vous en savoir plus sur un plan spécifique ?",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "options",
          options: [
            "Détails du plan Gratuit",
            "Détails du plan Pro",
            "Détails du plan Entreprise",
            "Parlons à un conseiller",
          ],
        };
      } else if (
        userText.includes("technique") ||
        userText.includes("bug") ||
        userText.includes("problème")
      ) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Pour le support technique, je peux vous aider avec les questions de base. Pour des problèmes plus complexes, notre équipe technique est là pour vous aider.",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "options",
          options: [
            "Problème de connexion",
            "Problème de publication d'offre",
            "Autre problème technique",
            "Contacter le support technique",
          ],
        };
      } else if (
        userText.includes("conseiller") ||
        userText.includes("humain") ||
        userText.includes("appel")
      ) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Parfait ! Je vais vous mettre en relation avec un de nos conseillers. Ils sont disponibles du lundi au vendredi de 8h à 18h.\n\nUn conseiller vous contactera dans les 24h. Souhaitez-vous laisser vos coordonnées ?",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "escalation",
        };
      } else {
        // Réponse par défaut pour les questions non reconnues
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Je ne suis pas sûr de comprendre votre question. Pouvez-vous choisir une option ci-dessous ou reformuler ?",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "options",
          options: [
            "Comment fonctionne la plateforme ?",
            "Tarifs et abonnements",
            "Support technique",
            "Parlons à un conseiller",
          ],
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOptionClick = (option: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: option,
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    };

    // console.log(option);

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "sent" as const } : msg
        )
      );
    }, 1000);

    // Logique de réponse guidée pour les options
    setTimeout(() => {
      let botResponse: Message;

      if (option.includes("Comment fonctionne la plateforme")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Ylsix est une plateforme de recrutement intelligente qui vous permet de :\n\n• Publier des offres d'emploi\n• Gérer vos candidatures avec un tableau Kanban\n• Rechercher des candidats qualifiés\n• Collaborer avec votre équipe\n• Analyser vos performances\n\nQue souhaitez-vous savoir de plus ?",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "options",
          options: [
            "Comment créer une offre d'emploi ?",
            "Comment fonctionne le tableau Kanban ?",
            "Tarifs et abonnements",
            "Parlons à un conseiller",
          ],
        };
      } else if (option.includes("Support technique")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Pour le support technique, je peux vous aider avec les questions de base. Pour des problèmes plus complexes, notre équipe technique est là pour vous aider.",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "options",
          options: [
            "Problème de connexion",
            "Problème de publication d'offre",
            "Autre problème technique",
            "Contacter le support technique",
          ],
        };
      } else if (option.includes("Tarifs et abonnements")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Nos tarifs sont adaptés à tous les besoins :\n\n• **Gratuit** : 3 offres actives, fonctionnalités de base\n• **Pro (15 000 XOF/mois)** : Offres illimitées, collaboration d'équipe\n• **Entreprise (25 000 XOF/mois)** : Fonctionnalités avancées, support dédié\n\nSouhaitez-vous en savoir plus sur un plan spécifique ?",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "options",
          options: [
            "Détails du plan Gratuit",
            "Détails du plan Pro",
            "Détails du plan Entreprise",
            "Parlons à un conseiller",
          ],
        };
      } else if (option.includes("Parlons à un conseiller")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Parfait ! Je vais vous mettre en relation avec un de nos conseillers. Ils sont disponibles du lundi au vendredi de 8h à 18h.\n\nUn conseiller vous contactera dans les 24h. Souhaitez-vous laisser vos coordonnées ?",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "escalation",
        };
      } else if (option.includes("créer une offre")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Pour créer une offre d'emploi :\n\n1. Connectez-vous à votre tableau de bord\n2. Cliquez sur 'Créer une offre'\n3. Remplissez le formulaire avec les détails du poste\n4. Publiez votre offre\n\nVoulez-vous que je vous guide étape par étape ?",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "options",
          options: [
            "Guide étape par étape",
            "Voir les templates d'offres",
            "Retour au menu principal",
          ],
        };
      } else if (option.includes("tableau Kanban")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Le tableau Kanban vous permet de :\n\n• Visualiser toutes vos candidatures\n• Déplacer les candidats entre les étapes\n• Collaborer avec votre équipe\n• Suivre l'avancement en temps réel\n\nSouhaitez-vous voir une démonstration ?",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "options",
          options: [
            "Voir une démonstration",
            "Comment configurer les étapes",
            "Retour au menu principal",
          ],
        };
      } else if (option.includes("plan Gratuit")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Plan Gratuit :\n\n✅ 3 offres d'emploi actives\n✅ Tableau Kanban basique\n✅ Profil candidat complet\n✅ Support par email\n\nParfait pour commencer !",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "options",
          options: [
            "Commencer gratuitement",
            "Voir le plan Pro",
            "Retour au menu principal",
          ],
        };
      } else if (option.includes("plan Pro")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Plan Pro (20 €/mois) :\n\n✅ Offres d'emploi illimitées\n✅ Templates d'offres personnalisables\n✅ Collaboration d'équipe (jusqu'à 5 membres)\n✅ Recherche avancée de candidats\n✅ Statistiques détaillées\n\nIdéal pour les équipes de recrutement !",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "options",
          options: [
            "Essayer le plan Pro",
            "Voir le plan Entreprise",
            "Parlons à un conseiller",
          ],
        };
      } else if (option.includes("Retour au menu principal")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Bien sûr ! Comment puis-je vous aider ?",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "options",
          options: [
            "Comment fonctionne la plateforme ?",
            "Tarifs et abonnements",
            "Support technique",
            "Parlons à un conseiller",
          ],
        };
      } else {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Je ne suis pas sûr de comprendre. Pouvez-vous choisir une option ci-dessous ?",
          sender: "bot",
          timestamp: new Date(),
          status: "read",
          type: "options",
          options: [
            "Comment fonctionne la plateforme ?",
            "Tarifs et abonnements",
            "Support technique",
            "Parlons à un conseiller",
          ],
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case "sent":
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-10 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-50 w-96 h-[500px]"
          >
            <Card className="w-full h-full shadow-2xl border-0">
              <CardHeader className="pb-3 bg-primary text-primary-foreground rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/SVG/Logo_normal.svg" />
                      <AvatarFallback>YL</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm">Support Ylsix</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        En ligne
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary/20"
                    >
                      {isMinimized ? (
                        <Maximize2 className="w-4 h-4" />
                      ) : (
                        <Minimize2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  <CardContent className="p-0 flex flex-col h-full">
                    <ScrollArea className="flex-1 p-4 h-full overflow-y-auto">
                      <div className="space-y-4 pb-4">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${
                              message.sender === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex items-end space-x-2 max-w-[85%] ${
                                message.sender === "user"
                                  ? "flex-row-reverse space-x-reverse"
                                  : ""
                              }`}
                            >
                              {message.sender === "bot" && (
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src="/SVG/Logo_normal.svg" />
                                  <AvatarFallback>YL</AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`rounded-lg px-3 py-2 text-sm break-words ${
                                  message.sender === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground"
                                }`}
                              >
                                <p className="whitespace-pre-wrap">
                                  {message.text}
                                </p>

                                {message.type === "options" &&
                                  message.options && (
                                    <div className="mt-3 space-y-2">
                                      {message.options.map((option, index) => (
                                        <button
                                          key={index}
                                          onClick={() =>
                                            handleOptionClick(option)
                                          }
                                          className="block w-full text-left p-2 rounded-md bg-background hover:bg-muted border border-border text-sm transition-colors"
                                        >
                                          {option}
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                {message.type === "escalation" && (
                                  <div className="mt-3 p-3 bg-primary/10 rounded-md border border-primary/20">
                                    <p className="text-sm text-primary font-medium">
                                      🎯 Transfert vers un conseiller
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Un conseiller vous contactera dans les 24h
                                    </p>
                                  </div>
                                )}
                                <div
                                  className={`flex items-center justify-end space-x-1 mt-1 ${
                                    message.sender === "user"
                                      ? "text-primary-foreground/70"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  <span className="text-xs">
                                    {formatTime(message.timestamp)}
                                  </span>
                                  {message.sender === "user" &&
                                    getStatusIcon(message.status)}
                                </div>
                              </div>
                              {message.sender === "user" && (
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback>
                                    <User className="w-3 h-3" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </motion.div>
                        ))}

                        {isTyping && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                          >
                            <div className="flex items-end space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src="/SVG/Logo_normal.svg" />
                                <AvatarFallback>YL</AvatarFallback>
                              </Avatar>
                              <div className="bg-muted rounded-lg px-3 py-2">
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
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                      <div ref={messagesEndRef} />
                    </ScrollArea>

                    <div className="p-4 border-t bg-background">
                      <div className="flex space-x-2">
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Tapez votre message..."
                          className="flex-1 min-w-0"
                          disabled={isTyping}
                        />
                        <Button
                          onClick={handleSendMessage}
                          size="sm"
                          disabled={!inputValue.trim() || isTyping}
                          className="px-3 flex-shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
