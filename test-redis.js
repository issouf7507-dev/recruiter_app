const { createClient } = require("redis");

// Configuration Redis Cloud (version gratuite)
const redisConfig = {
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || "6wzoWWfpSWJpjFVLCNqX55WUOH9iAFEZ",
  socket: {
    host:
      process.env.REDIS_HOST ||
      "redis-16217.c232.us-east-1-2.ec2.redns.redis-cloud.com",
    port: parseInt(process.env.REDIS_PORT || "16217"),
  },
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

async function testRedisConnection() {
  console.log("🔴 Test de connexion Redis Cloud...");
  console.log("Configuration:", {
    host: redisConfig.socket.host,
    port: redisConfig.socket.port,
    username: redisConfig.username,
  });

  const redis = createClient(redisConfig);

  try {
    // Connexion
    await redis.connect();
    console.log("✅ Connexion Redis établie");

    // Test PING
    const pingResult = await redis.ping();
    console.log("✅ PING Redis:", pingResult);

    // Test d'écriture
    const testKey = "test:kanban:board:123";
    const testData = {
      id: 1,
      title: "Test Offer",
      applications: [
        {
          id: "app1",
          notes: [
            {
              id: "note1",
              content: "Test note",
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ],
    };

    await redis.setEx(testKey, 300, JSON.stringify(testData));
    console.log("✅ Écriture test réussie");

    // Test de lecture
    const retrievedData = await redis.get(testKey);
    const parsedData = JSON.parse(retrievedData);
    console.log("✅ Lecture test réussie:", {
      hasData: !!parsedData,
      hasApplications: !!parsedData.applications,
      hasNotes: !!parsedData.applications?.[0]?.notes,
      noteCount: parsedData.applications?.[0]?.notes?.length || 0,
    });

    // Test de suppression
    await redis.del(testKey);
    console.log("✅ Suppression test réussie");

    // Test des limites de la version gratuite
    console.log("\n📊 Test des limites Redis Cloud gratuit:");

    // Vérifier l'espace utilisé
    const info = await redis.info("memory");
    const memoryLines = info
      .split("\n")
      .filter((line) => line.includes("used_memory"));
    console.log("📈 Utilisation mémoire:", memoryLines);

    // Test de plusieurs clés
    const keys = [];
    for (let i = 0; i < 10; i++) {
      const key = `test:kanban:board:${i}`;
      await redis.setEx(key, 60, JSON.stringify({ id: i, data: "test" }));
      keys.push(key);
    }
    console.log("✅ Création de 10 clés réussie");

    // Compter les clés
    const keyCount = await redis.dbSize();
    console.log("📊 Nombre total de clés:", keyCount);

    // Nettoyer les clés de test
    for (const key of keys) {
      await redis.del(key);
    }
    console.log("✅ Nettoyage des clés de test");

    await redis.disconnect();
    console.log("✅ Déconnexion Redis réussie");

    return true;
  } catch (error) {
    console.error("❌ Erreur Redis:", error.message);

    if (error.message.includes("NOAUTH")) {
      console.log("💡 Problème d'authentification - vérifiez les credentials");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.log("💡 Problème de connexion - vérifiez l'host/port");
    } else if (error.message.includes("OOM")) {
      console.log("💡 Redis plein - limite de la version gratuite atteinte");
    } else if (error.message.includes("maxmemory")) {
      console.log("💡 Limite mémoire atteinte - Redis gratuit limité");
    }

    try {
      await redis.disconnect();
    } catch (disconnectError) {
      // Ignorer les erreurs de déconnexion
    }

    return false;
  }
}

async function testCacheUtils() {
  console.log("\n🔧 Test des utilitaires de cache...");

  try {
    const { cacheUtils, CACHE_KEYS, CACHE_TTL } = require("./lib/redis.js");

    const testKey = CACHE_KEYS.KANBAN_BOARD("test-recruiter");
    const testData = {
      id: 1,
      title: "Test Offer",
      applications: [
        {
          id: "app1",
          notes: [
            {
              id: "note1",
              content: "Test note content",
              authorId: "user1",
              authorType: "RECRUTEUR",
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ],
    };

    // Test d'écriture
    await cacheUtils.set(testKey, testData, CACHE_TTL.KANBAN_BOARD);
    console.log("✅ Cache utils - Écriture réussie");

    // Test de lecture
    const retrievedData = await cacheUtils.get(testKey);
    console.log("✅ Cache utils - Lecture réussie:", {
      hasData: !!retrievedData,
      hasApplications: !!retrievedData?.applications,
      hasNotes: !!retrievedData?.applications?.[0]?.notes,
      noteCount: retrievedData?.applications?.[0]?.notes?.length || 0,
    });

    // Test de suppression
    await cacheUtils.del(testKey);
    console.log("✅ Cache utils - Suppression réussie");

    return true;
  } catch (error) {
    console.error("❌ Erreur cache utils:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🚀 Test de la configuration Redis Cloud\n");

  const redisTest = await testRedisConnection();
  const cacheUtilsTest = await testCacheUtils();

  console.log("\n📊 Résultats des tests:");
  console.log("=====================");
  console.log(`Redis Connection: ${redisTest ? "✅" : "❌"}`);
  console.log(`Cache Utils: ${cacheUtilsTest ? "✅" : "❌"}`);

  if (redisTest && cacheUtilsTest) {
    console.log("\n🎉 Redis fonctionne parfaitement !");
    console.log("💡 Les notes devraient maintenant s'afficher correctement.");
  } else if (!redisTest) {
    console.log("\n⚠️  Problème avec Redis Cloud:");
    console.log("💡 Vérifiez vos credentials Redis");
    console.log("💡 La version gratuite peut avoir des limitations");
    console.log("💡 Les notes peuvent ne pas s'afficher immédiatement");
  } else {
    console.log("\n⚠️  Problème avec les utilitaires de cache");
  }

  process.exit(redisTest && cacheUtilsTest ? 0 : 1);
}

runTests();
