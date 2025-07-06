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
    const expectedEvents = 2;

    socket.on("connect", () => {
      console.log("✅ WebSocket connecté");

      // Rejoindre une room de test
      socket.emit("join:offer", "test-offer-id");
      console.log("📡 Rejoint la room: test-offer-id");

      // Tester l'émission d'un événement via l'API
      setTimeout(async () => {
        try {
          console.log("📤 Test d'émission d'événement via API...");

          const response = await fetch(`${BASE_URL}/api/socketio`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventType: "note:added",
              offerId: "test-offer-id",
              data: {
                applicationId: "test-app-id",
                note: {
                  id: "test-note-id",
                  content: "Test note",
                  authorId: "test-user-id",
                  authorType: "RECRUTEUR",
                  createdAt: new Date().toISOString(),
                },
              },
            }),
          });

          if (response.ok) {
            console.log("✅ Événement émis via API");
          } else {
            console.log("❌ Erreur lors de l'émission via API");
          }
        } catch (error) {
          console.error("❌ Erreur lors du test API:", error);
        }
      }, 1000);
    });

    // Écouter les événements
    socket.on("note:added", (data) => {
      console.log("📨 Événement note:added reçu:", data);
      eventsReceived++;

      if (eventsReceived >= expectedEvents) {
        clearTimeout(timeout);
        console.log("✅ Tous les événements reçus avec succès");
        socket.disconnect();
        resolve(true);
      }
    });

    socket.on("application:moved", (data) => {
      console.log("📨 Événement application:moved reçu:", data);
      eventsReceived++;

      if (eventsReceived >= expectedEvents) {
        clearTimeout(timeout);
        console.log("✅ Tous les événements reçus avec succès");
        socket.disconnect();
        resolve(true);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion WebSocket:", error.message);
      clearTimeout(timeout);
      resolve(false);
    });

    socket.on("disconnect", () => {
      console.log("🔌 WebSocket déconnecté");
    });
  });
}

async function testRedisConnection() {
  console.log("\n🔴 Test de connexion Redis...");

  try {
    const Redis = require("ioredis");
    const redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME,
    });

    await redis.ping();
    console.log("✅ Redis connecté");

    // Test de publication
    const testEvent = {
      type: "test:event",
      data: { message: "Test Redis Pub/Sub" },
      offerId: "test-offer-id",
      timestamp: new Date().toISOString(),
    };

    await redis.publish("kanban:events", JSON.stringify(testEvent));
    console.log("✅ Événement publié sur Redis");

    await redis.disconnect();
    return true;
  } catch (error) {
    console.error("❌ Erreur Redis:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🚀 Test de la configuration WebSocket et Redis\n");

  const results = {
    redis: await testRedisConnection(),
    websocket: await testWebSocketEvents(),
  };

  console.log("\n📊 Résumé des tests:");
  console.log("=====================");

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? "✅" : "❌";
    const testName = {
      redis: "Redis Pub/Sub",
      websocket: "WebSocket Events",
    }[test];

    console.log(`${status} ${testName}`);
  });

  const allPassed = Object.values(results).every(Boolean);

  if (allPassed) {
    console.log(
      "\n🎉 Tous les tests sont passés ! Le système WebSocket fonctionne correctement."
    );
  } else {
    console.log("\n⚠️ Certains tests ont échoué. Vérifiez la configuration.");
  }

  return allPassed;
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runTests };
