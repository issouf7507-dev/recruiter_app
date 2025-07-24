const { createClient } = require("redis");

// DÉSACTIVATION COMPLÈTE DE REDIS
console.log("Redis complètement désactivé - pas de connexion établie");

// Instance Redis pour le cache (null)
const redis = null;

// Instance Redis pour les WebSockets (pub/sub) (null)
const redisPubSub = null;

// Fonctions utilitaires pour le cache (ne font rien)
const cacheUtils = {
  // Générer une clé de cache
  generateKey: (prefix, id, suffix) => {
    return suffix ? `${prefix}:${id}:${suffix}` : `${prefix}:${id}`;
  },

  // Mettre en cache avec expiration (ne fait rien)
  set: async (key, data, ttl = 3600) => {
    console.log("Cache désactivé, skip set:", key);
    return;
  },

  // Récupérer du cache (retourne null)
  get: async (key) => {
    console.log("Cache désactivé, skip get:", key);
    return null;
  },

  // Supprimer du cache (ne fait rien)
  del: async (key) => {
    console.log("Cache désactivé, skip del:", key);
    return;
  },

  // Supprimer plusieurs clés avec pattern (ne fait rien)
  delPattern: async (pattern) => {
    console.log("Cache désactivé, skip delPattern:", pattern);
    return;
  },

  // Vérifier si une clé existe (retourne false)
  exists: async (key) => {
    console.log("Cache désactivé, skip exists:", key);
    return false;
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
