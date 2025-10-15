/**
 * Script de migration pour marquer les utilisateurs existants
 * comme nécessitant une mise à jour de leur mot de passe
 * 
 * Usage:
 *   npx ts-node scripts/mark-existing-users.ts
 *   ou
 *   npm run mark-users
 */

import prisma from "../lib/prisma";

async function markExistingUsers() {
  try {
    console.log("🚀 Début de la migration...");

    // Date de référence pour la migration (avant cette date = ancien utilisateur)
    // Ajustez cette date selon vos besoins
    const migrationDate = new Date("2025-10-14T00:00:00Z");

    console.log(`📅 Date de référence : ${migrationDate.toISOString()}`);

    // Compter les utilisateurs concernés
    const usersToMigrate = await prisma.user.count({
      where: {
        createdAt: {
          lt: migrationDate,
        },
        password: {
          not: null, // Uniquement les utilisateurs avec mot de passe
        },
      },
    });

    console.log(`👥 Utilisateurs à migrer : ${usersToMigrate}`);

    if (usersToMigrate === 0) {
      console.log("✅ Aucun utilisateur à migrer");
      return;
    }

    // Demander confirmation (commentez en production automatique)
    console.log("\n⚠️  Cette opération va marquer tous ces utilisateurs.");
    console.log(
      "   Ils devront mettre à jour leur mot de passe à la prochaine connexion."
    );
    console.log(
      '\n   Pour continuer, commentez la ligne "return" ci-dessous dans le script.\n'
    );

    // Décommentez cette ligne pour exécuter la migration
    // return;

    // Marquer les utilisateurs existants
    const result = await prisma.user.updateMany({
      where: {
        createdAt: {
          lt: migrationDate,
        },
        password: {
          not: null,
        },
      },
      data: {
        passwordNeedsUpdate: false, // false = doit mettre à jour
      },
    });

    console.log(`✅ Migration terminée !`);
    console.log(`   ${result.count} utilisateurs marqués`);

    // Statistiques finales
    const stats = await prisma.user.groupBy({
      by: ["passwordNeedsUpdate"],
      _count: true,
    });

    console.log("\n📊 Statistiques :");
    stats.forEach((stat) => {
      const status = stat.passwordNeedsUpdate
        ? "✅ Mot de passe à jour"
        : "⏳ Mise à jour requise";
      console.log(`   ${status}: ${stat._count} utilisateurs`);
    });
  } catch (error) {
    console.error("❌ Erreur lors de la migration :", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour marquer un utilisateur spécifique
async function markSpecificUser(email: string) {
  try {
    console.log(`🔍 Recherche de l'utilisateur : ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordNeedsUpdate: false },
    });

    console.log(`✅ Utilisateur ${email} marqué pour mise à jour`);
  } catch (error) {
    console.error("❌ Erreur :", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour vérifier le statut d'un utilisateur
async function checkUserStatus(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        passwordNeedsUpdate: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      return;
    }

    console.log("\n📋 Statut de l'utilisateur :");
    console.log(`   Email : ${user.email}`);
    console.log(`   Créé le : ${user.createdAt.toISOString()}`);
    console.log(
      `   Statut : ${
        user.passwordNeedsUpdate ? "✅ À jour" : "⏳ Mise à jour requise"
      }`
    );
  } catch (error) {
    console.error("❌ Erreur :", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Point d'entrée du script
const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

switch (command) {
  case "mark-all":
    markExistingUsers();
    break;
  case "mark-user":
    if (!param) {
      console.log("❌ Usage: npm run mark-users mark-user email@example.com");
      process.exit(1);
    }
    markSpecificUser(param);
    break;
  case "check":
    if (!param) {
      console.log("❌ Usage: npm run mark-users check email@example.com");
      process.exit(1);
    }
    checkUserStatus(param);
    break;
  default:
    console.log(`
📚 Usage du script de migration des mots de passe

Commandes disponibles :

  mark-all              Marquer tous les utilisateurs existants
  mark-user <email>     Marquer un utilisateur spécifique
  check <email>         Vérifier le statut d'un utilisateur

Exemples :

  npx ts-node scripts/mark-existing-users.ts mark-all
  npx ts-node scripts/mark-existing-users.ts mark-user user@example.com
  npx ts-node scripts/mark-existing-users.ts check user@example.com

Ou avec npm (ajoutez d'abord le script dans package.json) :

  npm run mark-users mark-all
  npm run mark-users mark-user user@example.com
  npm run mark-users check user@example.com
    `);
    break;
}

