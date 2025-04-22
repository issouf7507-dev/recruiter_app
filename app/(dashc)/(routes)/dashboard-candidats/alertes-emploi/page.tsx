"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Bell,
  BellOff,
  Trash2,
  Pencil,
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
} from "lucide-react";

interface Alerte {
  id: number;
  titre: string;
  motsCles: string[];
  localisation: string;
  typeContrat: string;
  salaireMin?: number;
  salaireMax?: number;
  experience: string;
  frequence: string;
  active: boolean;
  derniereMiseAJour: Date;
  nombreResultats: number;
}

const AlertesEmploiPage = () => {
  const [alertes, setAlertes] = useState<Alerte[]>([
    {
      id: 1,
      titre: "Développeur Full Stack",
      motsCles: ["React", "Node.js", "TypeScript"],
      localisation: "Paris",
      typeContrat: "CDI",
      salaireMin: 40000,
      salaireMax: 60000,
      experience: "3-5 ans",
      frequence: "Quotidienne",
      active: true,
      derniereMiseAJour: new Date("2024-03-15"),
      nombreResultats: 12,
    },
    {
      id: 2,
      titre: "Designer UX/UI",
      motsCles: ["Figma", "Adobe XD", "UI/UX"],
      localisation: "Remote",
      typeContrat: "CDI",
      experience: "2-4 ans",
      frequence: "Hebdomadaire",
      active: false,
      derniereMiseAJour: new Date("2024-03-14"),
      nombreResultats: 5,
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAlerte, setNewAlerte] = useState<Partial<Alerte>>({
    titre: "",
    motsCles: [],
    localisation: "",
    typeContrat: "",
    experience: "",
    frequence: "Quotidienne",
    active: true,
  });

  const handleCreateAlerte = () => {
    if (newAlerte.titre && newAlerte.localisation) {
      const alerte: Alerte = {
        id: alertes.length + 1,
        titre: newAlerte.titre!,
        motsCles: newAlerte.motsCles || [],
        localisation: newAlerte.localisation!,
        typeContrat: newAlerte.typeContrat!,
        salaireMin: newAlerte.salaireMin,
        salaireMax: newAlerte.salaireMax,
        experience: newAlerte.experience!,
        frequence: newAlerte.frequence!,
        active: true,
        derniereMiseAJour: new Date(),
        nombreResultats: 0,
      };
      setAlertes([...alertes, alerte]);
      setNewAlerte({
        titre: "",
        motsCles: [],
        localisation: "",
        typeContrat: "",
        experience: "",
        frequence: "Quotidienne",
        active: true,
      });
      setIsCreating(false);
    }
  };

  const handleToggleActive = (id: number) => {
    setAlertes(
      alertes.map((alerte) =>
        alerte.id === id ? { ...alerte, active: !alerte.active } : alerte
      )
    );
  };

  const handleDelete = (id: number) => {
    setAlertes(alertes.filter((alerte) => alerte.id !== id));
  };

  const filteredAlertes = alertes.filter((alerte) =>
    alerte.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Alertes emploi</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Créer une alerte
        </Button>
      </div>

      {/* Formulaire de création d'alerte */}
      {isCreating && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">Nouvelle alerte</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre de l'alerte</Label>
                <Input
                  id="titre"
                  value={newAlerte.titre}
                  onChange={(e) =>
                    setNewAlerte({ ...newAlerte, titre: e.target.value })
                  }
                  placeholder="Ex: Développeur Full Stack"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localisation">Localisation</Label>
                <Input
                  id="localisation"
                  value={newAlerte.localisation}
                  onChange={(e) =>
                    setNewAlerte({ ...newAlerte, localisation: e.target.value })
                  }
                  placeholder="Ex: Paris, Remote"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="typeContrat">Type de contrat</Label>
                <Select
                  value={newAlerte.typeContrat}
                  onValueChange={(value) =>
                    setNewAlerte({ ...newAlerte, typeContrat: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                    <SelectItem value="Alternance">Alternance</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Niveau d'expérience</Label>
                <Select
                  value={newAlerte.experience}
                  onValueChange={(value) =>
                    setNewAlerte({ ...newAlerte, experience: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="1-3 ans">1-3 ans</SelectItem>
                    <SelectItem value="3-5 ans">3-5 ans</SelectItem>
                    <SelectItem value="5+ ans">5+ ans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequence">Fréquence des alertes</Label>
                <Select
                  value={newAlerte.frequence}
                  onValueChange={(value) =>
                    setNewAlerte({ ...newAlerte, frequence: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quotidienne">Quotidienne</SelectItem>
                    <SelectItem value="Hebdomadaire">Hebdomadaire</SelectItem>
                    <SelectItem value="Mensuelle">Mensuelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateAlerte}>Créer l'alerte</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des alertes */}
      <div className="relative">
        <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une alerte..."
          className="pl-10 mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlertes.map((alerte) => (
          <Card key={alerte.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{alerte.titre}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{alerte.localisation}</span>
                    <Briefcase className="h-4 w-4 ml-2" />
                    <span>{alerte.typeContrat}</span>
                    {alerte.salaireMin && alerte.salaireMax && (
                      <>
                        <DollarSign className="h-4 w-4 ml-2" />
                        <span>
                          {alerte.salaireMin}€ - {alerte.salaireMax}€
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alerte.active}
                    onCheckedChange={() => handleToggleActive(alerte.id)}
                  />
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(alerte.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Dernière mise à jour : </span>
                  <span className="font-medium">
                    {alerte.derniereMiseAJour.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span>Fréquence : </span>
                  <span className="font-medium">{alerte.frequence}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {alerte.nombreResultats} nouvelles offres
                  </span>
                </div>
              </div>

              {alerte.motsCles.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Mots-clés :
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alerte.motsCles.map((motCle, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted rounded-full text-sm"
                      >
                        {motCle}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AlertesEmploiPage;
