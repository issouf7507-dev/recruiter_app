#!/usr/bin/env node

/**
 * Script de vérification des variables d'environnement
 * Usage: node scripts/check-env.js
 */

const requiredEnvVars = [
  "JWT_SECRET",
  "JWT_SECRET_CANDIDAT",
  "DATABASE_URL",
  "EMAIL_USER",
  "EMAIL_PASS",
];

const optionalEnvVars = ["NEXT_PUBLIC_APP_URL"];

function checkEnvironmentVariables() {
  console.log("🔍 Vérification des variables d'environnement...\n");

  const missing = [];
  const present = [];
  const optional = [];

  // Vérifier les variables requises
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      present.push(varName);
    }
  });

  // Vérifier les variables optionnelles
  optionalEnvVars.forEach((varName) => {
    if (process.env[varName]) {
      optional.push(varName);
    }
  });

  // Afficher les résultats
  if (present.length > 0) {
    console.log("✅ Variables présentes:");
    present.forEach((varName) => {
      console.log(`   - ${varName}`);
    });
    console.log("");
  }

  if (optional.length > 0) {
    console.log("ℹ️  Variables optionnelles présentes:");
    optional.forEach((varName) => {
      console.log(`   - ${varName}`);
    });
    console.log("");
  }

  if (missing.length > 0) {
    console.log("❌ Variables manquantes:");
    missing.forEach((varName) => {
      console.log(`   - ${varName}`);
    });
    console.log("");
    console.log(
      "⚠️  ATTENTION: Ces variables sont requises pour le bon fonctionnement de l'application."
    );
    console.log(
      "   Veuillez les configurer dans votre fichier .env ou dans les variables d'environnement de votre VPS."
    );
    console.log("");

    // Suggestions pour chaque variable manquante
    console.log("💡 Suggestions de configuration:");
    missing.forEach((varName) => {
      switch (varName) {
        case "JWT_SECRET":
          console.log(
            `   - ${varName}: Clé secrète pour signer les tokens JWT des recruteurs (ex: "votre-secret-jwt-recruiter")`
          );
          break;
        case "JWT_SECRET_CANDIDAT":
          console.log(
            `   - ${varName}: Clé secrète pour signer les tokens JWT des candidats (ex: "votre-secret-jwt-candidate")`
          );
          break;
        case "DATABASE_URL":
          console.log(
            `   - ${varName}: URL de connexion à la base de données (ex: "postgresql://user:password@localhost:5432/dbname")`
          );
          break;
        case "REDIS_URL":
          console.log(
            `   - ${varName}: URL de connexion à Redis (ex: "redis://localhost:6379")`
          );
          break;
        case "EMAIL_HOST":
          console.log(`   - ${varName}: Serveur SMTP (ex: "smtp.gmail.com")`);
          break;
        case "EMAIL_PORT":
          console.log(`   - ${varName}: Port SMTP (ex: "587")`);
          break;
        case "EMAIL_USER":
          console.log(
            `   - ${varName}: Email d'envoi (ex: "votre-email@gmail.com")`
          );
          break;
        case "EMAIL_PASS":
          console.log(
            `   - ${varName}: Mot de passe de l'email (ex: "votre-mot-de-passe-app")`
          );
          break;
        default:
          console.log(`   - ${varName}: Variable requise non documentée`);
      }
    });

    process.exit(1);
  } else {
    console.log(
      "🎉 Toutes les variables d'environnement requises sont configurées !"
    );
    console.log("✅ L'application devrait fonctionner correctement.");
  }
}

// Exécuter la vérification
if (require.main === module) {
  checkEnvironmentVariables();
}

module.exports = { checkEnvironmentVariables };
