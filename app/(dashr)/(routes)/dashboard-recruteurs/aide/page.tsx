"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Mail, MessageSquare, BookOpen } from "lucide-react";

const faqs = [
  {
    question: "Comment créer une nouvelle offre d'emploi ?",
    answer:
      "Pour créer une nouvelle offre, allez dans la section 'Offres' et cliquez sur le bouton 'Créer une offre'. Remplissez ensuite le formulaire avec les informations requises et publiez l'offre.",
  },
  {
    question: "Comment gérer les candidatures ?",
    answer:
      "Vous pouvez gérer les candidatures depuis la page 'Candidatures'. Utilisez le système de kanban pour déplacer les candidatures entre les différentes étapes du processus de recrutement.",
  },
  {
    question: "Comment contacter un candidat ?",
    answer:
      "Vous pouvez contacter un candidat directement depuis la messagerie intégrée. Allez dans la section 'Messagerie', sélectionnez le candidat et envoyez votre message.",
  },
  {
    question: "Comment exporter les données ?",
    answer:
      "Pour exporter les données, allez dans la section 'Statistiques' et utilisez le bouton 'Exporter'. Vous pouvez choisir le format et la période des données à exporter.",
  },
];

const resources = [
  {
    title: "Guide d'utilisation",
    description: "Documentation complète sur l'utilisation de la plateforme",
    icon: BookOpen,
  },
  {
    title: "Centre d'aide",
    description: "Articles et tutoriels pour vous aider",
    icon: MessageSquare,
  },
  {
    title: "Support technique",
    description: "Contactez notre équipe technique",
    icon: Mail,
  },
];

export default function AidePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici, vous implémenteriez l'envoi du formulaire
    console.log("Envoi du formulaire:", contactForm);
    setContactForm({ subject: "", message: "" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aide et Support</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((resource, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <resource.icon className="h-5 w-5" />
                <CardTitle className="text-lg">{resource.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{resource.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les FAQ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contactez-nous</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Sujet</Label>
                <Input
                  placeholder="Sujet de votre demande"
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Décrivez votre problème ou votre question"
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Envoyer
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
