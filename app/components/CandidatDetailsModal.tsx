"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  GraduationCap,
  Star,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CandidatDetailsModalProps {
  candidat: any;
  isOpen: boolean;
  onClose: () => void;
  selectedCompetences: string[];
}

const CandidatDetailsModal: React.FC<CandidatDetailsModalProps> = ({
  candidat,
  isOpen,
  onClose,
  selectedCompetences,
}) => {
  if (!candidat) return null;

  const getCompetenceMatchCount = () => {
    if (selectedCompetences.length === 0) return 0;
    const candidatCompetences = candidat.candidatCompetences.map(
      (c: any) => c.competence
    );
    return selectedCompetences.filter((c) => candidatCompetences.includes(c))
      .length;
  };

  const getMatchPercentage = () => {
    if (selectedCompetences.length === 0) return 0;
    const matchCount = getCompetenceMatchCount();
    return Math.round((matchCount / selectedCompetences.length) * 100);
  };

  const paysList = [
    { value: "CI", label: "Côte d'Ivoire" },
    { value: "BF", label: "Burkina Faso" },
    { value: "ML", label: "Mali" },
    { value: "SN", label: "Sénégal" },
    { value: "GN", label: "Guinée" },
    { value: "TG", label: "Togo" },
    { value: "BJ", label: "Bénin" },
    { value: "NE", label: "Niger" },
    { value: "CM", label: "Cameroun" },
    { value: "FR", label: "France" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={candidat.image || candidat.user.image} />
              <AvatarFallback>
                {candidat.prenom?.[0]}
                {candidat.nom?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">
                {candidat.prenom} {candidat.nom}
              </div>
              {selectedCompetences.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">
                    {getMatchPercentage()}% de correspondance
                  </span>
                  <span>
                    ({getCompetenceMatchCount()}/{selectedCompetences.length}{" "}
                    compétences)
                  </span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span>{candidat.user.email}</span>
              </div>
              {candidat.telephone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Téléphone:</span>
                  <span>{candidat.telephone}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Localisation:</span>
                <span>
                  {candidat.ville},{" "}
                  {paysList.find((p) => p.value === candidat.pays)?.label}
                </span>
              </div>
              {candidat.dateNaissance && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date de naissance:</span>
                  <span>
                    {format(new Date(candidat.dateNaissance), "dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {candidat.bio && (
            <div>
              <h3 className="font-semibold mb-2">À propos</h3>
              <p className="text-sm text-muted-foreground">{candidat.bio}</p>
            </div>
          )}

          <Separator />

          {/* Compétences */}
          <div>
            <h3 className="font-semibold mb-3">Compétences</h3>
            <div className="flex flex-wrap gap-2">
              {candidat.candidatCompetences.map((comp: any) => (
                <Badge
                  key={comp.competence}
                  variant={
                    selectedCompetences.includes(comp.competence)
                      ? "default"
                      : "secondary"
                  }
                >
                  {comp.competence.charAt(0).toUpperCase() +
                    comp.competence.slice(1)}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Expériences */}
          {candidat.experiences && candidat.experiences.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Expériences professionnelles
              </h3>
              <div className="space-y-4">
                {candidat.experiences.map((exp: any, index: number) => (
                  <div
                    key={index}
                    className="border-l-2 border-primary/20 pl-4"
                  >
                    <div className="font-medium">{exp.poste}</div>
                    <div className="text-sm text-muted-foreground">
                      {exp.entreprise}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(exp.dateDebut), "MMM yyyy", {
                        locale: fr,
                      })}{" "}
                      -
                      {exp.dateFin
                        ? format(new Date(exp.dateFin), " MMM yyyy", {
                            locale: fr,
                          })
                        : " Présent"}
                    </div>
                    {exp.description && (
                      <p className="text-sm mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formations */}
          {candidat.formations && candidat.formations.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Formations
              </h3>
              <div className="space-y-4">
                {candidat.formations.map((formation: any, index: number) => (
                  <div
                    key={index}
                    className="border-l-2 border-primary/20 pl-4"
                  >
                    <div className="font-medium">{formation.diplome}</div>
                    <div className="text-sm text-muted-foreground">
                      {formation.etablissement}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(formation.dateDebut), "MMM yyyy", {
                        locale: fr,
                      })}{" "}
                      -
                      {formation.dateFin
                        ? format(new Date(formation.dateFin), " MMM yyyy", {
                            locale: fr,
                          })
                        : " Présent"}
                    </div>
                    {formation.description && (
                      <p className="text-sm mt-2">{formation.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <Separator />
          <div>
            <h3 className="font-semibold mb-3">Documents</h3>
            <div className="flex gap-2">
              {candidat.cv && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={candidat.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir le CV
                  </a>
                </Button>
              )}
              {candidat.letterm && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={candidat.letterm}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lettre de motivation
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Contacter le candidat
            </Button>
            {candidat.telephone && (
              <Button variant="outline" className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidatDetailsModal;
