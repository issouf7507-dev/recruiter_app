import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { KanbanEvents } from "@/lib/socket";

interface UseWebSocketOptions {
  offerId: string;
  onEvent?: (eventType: string, data: any) => void;
  enabled?: boolean;
}

export const useWebSocket = ({
  offerId,
  onEvent,
  enabled = true,
}: UseWebSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

  // Initialiser la connexion WebSocket
  const connect = useCallback(() => {
    if (!enabled || socketRef.current?.connected) return;

    const socket = io(
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      {
        path: "/api/socketio",
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      }
    );

    socketRef.current = socket;

    // Gestion des événements de connexion
    socket.on("connect", () => {
      console.log("WebSocket connecté");
      isConnectedRef.current = true;

      // Rejoindre la room pour cette offre
      socket.emit("join:offer", offerId);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket déconnecté");
      isConnectedRef.current = false;
    });

    socket.on("connect_error", (error) => {
      console.error("Erreur de connexion WebSocket:", error);
    });

    // Écouter les événements Kanban
    const kanbanEventTypes: (keyof KanbanEvents)[] = [
      "column:created",
      "column:updated",
      "column:deleted",
      "column:reordered",
      "application:moved",
      "application:updated",
      "note:added",
      "note:updated",
      "checklist:item:added",
      "checklist:item:updated",
      "checklist:item:deleted",
      "collaborator:assigned",
      "collaborator:unassigned",
      "attachment:added",
      "attachment:deleted",
      "duedate:updated",
    ];

    kanbanEventTypes.forEach((eventType) => {
      socket.on(eventType, (data) => {
        console.log(`Événement reçu: ${eventType}`, data);
        onEvent?.(eventType, data);
      });
    });
  }, [offerId, onEvent, enabled]);

  // Déconnecter
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("leave:offer", offerId);
      socketRef.current.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    }
  }, [offerId]);

  // Émettre un événement
  const emit = useCallback((eventType: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventType, data);
    }
  }, []);

  // État de connexion
  const isConnected = useCallback(() => {
    return isConnectedRef.current;
  }, []);

  // Effet pour gérer la connexion/déconnexion
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup à la déconnexion
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Effet pour rejoindre/quitter la room quand l'offerId change
  useEffect(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join:offer", offerId);
    }
  }, [offerId]);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    connect,
    disconnect,
  };
};
