import { createClient } from "redis";

// Configuration Redis Cloud
const redisConfig = {
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || "UZII9yu2XTgnURGyxmluWHh2Pnx85pKy",
  socket: {
    host:
      process.env.REDIS_HOST ||
      "redis-13302.c281.us-east-1-2.ec2.redns.redis-cloud.com",
    port: parseInt(process.env.REDIS_PORT || "13302"),
  },
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// Instance Redis pour le cache
export const redis = createClient(redisConfig);

// Instance Redis pour les WebSockets (pub/sub)
export const redisPubSub = createClient(redisConfig);

// Gestionnaire d'erreurs Redis
redis.on("error", (error) => {
  console.error("Erreur Redis:", error);
});

redisPubSub.on("error", (error) => {
  console.error("Erreur Redis PubSub:", error);
});

// Connexion automatique
redis.connect().catch(console.error);
redisPubSub.connect().catch(console.error);

// Fonctions utilitaires pour le cache
export const cacheUtils = {
  // Générer une clé de cache
  generateKey: (prefix: string, id: string, suffix?: string): string => {
    return suffix ? `${prefix}:${id}:${suffix}` : `${prefix}:${id}`;
  },

  // Mettre en cache avec expiration
  set: async (key: string, data: any, ttl: number = 3600): Promise<void> => {
    try {
      await redis.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error("Erreur lors de la mise en cache:", error);
    }
  },

  // Récupérer du cache
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération du cache:", error);
      return null;
    }
  },

  // Supprimer du cache
  del: async (key: string): Promise<void> => {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Erreur lors de la suppression du cache:", error);
    }
  },

  // Supprimer plusieurs clés avec pattern
  delPattern: async (pattern: string): Promise<void> => {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du pattern:", error);
    }
  },

  // Vérifier si une clé existe
  exists: async (key: string): Promise<boolean> => {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Erreur lors de la vérification du cache:", error);
      return false;
    }
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
