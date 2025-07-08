const io = require("socket.io-client");

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function testWebSocketEvents() {
  console.log("🔌 Test des événements WebSocket...");

  return new Promise((resolve) => {
    const socket = io(BASE_URL, {
      path: "/api/socketio",
      timeout: 5000,
    });

    const timeout = setTimeout(() => {
      console.log("❌ Timeout du test WebSocket");
      socket.disconnect();
      resolve(false);
    }, 10000);

    let eventsReceived = 0;
    const expectedEvents = 3;

    socket.on("connect", () => {
      console.log("✅ WebSocket connecté");

      // Rejoindre une room de test
      socket.emit("join:offer", "test-offer-id");
      console.log("📡 Rejoint la room: test-offer-id");

      // Tester l'émission d'un événement de note
      setTimeout(() => {
        console.log("📝 Test d'émission d'événement note:added");
        socket.emit("note:added", {
          applicationId: "test-app-id",
          note: {
            id: "test-note-id",
            content: "Test note content",
            authorId: "test-author",
            authorType: "RECRUTEUR",
            createdAt: new Date().toISOString(),
          },
          offerId: "test-offer-id",
        });
      }, 1000);
    });

    socket.on("note:added", (data) => {
      console.log("✅ Événement note:added reçu:", data);
      eventsReceived++;
      checkCompletion();
    });

    socket.on("note:updated", (data) => {
      console.log("✅ Événement note:updated reçu:", data);
      eventsReceived++;
      checkCompletion();
    });

    socket.on("application:moved", (data) => {
      console.log("✅ Événement application:moved reçu:", data);
      eventsReceived++;
      checkCompletion();
    });

    socket.on("disconnect", () => {
      console.log("🔌 WebSocket déconnecté");
    });

    socket.on("connect_error", (error) => {
      console.log("❌ Erreur de connexion WebSocket:", error.message);
      clearTimeout(timeout);
      resolve(false);
    });

    function checkCompletion() {
      if (eventsReceived >= expectedEvents) {
        console.log("✅ Tous les événements testés avec succès");
        clearTimeout(timeout);
        socket.disconnect();
        resolve(true);
      }
    }
  });
}

// Test de la route API
async function testAPIRoute() {
  console.log("\n🌐 Test de la route API...");

  try {
    const response = await fetch(`${BASE_URL}/api/socketio`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Route API accessible:", data);
      return true;
    } else {
      console.log("❌ Route API non accessible:", response.status);
      return false;
    }
  } catch (error) {
    console.log("❌ Erreur lors du test de la route API:", error.message);
    return false;
  }
}

// Test principal
async function runTests() {
  console.log("🚀 Démarrage des tests WebSocket...\n");

  const apiTest = await testAPIRoute();
  const websocketTest = await testWebSocketEvents();

  console.log("\n📊 Résultats des tests:");
  console.log(`API Route: ${apiTest ? "✅" : "❌"}`);
  console.log(`WebSocket: ${websocketTest ? "✅" : "❌"}`);

  if (apiTest && websocketTest) {
    console.log("\n🎉 Tous les tests sont passés !");
    process.exit(0);
  } else {
    console.log("\n⚠️  Certains tests ont échoué. Vérifiez la configuration.");
    process.exit(1);
  }
}

runTests();
