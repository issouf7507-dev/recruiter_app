const { createClient } = require("redis");

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

// Instance Redis pour le cache
const redis = createClient(redisConfig);

// Instance Redis pour les WebSockets (pub/sub)
const redisPubSub = createClient(redisConfig);

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
const cacheUtils = {
  // Générer une clé de cache
  generateKey: (prefix, id, suffix) => {
    return suffix ? `${prefix}:${id}:${suffix}` : `${prefix}:${id}`;
  },

  // Mettre en cache avec expiration
  set: async (key, data, ttl = 3600) => {
    try {
      await redis.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error("Erreur lors de la mise en cache:", error);
    }
  },

  // Récupérer du cache
  get: async (key) => {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération du cache:", error);
      return null;
    }
  },

  // Supprimer du cache
  del: async (key) => {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Erreur lors de la suppression du cache:", error);
    }
  },

  // Supprimer plusieurs clés avec pattern
  delPattern: async (pattern) => {
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
  exists: async (key) => {
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
const CACHE_KEYS = {
  KANBAN_BOARD: (offerId) => `kanban:board:${offerId}`,
  KANBAN_COLUMNS: (offerId) => `kanban:columns:${offerId}`,
  APPLICATIONS: (offerId) => `kanban:applications:${offerId}`,
  APPLICATION_DETAILS: (applicationId) => `kanban:application:${applicationId}`,
  COLLABORATEURS: (recruteurId) => `collaborateurs:${recruteurId}`,
  NOTES: (applicationId) => `notes:${applicationId}`,
  CHECKLIST: (applicationId) => `checklist:${applicationId}`,
  ATTACHMENTS: (applicationId) => `attachments:${applicationId}`,
};

// Durées de cache (en secondes)
const CACHE_TTL = {
  KANBAN_BOARD: 300, // 5 minutes
  APPLICATIONS: 180, // 3 minutes
  APPLICATION_DETAILS: 600, // 10 minutes
  COLLABORATEURS: 1800, // 30 minutes
  NOTES: 300, // 5 minutes
  CHECKLIST: 300, // 5 minutes
  ATTACHMENTS: 1800, // 30 minutes
};

module.exports = {
  redis,
  redisPubSub,
  cacheUtils,
  CACHE_KEYS,
  CACHE_TTL,
};
