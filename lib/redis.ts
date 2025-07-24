import { createClient } from "redis";

// DÉSACTIVATION COMPLÈTE DE REDIS
console.log("Redis complètement désactivé - pas de connexion établie");

// Instance Redis pour le cache (null)
export const redis = null;

// Instance Redis pour les WebSockets (pub/sub) (null)
export const redisPubSub = null;

// Fonctions utilitaires pour le cache (ne font rien)
export const cacheUtils = {
  // Générer une clé de cache
  generateKey: (prefix: string, id: string, suffix?: string): string => {
    return suffix ? `${prefix}:${id}:${suffix}` : `${prefix}:${id}`;
  },

  // Mettre en cache avec expiration (ne fait rien)
  set: async (key: string, data: any, ttl: number = 3600): Promise<void> => {
    console.log("Cache désactivé, skip set:", key);
    return;
  },

  // Récupérer du cache (retourne null)
  get: async <T>(key: string): Promise<T | null> => {
    console.log("Cache désactivé, skip get:", key);
    return null;
  },

  // Supprimer du cache (ne fait rien)
  del: async (key: string): Promise<void> => {
    console.log("Cache désactivé, skip del:", key);
    return;
  },

  // Supprimer plusieurs clés avec pattern (ne fait rien)
  delPattern: async (pattern: string): Promise<void> => {
    console.log("Cache désactivé, skip delPattern:", pattern);
    return;
  },

  // Vérifier si une clé existe (retourne false)
  exists: async (key: string): Promise<boolean> => {
    console.log("Cache désactivé, skip exists:", key);
    return false;
  },
};

// Clés de cache pour le Kanban
export const CACHE_KEYS = {
  KANBAN_BOARD: (offerId: string) => `kanban:board:${offerId}`,
  KANBAN_COLUMNS: (offerId: string) => `kanban:columns:${offerId}`,
  APPLICATIONS: (offerId: string) => `kanban:applications:${offerId}`,
  APPLICATION_DETAILS: (applicationId: string) =>
    `kanban:application:${applicationId}`,
  COLLABORATEURS: (recruteurId: string) => `collaborateurs:${recruteurId}`,
  NOTES: (applicationId: string) => `notes:${applicationId}`,
  CHECKLIST: (applicationId: string) => `checklist:${applicationId}`,
  ATTACHMENTS: (applicationId: string) => `attachments:${applicationId}`,
};

// Durées de cache (en secondes)
export const CACHE_TTL = {
  KANBAN_BOARD: 300, // 5 minutes
  APPLICATIONS: 180, // 3 minutes
  APPLICATION_DETAILS: 600, // 10 minutes
  COLLABORATEURS: 1800, // 30 minutes
  NOTES: 300, // 5 minutes
  CHECKLIST: 300, // 5 minutes
  ATTACHMENTS: 1800, // 30 minutes
};
