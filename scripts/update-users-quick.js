/**
 * Script rapide pour marquer tous les utilisateurs existants
 * Usage: node scripts/update-users-quick.js
 */

const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function updateUsers() {
  try {
    console.log('🚀 Début de la mise à jour des utilisateurs...');

    // Mettre à jour tous les utilisateurs existants
    const result = await prisma.user.updateMany({
      where: {
        password: {
          not: null,
        },
      },
      data: {
        passwordNeedsUpdate: false, // Ils devront mettre à jour leur mot de passe
      },
    });

    console.log(`✅ ${result.count} utilisateurs marqués comme devant mettre à jour leur mot de passe`);

    // Afficher les statistiques
    const stats = await prisma.user.groupBy({
      by: ['passwordNeedsUpdate'],
      _count: true,
      where: {
        password: {
          not: null,
        },
      },
    });

    console.log('\n📊 Statistiques :');
    stats.forEach((stat) => {
      const status = stat.passwordNeedsUpdate
        ? '✅ Mot de passe à jour'
        : '⏳ Doit mettre à jour';
      console.log(`   ${status}: ${stat._count} utilisateurs`);
    });

  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateUsers();

