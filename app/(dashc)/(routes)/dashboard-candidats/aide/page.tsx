"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MessageSquare,
  BookOpen,
  Video,
  FileText,
  Search,
} from "lucide-react";

interface FAQItem {
  question: string;
  reponse: string;
  categorie: string;
}

const AidePage = () => {
  const [selectedCategorie, setSelectedCategorie] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    sujet: "",
    description: "",
    categorie: "",
  });

  const faqs: FAQItem[] = [
    {
      question: "Comment modifier mon CV ?",
      reponse:
        "Pour modifier votre CV, rendez-vous dans la section 'CV et Pièces jointes'. Cliquez sur le bouton 'Modifier' à côté de votre CV actuel. Vous pouvez ensuite télécharger une nouvelle version ou modifier les informations directement.",
      categorie: "CV et Profil",
    },
    {
      question: "Comment postuler à une offre d'emploi ?",
      reponse:
        "Pour postuler à une offre, trouvez d'abord l'offre qui vous intéresse. Cliquez sur le bouton 'Postuler' et suivez les étapes indiquées. Vous devrez sélectionner votre CV et éventuellement ajouter une lettre de motivation.",
      categorie: "Candidatures",
    },
    {
      question: "Comment suivre l'état de mes candidatures ?",
      reponse:
        "Vous pouvez suivre l'état de vos candidatures dans la section 'Candidatures en cours'. Chaque candidature affiche son statut actuel et les prochaines étapes du processus.",
      categorie: "Candidatures",
    },
    {
      question: "Comment activer les alertes emploi ?",
      reponse:
        "Rendez-vous dans la section 'Alertes emploi' et cliquez sur 'Créer une alerte'. Définissez vos critères de recherche (métier, localisation, etc.) et choisissez la fréquence des notifications.",
      categorie: "Alertes",
    },
  ];

  const handleToggleExpand = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici, vous pouvez ajouter la logique pour envoyer le formulaire
    console.log("Formulaire soumis:", formData);
    setFormData({ sujet: "", description: "", categorie: "" });
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      (selectedCategorie === "" || faq.categorie === selectedCategorie) &&
      (searchTerm === "" ||
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.reponse.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Centre d'aide</h1>
        <div className="flex gap-4">
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat en direct
          </Button>
          <Button>
            <Phone className="h-4 w-4 mr-2" />
            Nous appeler
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ressources */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">Ressources</h2>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Guide d'utilisation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Video className="h-4 w-4 mr-2" />
                Tutoriels vidéo
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Documentation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="md:col-span-2">
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans la FAQ..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* <Select
                value={selectedCategorie}
                onValueChange={setSelectedCategorie}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les catégories</SelectItem>
                  <SelectItem value="CV et Profil">CV et Profil</SelectItem>
                  <SelectItem value="Candidatures">Candidatures</SelectItem>
                  <SelectItem value="Alertes">Alertes</SelectItem>
                </SelectContent>
              </Select> */}
            </div>

            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <button
                    className="w-full p-4 flex justify-between items-center hover:bg-muted"
                    onClick={() => handleToggleExpand(index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    {expandedItems.includes(index) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedItems.includes(index) && (
                    <div className="p-4 bg-muted">
                      <p className="text-muted-foreground">{faq.reponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de contact */}
        <Card className="md:col-span-3">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">Contactez-nous</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sujet">Sujet</Label>
                <Input
                  id="sujet"
                  value={formData.sujet}
                  onChange={(e) =>
                    setFormData({ ...formData, sujet: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categorie">Catégorie</Label>
                {/* <Select
                  value={formData.categorie}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categorie: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technique">
                      Problème technique
                    </SelectItem>
                    <SelectItem value="compte">Problème de compte</SelectItem>
                    <SelectItem value="candidature">
                      Question sur une candidature
                    </SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="min-h-[100px]"
                />
              </div>
              <Button type="submit" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AidePage;
