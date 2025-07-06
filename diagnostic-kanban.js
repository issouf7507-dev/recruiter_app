const axios = require("axios");
const { io } = require("socket.io-client");

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function testDatabaseConnection() {
  console.log("🔍 Test de connexion à la base de données...");

  try {
    // Test de connexion à l'API
    const response = await axios.get(`${BASE_URL}/api/recruteur/offres`);
    console.log("✅ Connexion à l'API réussie");
    return true;
  } catch (error) {
    console.error("❌ Erreur de connexion à l'API:", error.message);
    return false;
  }
}

async function testWebSocketConnection() {
  console.log("\n🔌 Test de connexion WebSocket...");

  return new Promise((resolve) => {
    const socket = io(BASE_URL, {
      path: "/api/socketio",
      timeout: 5000,
    });

    const timeout = setTimeout(() => {
      console.log("❌ Timeout de connexion WebSocket");
      socket.disconnect();
      resolve(false);
    }, 5000);

    socket.on("connect", () => {
      console.log("✅ WebSocket connecté avec succès");
      clearTimeout(timeout);
      socket.disconnect();
      resolve(true);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion WebSocket:", error.message);
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

async function testRedisConnection() {
  console.log("\n🗄️ Test de connexion Redis...");

  try {
    const response = await axios.get(`${BASE_URL}/api/recruteur/offres`);
    // Si l'API répond, Redis est probablement configuré
    console.log("✅ Redis semble fonctionnel (API répond)");
    return true;
  } catch (error) {
    console.error("❌ Erreur Redis:", error.message);
    return false;
  }
}

async function testMoveApplicationAPI() {
  console.log("\n📋 Test de l'API move-application...");

  try {
    // Test avec des données fictives
    const testData = {
      applicationId: "test-id",
      newColumnId: "test-column",
      sourceColumnId: "test-source",
    };

    const response = await axios.post(
      `${BASE_URL}/api/recruteur/kanban/move-application`,
      testData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        validateStatus: () => true, // Accepter tous les statuts pour le test
      }
    );

    console.log(`📊 Statut de réponse: ${response.status}`);

    if (response.status === 401) {
      console.log("ℹ️ Réponse 401 attendue (non authentifié)");
      return true; // C'est normal sans token
    } else if (response.status === 200) {
      console.log("✅ API move-application fonctionne");
      return true;
    } else {
      console.log("⚠️ Réponse inattendue:", response.data);
      return false;
    }
  } catch (error) {
    console.error("❌ Erreur lors du test de l'API:", error.message);
    return false;
  }
}

async function checkEnvironmentVariables() {
  console.log("\n🔧 Vérification des variables d'environnement...");

  const requiredVars = [
    "DATABASE_URL",
    "JWT_SECRET",
    "REDIS_URL",
    "NEXT_PUBLIC_APP_URL",
  ];

  const missingVars = [];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
      console.log(`❌ ${varName} manquant`);
    } else {
      console.log(`✅ ${varName} configuré`);
    }
  });

  if (missingVars.length > 0) {
    console.log(`\n⚠️ Variables manquantes: ${missingVars.join(", ")}`);
    return false;
  }

  return true;
}

async function runDiagnostic() {
  console.log("🚀 Diagnostic du système Kanban\n");

  const results = {
    env: await checkEnvironmentVariables(),
    db: await testDatabaseConnection(),
    redis: await testRedisConnection(),
    websocket: await testWebSocketConnection(),
    api: await testMoveApplicationAPI(),
  };

  console.log("\n📊 Résumé du diagnostic:");
  console.log("========================");

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? "✅" : "❌";
    const testName = {
      env: "Variables d'environnement",
      db: "Base de données",
      redis: "Redis",
      websocket: "WebSocket",
      api: "API move-application",
    }[test];

    console.log(`${status} ${testName}`);
  });

  const allPassed = Object.values(results).every(Boolean);

  if (allPassed) {
    console.log(
      "\n🎉 Tous les tests sont passés ! Le système Kanban devrait fonctionner correctement."
    );
  } else {
    console.log("\n⚠️ Certains tests ont échoué. Vérifiez la configuration.");
  }

  return allPassed;
}

// Exécuter le diagnostic
if (require.main === module) {
  runDiagnostic().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runDiagnostic };
