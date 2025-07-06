const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:3000";

async function testMoveApplication() {
  try {
    console.log("🧪 Test de l'API move-application...");

    // Test avec des données fictives
    const moveData = {
      applicationId: "test-application-id",
      newColumnId: "test-column-id",
      sourceColumnId: "test-source-column-id",
    };

    console.log("📤 Envoi des données:", moveData);

    const response = await axios.post(
      `${BASE_URL}/api/recruteur/kanban/move-application`,
      moveData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        validateStatus: () => true, // Accepter tous les statuts
      }
    );

    console.log("�� Réponse reçue:");
    console.log("  Status:", response.status);
    console.log("  Data:", response.data);
    console.log("  Headers:", response.headers);

    if (response.status === 401) {
      console.log("ℹ️ Réponse 401 - Authentification requise (normal)");
      return true;
    } else if (response.status === 200) {
      console.log("✅ API fonctionne correctement");
      return true;
    } else {
      console.log("⚠️ Réponse inattendue");
      return false;
    }
  } catch (error) {
    console.error("❌ Erreur lors du test:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      },
    });
    return false;
  }
}

// Test de connexion simple
async function testConnection() {
  try {
    console.log("🔍 Test de connexion au serveur...");
    const response = await axios.get(`${BASE_URL}/api/recruteur/offres`, {
      validateStatus: () => true,
    });
    console.log("✅ Serveur accessible (status:", response.status, ")");
    return true;
  } catch (error) {
    console.error("❌ Serveur inaccessible:", error.message);
    return false;
  }
}

// Exécuter les tests
async function runTests() {
  console.log("🚀 Test de l'API move-application\n");

  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log("\n❌ Impossible de se connecter au serveur");
    return;
  }

  await testMoveApplication();

  console.log("\n✨ Test terminé");
  console.log("\n💡 Pour résoudre le problème de drag and drop:");
  console.log("1. Vérifie que tu es bien connecté (token JWT valide)");
  console.log("2. Vérifie que l'application existe dans la base de données");
  console.log("3. Vérifie que la colonne de destination existe");
  console.log("4. Regarde les logs du serveur pendant le drag and drop");
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  runTests();
}

module.exports = { testMoveApplication, testConnection };
