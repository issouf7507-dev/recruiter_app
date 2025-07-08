import { createClient } from "redis";

// Configuration Redis Cloud
const redisConfig = {
  username: "default",
  password: "6wzoWWfpSWJpjFVLCNqX55WUOH9iAFEZ",
  socket: {
    host: "redis-16217.c232.us-east-1-2.ec2.redns.redis-cloud.com",
    port: 16217,
  },
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

// Option pour désactiver le cache en local (définir à true pour désactiver)
const DISABLE_CACHE_LOCAL = true; // Force la désactivation pour résoudre les erreurs

// Instance Redis pour le cache (créée seulement si nécessaire)
export const redis = DISABLE_CACHE_LOCAL ? null : createClient(redisConfig);

// Instance Redis pour les WebSockets (pub/sub) (créée seulement si nécessaire)
export const redisPubSub = DISABLE_CACHE_LOCAL
  ? null
  : createClient(redisConfig);

// Gestionnaire d'erreurs Redis (seulement si Redis n'est pas désactivé)
if (!DISABLE_CACHE_LOCAL && redis && redisPubSub) {
  redis.on("error", (error) => {
    console.error("Erreur Redis:", error);
  });

  redisPubSub.on("error", (error) => {
    console.error("Erreur Redis PubSub:", error);
  });

  // Connexion automatique seulement si Redis n'est pas désactivé
  redis.connect().catch((error) => {
    console.warn(
      "Impossible de se connecter à Redis (normal si désactivé):",
      error.message
    );
  });
  redisPubSub.connect().catch((error) => {
    console.warn(
      "Impossible de se connecter à Redis PubSub (normal si désactivé):",
      error.message
    );
  });
} else {
  console.log("Redis désactivé en local - pas de connexion établie");
}

// Fonctions utilitaires pour le cache
export const cacheUtils = {
  // Générer une clé de cache
  generateKey: (prefix: string, id: string, suffix?: string): string => {
    return suffix ? `${prefix}:${id}:${suffix}` : `${prefix}:${id}`;
  },

  // Mettre en cache avec expiration
  set: async (key: string, data: any, ttl: number = 3600): Promise<void> => {
    if (DISABLE_CACHE_LOCAL || !redis) {
      console.log("Cache désactivé en local, skip set:", key);
      return;
    }

    try {
      if (!redis.isOpen) {
        console.warn("Redis non connecté, skip set:", key);
        return;
      }
      await redis.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error("Erreur lors de la mise en cache:", error);
    }
  },

  // Récupérer du cache
  get: async <T>(key: string): Promise<T | null> => {
    if (DISABLE_CACHE_LOCAL || !redis) {
      console.log("Cache désactivé en local, skip get:", key);
      return null;
    }

    try {
      if (!redis.isOpen) {
        console.warn("Redis non connecté, skip get:", key);
        return null;
      }
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération du cache:", error);
      return null;
    }
  },

  // Supprimer du cache
  del: async (key: string): Promise<void> => {
    if (DISABLE_CACHE_LOCAL || !redis) {
      console.log("Cache désactivé en local, skip del:", key);
      return;
    }

    try {
      if (!redis.isOpen) {
        console.warn("Redis non connecté, skip del:", key);
        return;
      }
      await redis.del(key);
    } catch (error) {
      console.error("Erreur lors de la suppression du cache:", error);
    }
  },

  // Supprimer plusieurs clés avec pattern
  delPattern: async (pattern: string): Promise<void> => {
    if (DISABLE_CACHE_LOCAL || !redis) {
      console.log("Cache désactivé en local, skip delPattern:", pattern);
      return;
    }

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
    if (DISABLE_CACHE_LOCAL || !redis) {
      console.log("Cache désactivé en local, skip exists:", key);
      return false;
    }

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
