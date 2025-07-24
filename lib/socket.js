const { Server: SocketIOServer } = require("socket.io");
const { redisPubSub } = require("./redis");

// Configuration du serveur WebSocket
const configureSocket = (server) => {
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
      socket.on("join:offer", (offerId) => {
        socket.join(`offer:${offerId}`);
        console.log(`Client ${socket.id} a rejoint l'offre ${offerId}`);
      });

      // Quitter une room
      socket.on("leave:offer", (offerId) => {
        socket.leave(`offer:${offerId}`);
        console.log(`Client ${socket.id} a quitté l'offre ${offerId}`);
      });

      // Gestion de la déconnexion
      socket.on("disconnect", () => {
        console.log("Client déconnecté:", socket.id);
      });
    });

    // Redis PubSub désactivé
    console.log(
      "Redis PubSub désactivé - WebSockets fonctionneront sans synchronisation entre serveurs"
    );
  }

  return server.io;
};

// Fonction utilitaire pour publier des événements (ne fait rien)
const publishEvent = async (type, data, offerId) => {
  console.log("Redis désactivé, skip publish event:", type);
  return;
};

// Fonctions spécifiques pour les événements Kanban
const kanbanEvents = {
  // Colonnes
  columnCreated: (column, offerId) =>
    publishEvent("column:created", { column, offerId }, offerId),

  columnUpdated: (column, offerId) =>
    publishEvent("column:updated", { column, offerId }, offerId),

  columnDeleted: (columnId, offerId) =>
    publishEvent("column:deleted", { columnId, offerId }, offerId),

  columnsReordered: (columns, offerId) =>
    publishEvent("column:reordered", { columns, offerId }, offerId),

  // Applications
  applicationMoved: (applicationId, newColumnId, offerId, application) =>
    publishEvent(
      "application:moved",
      { applicationId, newColumnId, offerId, application },
      offerId
    ),

  applicationUpdated: (applicationId, offerId, application) =>
    publishEvent(
      "application:updated",
      { applicationId, offerId, application },
      offerId
    ),

  // Notes
  noteAdded: (applicationId, note, offerId) =>
    publishEvent("note:added", { applicationId, note, offerId }, offerId),

  noteUpdated: (applicationId, note, offerId) =>
    publishEvent("note:updated", { applicationId, note, offerId }, offerId),

  // Checklist
  checklistItemAdded: (applicationId, item, offerId) =>
    publishEvent(
      "checklist:item:added",
      { applicationId, item, offerId },
      offerId
    ),

  checklistItemUpdated: (applicationId, item, offerId) =>
    publishEvent(
      "checklist:item:updated",
      { applicationId, item, offerId },
      offerId
    ),

  checklistItemDeleted: (applicationId, itemId, offerId) =>
    publishEvent(
      "checklist:item:deleted",
      { applicationId, itemId, offerId },
      offerId
    ),

  // Collaborateurs
  collaboratorAssigned: (applicationId, collaborateur, offerId) =>
    publishEvent(
      "collaborator:assigned",
      { applicationId, collaborateur, offerId },
      offerId
    ),

  collaboratorUnassigned: (applicationId, collaborateurId, offerId) =>
    publishEvent(
      "collaborator:unassigned",
      { applicationId, collaborateurId, offerId },
      offerId
    ),

  // Fichiers
  attachmentAdded: (applicationId, file, offerId) =>
    publishEvent("attachment:added", { applicationId, file, offerId }, offerId),

  attachmentDeleted: (applicationId, fileId, offerId) =>
    publishEvent(
      "attachment:deleted",
      { applicationId, fileId, offerId },
      offerId
    ),

  // Date d'échéance
  duedateUpdated: (applicationId, duedate, offerId) =>
    publishEvent(
      "duedate:updated",
      { applicationId, duedate, offerId },
      offerId
    ),
};

module.exports = {
  configureSocket,
  kanbanEvents,
  publishEvent,
};
