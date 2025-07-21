"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Eye,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Types
type Application = {
  id: string;
  candidat: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    competences: string[];
    competencesList: { competence: string }[];
    cv: string;
    letterm: string;
  };
  note?: string;
  rating?: number;
  message?: string;
  cv?: string;
  createdAt: string;
  columnId: string;
  duedate?: string | null;
  notes: any[];
  checklist: any[];
  attachments: any[];
  files: any[];
  collaborateurs: any[];
};

interface CalendarViewProps {
  applications: Application[];
  onCardClick?: (application: Application) => void;
}

export default function CalendarView({
  applications,
  onCardClick,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fonction pour obtenir le statut de la date d'échéance
  const getDueDateStatus = (duedate: string | null | undefined) => {
    if (!duedate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(duedate);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: "overdue",
        days: Math.abs(diffDays),
        color: "bg-red-100 text-red-800",
      };
    } else if (diffDays === 0) {
      return {
        status: "today",
        days: 0,
        color: "bg-orange-100 text-orange-800",
      };
    } else if (diffDays <= 3) {
      return {
        status: "urgent",
        days: diffDays,
        color: "bg-yellow-100 text-yellow-800",
      };
    } else {
      return {
        status: "upcoming",
        days: diffDays,
        color: "bg-green-100 text-green-800",
      };
    }
  };

  // Organiser les applications par date d'échéance avec filtrage
  const applicationsByDate = useMemo(() => {
    const grouped: { [key: string]: Application[] } = {};

    applications.forEach((app) => {
      if (app.duedate) {
        const status = getDueDateStatus(app.duedate);

        // Appliquer le filtre de statut
        if (
          statusFilter === "all" ||
          (statusFilter === "overdue" && status?.status === "overdue") ||
          (statusFilter === "today" && status?.status === "today") ||
          (statusFilter === "urgent" && status?.status === "urgent") ||
          (statusFilter === "upcoming" && status?.status === "upcoming")
        ) {
          const dateKey = format(new Date(app.duedate), "yyyy-MM-dd");
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          grouped[dateKey].push(app);
        }
      }
    });

    return grouped;
  }, [applications, statusFilter]);

  // Générer les jours du mois
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Navigation du calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Fonction pour obtenir les applications d'une date donnée
  const getApplicationsForDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return applicationsByDate[dateKey] || [];
  };

  // Fonction pour obtenir la couleur de fond basée sur les applications
  const getDayBackgroundColor = (date: Date) => {
    const apps = getApplicationsForDate(date);
    if (apps.length === 0) return "";

    const hasOverdue = apps.some((app) => {
      const status = getDueDateStatus(app.duedate);
      return status?.status === "overdue";
    });

    const hasToday = apps.some((app) => {
      const status = getDueDateStatus(app.duedate);
      return status?.status === "today";
    });

    const hasUrgent = apps.some((app) => {
      const status = getDueDateStatus(app.duedate);
      return status?.status === "urgent";
    });

    if (hasOverdue) return "bg-red-50 border-red-200";
    if (hasToday) return "bg-orange-50 border-orange-200";
    if (hasUrgent) return "bg-yellow-50 border-yellow-200";
    return "bg-green-50 border-green-200";
  };

  // Fonction pour ouvrir les détails d'une application
  const handleCardClick = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  // Fonction pour fermer la modal
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedApplication(null);
  };

  // Fonction pour voir dans le tableau
  const handleViewInTable = () => {
    if (selectedApplication) {
      onCardClick?.(selectedApplication);
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête du calendrier */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy", { locale: fr })}
          </h2>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Aujourd'hui
        </Button>
      </div>

      {/* Filtres et légende */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filtres */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filtrer:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border rounded px-2 py-1 bg-background"
          >
            <option value="all">Toutes</option>
            <option value="overdue">En retard</option>
            <option value="today">Aujourd'hui</option>
            <option value="urgent">Urgent</option>
            <option value="upcoming">À venir</option>
          </select>
        </div>

        {/* Légende */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>En retard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
            <span>Aujourd'hui</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>Urgent (≤3j)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span>À venir</span>
          </div>
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-1">
        {/* En-têtes des jours de la semaine */}
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {/* Jours du mois */}
        {monthDays.map((day, index) => {
          const applications = getApplicationsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border rounded-lg ${
                isCurrentMonth ? "bg-background" : "bg-muted/20"
              } ${getDayBackgroundColor(day)} ${
                isCurrentDay ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {/* Numéro du jour */}
              <div
                className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                } ${isCurrentDay ? "text-blue-600 font-bold" : ""}`}
              >
                {format(day, "d")}
              </div>

              {/* Applications pour ce jour */}
              <div className="space-y-1">
                {applications.slice(0, 3).map((app) => {
                  const status = getDueDateStatus(app.duedate);
                  return (
                    <div
                      key={app.id}
                      className="cursor-pointer"
                      onClick={() => handleCardClick(app)}
                    >
                      <Card className="shadow-sm border-0 bg-white/80 hover:bg-white transition-colors">
                        <CardContent className="p-1.5">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs font-medium truncate">
                                {app.candidat.prenom} {app.candidat.nom}
                              </span>
                            </div>
                            {status && (
                              <Badge
                                variant="outline"
                                className={`text-xs px-1 py-0 h-auto flex-shrink-0 ${status.color}`}
                              >
                                {status.status === "overdue" &&
                                  `${status.days}j`}
                                {status.status === "today" && "Auj"}
                                {status.status === "urgent" &&
                                  `${status.days}j`}
                                {status.status === "upcoming" &&
                                  `${status.days}j`}
                              </Badge>
                            )}
                          </div>
                          {app.note && (
                            <p className="text-xs text-muted-foreground truncate">
                              {app.note}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}

                {/* Indicateur s'il y a plus d'applications */}
                {applications.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{applications.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistiques globales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {
                    applications.filter((app) => {
                      const status = getDueDateStatus(app.duedate);
                      return status?.status === "overdue";
                    }).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">En retard</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {
                    applications.filter((app) => {
                      const status = getDueDateStatus(app.duedate);
                      return status?.status === "today";
                    }).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Aujourd'hui</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    applications.filter((app) => {
                      const status = getDueDateStatus(app.duedate);
                      return status?.status === "urgent";
                    }).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Urgent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {
                    applications.filter((app) => {
                      const status = getDueDateStatus(app.duedate);
                      return status?.status === "upcoming";
                    }).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">À venir</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Échéances du mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(() => {
                const monthApplications = applications
                  .filter((app) => {
                    if (!app.duedate) return false;
                    const appDate = new Date(app.duedate);
                    return isSameMonth(appDate, currentDate);
                  })
                  .sort((a, b) => {
                    if (!a.duedate || !b.duedate) return 0;
                    return (
                      new Date(a.duedate).getTime() -
                      new Date(b.duedate).getTime()
                    );
                  });

                if (monthApplications.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune échéance ce mois-ci
                    </p>
                  );
                }

                return monthApplications.slice(0, 5).map((app) => {
                  const status = getDueDateStatus(app.duedate);
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {app.candidat.prenom} {app.candidat.nom}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(app.duedate!), "dd/MM", {
                            locale: fr,
                          })}
                        </span>
                        {status && (
                          <Badge className={`text-xs ${status.color}`}>
                            {status.status === "overdue" &&
                              `${status.days}j retard`}
                            {status.status === "today" && "Aujourd'hui"}
                            {status.status === "urgent" && `${status.days}j`}
                            {status.status === "upcoming" && `${status.days}j`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de détails de l'application */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Détails de la candidature
            </DialogTitle>
            <DialogDescription>
              Informations détaillées sur la candidature sélectionnée
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              {/* Informations du candidat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Candidat</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Nom:</strong> {selectedApplication.candidat.nom}
                    </p>
                    <p>
                      <strong>Prénom:</strong>{" "}
                      {selectedApplication.candidat.prenom}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {selectedApplication.candidat.email}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Date d'échéance</h3>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {selectedApplication.duedate ? (
                      <div className="space-y-1">
                        <p className="text-sm">
                          {format(
                            new Date(selectedApplication.duedate),
                            "PPP",
                            { locale: fr }
                          )}
                        </p>
                        {(() => {
                          const status = getDueDateStatus(
                            selectedApplication.duedate
                          );
                          if (!status) return null;
                          return (
                            <Badge className={`text-xs ${status.color}`}>
                              {status.status === "overdue" &&
                                `${status.days}j en retard`}
                              {status.status === "today" && "Aujourd'hui"}
                              {status.status === "urgent" &&
                                `${status.days}j restants (urgent)`}
                              {status.status === "upcoming" &&
                                `${status.days}j restants`}
                            </Badge>
                          );
                        })()}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Aucune date d'échéance
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Compétences */}
              {selectedApplication.candidat.competencesList &&
                selectedApplication.candidat.competencesList.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Compétences</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedApplication.candidat.competencesList.map(
                        (comp, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {comp.competence}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Note */}
              {selectedApplication.note && (
                <div>
                  <h3 className="font-semibold mb-2">Note</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.note}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseModal}>
                  Fermer
                </Button>
                <Button onClick={handleViewInTable}>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir dans le tableau
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
