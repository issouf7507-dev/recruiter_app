// Configuration centralisée pour les variables d'environnement
export const config = {
  jwt: {
    secret: process.env.JWT_SECRET,
    secretCandidat: process.env.JWT_SECRET_CANDIDAT,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  app: {
    url:
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "http://localhost:3000",
    environment: process.env.NODE_ENV || "development",
  },
};

// Fonction pour valider la configuration
export function validateConfig() {
  const requiredVars = ["JWT_SECRET", "JWT_SECRET_CANDIDAT", "DATABASE_URL"];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("Variables d'environnement manquantes:", missingVars);
    return false;
  }

  return true;
}

// Fonction pour obtenir la configuration avec validation
export function getConfig() {
  if (!validateConfig()) {
    throw new Error(
      "Configuration invalide - variables d'environnement manquantes"
    );
  }
  return config;
}
