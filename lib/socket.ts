import { Server as SocketIOServer } from "socket.io";
import { Server as NetServer } from "http";
import { redisPubSub } from "./redis";

export interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

// Types pour les événements WebSocket
export interface KanbanEvents {
  // Événements de colonnes
  "column:created": (data: { column: any; offerId: string }) => void;
  "column:updated": (data: { column: any; offerId: string }) => void;
  "column:deleted": (data: { columnId: string; offerId: string }) => void;
  "column:reordered": (data: { columns: any[]; offerId: string }) => void;

  // Événements d'applications
  "application:moved": (data: {
    applicationId: string;
    newColumnId: string;
    offerId: string;
    application: any;
  }) => void;
  "application:updated": (data: {
    applicationId: string;
    offerId: string;
    application: any;
  }) => void;

  // Événements de notes
  "note:added": (data: {
    applicationId: string;
    note: any;
    offerId: string;
  }) => void;
  "note:updated": (data: {
    applicationId: string;
    note: any;
    offerId: string;
  }) => void;

  // Événements de checklist
  "checklist:item:added": (data: {
    applicationId: string;
    item: any;
    offerId: string;
  }) => void;
  "checklist:item:updated": (data: {
    applicationId: string;
    item: any;
    offerId: string;
  }) => void;
  "checklist:item:deleted": (data: {
    applicationId: string;
    itemId: string;
    offerId: string;
  }) => void;

  // Événements de collaborateurs
  "collaborator:assigned": (data: {
    applicationId: string;
    collaborateur: any;
    offerId: string;
  }) => void;
  "collaborator:unassigned": (data: {
    applicationId: string;
    collaborateurId: string;
    offerId: string;
  }) => void;

  // Événements de fichiers
  "attachment:added": (data: {
    applicationId: string;
    file: any;
    offerId: string;
  }) => void;
  "attachment:deleted": (data: {
    applicationId: string;
    fileId: string;
    offerId: string;
  }) => void;

  // Événements de date d'échéance
  "duedate:updated": (data: {
    applicationId: string;
    duedate: string | null;
    offerId: string;
  }) => void;
}

// Configuration du serveur WebSocket
export const configureSocket = (server: SocketServer) => {
  if (!server.io) {
    const io = new SocketIOServer(server, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    server.io = io;

    // Gestion des connexions
    io.on("connection", (socket) => {
      console.log("Client connecté:", socket.id);

      // Rejoindre une room pour une offre spécifique
      socket.on("join:offer", (offerId: string) => {
        socket.join(`offer:${offerId}`);
        console.log(`Client ${socket.id} a rejoint l'offre ${offerId}`);
      });

      // Quitter une room
      socket.on("leave:offer", (offerId: string) => {
        socket.leave(`offer:${offerId}`);
        console.log(`Client ${socket.id} a quitté l'offre ${offerId}`);
      });

      // Gestion de la déconnexion
      socket.on("disconnect", () => {
        console.log("Client déconnecté:", socket.id);
      });
    });

    // Configuration Redis Pub/Sub pour la synchronisation entre serveurs
    const setupRedisPubSub = async () => {
      // Vérifier si Redis est désactivé
      const DISABLE_CACHE_LOCAL =
        process.env.NODE_ENV === "development" &&
        process.env.DISABLE_CACHE === "true";

      if (DISABLE_CACHE_LOCAL) {
        console.log(
          "Redis désactivé - WebSockets fonctionneront sans synchronisation entre serveurs"
        );
        return;
      }

      try {
        // Vérifier si Redis est disponible
        if (!redisPubSub) {
          console.warn(
            "Redis non disponible - WebSockets fonctionneront sans synchronisation entre serveurs"
          );
          return;
        }

        // Vérifier si Redis est connecté
        if (!redisPubSub.isOpen) {
          console.warn(
            "Redis non connecté - WebSockets fonctionneront sans synchronisation entre serveurs"
          );
          return;
        }

        // Créer un client Redis dédié pour les abonnements
        const subscriber = redisPubSub.duplicate();
        await subscriber.connect();

        await subscriber.subscribe("kanban:events", (message) => {
          try {
            const event = JSON.parse(message);
            const { type, data, offerId } = event;

            // Diffuser l'événement aux clients connectés à cette offre
            if (offerId) {
              io.to(`offer:${offerId}`).emit(type, data);
            }
          } catch (error) {
            console.error(
              "Erreur lors du traitement de l'événement Redis:",
              error
            );
          }
        });

        console.log("Redis Pub/Sub configuré avec succès");
      } catch (error) {
        console.warn(
          "Erreur lors de la configuration Redis Pub/Sub (normal en local):",
          error
        );
      }
    };

    setupRedisPubSub();
  }

  return server.io;
};

// Fonction utilitaire pour publier des événements
export const publishEvent = async (
  type: string,
  data: any,
  offerId: string
) => {
  // Vérifier si Redis est désactivé
  const DISABLE_CACHE_LOCAL =
    process.env.NODE_ENV === "development" &&
    process.env.DISABLE_CACHE === "true";

  if (DISABLE_CACHE_LOCAL) {
    console.log("Redis désactivé - événement non publié:", type);
    return;
  }

  try {
    // Vérifier si Redis est disponible
    if (!redisPubSub) {
      console.warn("Redis non disponible - événement non publié:", type);
      return;
    }

    // Vérifier si Redis est connecté
    if (!redisPubSub.isOpen) {
      console.warn("Redis non connecté - événement non publié:", type);
      return;
    }

    const event = {
      type,
      data,
      offerId,
      timestamp: new Date().toISOString(),
    };

    await redisPubSub.publish("kanban:events", JSON.stringify(event));
  } catch (error) {
    console.warn(
      "Erreur lors de la publication de l'événement (normal en local):",
      error
    );
  }
};

// Fonctions spécifiques pour les événements Kanban
export const kanbanEvents = {
  // Colonnes
  columnCreated: (column: any, offerId: string) =>
    publishEvent("column:created", { column, offerId }, offerId),

  columnUpdated: (column: any, offerId: string) =>
    publishEvent("column:updated", { column, offerId }, offerId),

  columnDeleted: (columnId: string, offerId: string) =>
    publishEvent("column:deleted", { columnId, offerId }, offerId),

  columnsReordered: (columns: any[], offerId: string) =>
    publishEvent("column:reordered", { columns, offerId }, offerId),

  // Applications
  applicationMoved: (
    applicationId: string,
    newColumnId: string,
    offerId: string,
    application: any
  ) =>
    publishEvent(
      "application:moved",
      { applicationId, newColumnId, offerId, application },
      offerId
    ),

  applicationUpdated: (
    applicationId: string,
    offerId: string,
    application: any
  ) =>
    publishEvent(
      "application:updated",
      { applicationId, offerId, application },
      offerId
    ),

  // Notes
  noteAdded: (applicationId: string, note: any, offerId: string) =>
    publishEvent("note:added", { applicationId, note, offerId }, offerId),

  noteUpdated: (applicationId: string, note: any, offerId: string) =>
    publishEvent("note:updated", { applicationId, note, offerId }, offerId),

  // Checklist
  checklistItemAdded: (applicationId: string, item: any, offerId: string) =>
    publishEvent(
      "checklist:item:added",
      { applicationId, item, offerId },
      offerId
    ),

  checklistItemUpdated: (applicationId: string, item: any, offerId: string) =>
    publishEvent(
      "checklist:item:updated",
      { applicationId, item, offerId },
      offerId
    ),

  checklistItemDeleted: (
    applicationId: string,
    itemId: string,
    offerId: string
  ) =>
    publishEvent(
      "checklist:item:deleted",
      { applicationId, itemId, offerId },
      offerId
    ),

  // Collaborateurs
  collaboratorAssigned: (
    applicationId: string,
    collaborateur: any,
    offerId: string
  ) =>
    publishEvent(
      "collaborator:assigned",
      { applicationId, collaborateur, offerId },
      offerId
    ),

  collaboratorUnassigned: (
    applicationId: string,
    collaborateurId: string,
    offerId: string
  ) =>
    publishEvent(
      "collaborator:unassigned",
      { applicationId, collaborateurId, offerId },
      offerId
    ),

  // Fichiers
  attachmentAdded: (applicationId: string, file: any, offerId: string) =>
    publishEvent("attachment:added", { applicationId, file, offerId }, offerId),

  attachmentDeleted: (applicationId: string, fileId: string, offerId: string) =>
    publishEvent(
      "attachment:deleted",
      { applicationId, fileId, offerId },
      offerId
    ),

  // Date d'échéance
  duedateUpdated: (
    applicationId: string,
    duedate: string | null,
    offerId: string
  ) =>
    publishEvent(
      "duedate:updated",
      { applicationId, duedate, offerId },
      offerId
    ),
};
