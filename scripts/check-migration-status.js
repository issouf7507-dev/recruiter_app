/**
 * Script pour vérifier l'état de la migration
 * Usage: node scripts/check-migration-status.js
 */

const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function checkMigrationStatus() {
  try {
    console.log('\n📊 STATUT DE LA MIGRATION BETTER AUTH\n');
    console.log('='.repeat(50));

    // Statistiques BackupUser
    const totalBackup = await prisma.backupUser.count();
    const migrated = await prisma.backupUser.count({
      where: { migrated: true }
    });
    const pending = await prisma.backupUser.count({
      where: { migrated: false }
    });

    const percentage = totalBackup > 0 ? ((migrated / totalBackup) * 100).toFixed(2) : 0;

    console.log('\n📦 BACKUP USER:');
    console.log(`   Total: ${totalBackup}`);
    console.log(`   ✅ Migrés: ${migrated} (${percentage}%)`);
    console.log(`   ⏳ En attente: ${pending}`);

    // Statistiques par type
    const byType = await prisma.backupUser.groupBy({
      by: ['type', 'migrated'],
      _count: true,
    });

    console.log('\n👥 PAR TYPE D\'UTILISATEUR:');
    const types = {};
    byType.forEach(item => {
      if (!types[item.type || 'N/A']) {
        types[item.type || 'N/A'] = { migrated: 0, pending: 0 };
      }
      if (item.migrated) {
        types[item.type || 'N/A'].migrated = item._count;
      } else {
        types[item.type || 'N/A'].pending = item._count;
      }
    });

    Object.entries(types).forEach(([type, counts]) => {
      const total = counts.migrated + counts.pending;
      const pct = total > 0 ? ((counts.migrated / total) * 100).toFixed(1) : 0;
      console.log(`   ${type}:`);
      console.log(`      Total: ${total}`);
      console.log(`      ✅ Migrés: ${counts.migrated} (${pct}%)`);
      console.log(`      ⏳ En attente: ${counts.pending}`);
    });

    // Dernières migrations
    const recentMigrations = await prisma.backupUser.findMany({
      where: { migrated: true },
      orderBy: { migratedAt: 'desc' },
      take: 5,
      select: {
        email: true,
        type: true,
        migratedAt: true,
      },
    });

    if (recentMigrations.length > 0) {
      console.log('\n🕐 DERNIÈRES MIGRATIONS:');
      recentMigrations.forEach((user, index) => {
        const date = user.migratedAt ? new Date(user.migratedAt).toLocaleString('fr-FR') : 'N/A';
        console.log(`   ${index + 1}. ${user.email} (${user.type}) - ${date}`);
      });
    }

    // Utilisateurs en attente
    if (pending > 0) {
      console.log(`\n⚠️  ${pending} UTILISATEUR(S) EN ATTENTE DE MIGRATION`);
      
      const oldestPending = await prisma.backupUser.findMany({
        where: { migrated: false },
        orderBy: { createdAt: 'asc' },
        take: 10,
        select: {
          email: true,
          type: true,
          createdAt: true,
        },
      });

      console.log('\n   Premiers comptes à migrer:');
      oldestPending.forEach((user, index) => {
        const date = new Date(user.createdAt).toLocaleDateString('fr-FR');
        console.log(`      ${index + 1}. ${user.email} (${user.type}) - Créé le ${date}`);
      });
    }

    // Comptes Better Auth
    const betterAuthAccounts = await prisma.account.count({
      where: { providerId: 'credential' }
    });

    console.log('\n🔐 BETTER AUTH:');
    console.log(`   Comptes credential: ${betterAuthAccounts}`);

    // Résumé
    console.log('\n' + '='.repeat(50));
    if (pending === 0) {
      console.log('✅ MIGRATION TERMINÉE ! Tous les utilisateurs ont été migrés.');
    } else {
      console.log(`⏳ Migration en cours: ${migrated}/${totalBackup} (${percentage}%)`);
      console.log(`   Il reste ${pending} utilisateur(s) à migrer.`);
    }
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrationStatus();



