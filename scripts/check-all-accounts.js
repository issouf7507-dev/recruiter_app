/**
 * Script pour vérifier tous les comptes et identifier les problèmes
 * Usage: node scripts/check-all-accounts.js
 */

const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function checkAccounts() {
  try {
    console.log('🔍 Vérification de tous les comptes...\n');

    // Compter tous les comptes
    const totalAccounts = await prisma.account.count();
    console.log(`📊 Total des comptes: ${totalAccounts}`);

    // Compter les comptes credential
    const credentialAccounts = await prisma.account.count({
      where: { providerId: 'credential' }
    });
    console.log(`   Comptes credential: ${credentialAccounts}`);

    // Lister tous les comptes credential
    const accounts = await prisma.account.findMany({
      where: { providerId: 'credential' },
      select: {
        id: true,
        accountId: true,
        userId: true,
        providerId: true,
      }
    });

    console.log('\n📋 Détails des comptes credential:\n');
    accounts.forEach((acc, index) => {
      const idValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acc.id) || 
                      /^[0-9a-f]{32}$/i.test(acc.id);
      const status = idValid ? '✅' : '❌';
      
      console.log(`${status} Compte ${index + 1}:`);
      console.log(`   ID: ${acc.id} ${idValid ? '(valide)' : '(INVALIDE)'}`);
      console.log(`   Email: ${acc.accountId}`);
      console.log(`   UserId: ${acc.userId}`);
      console.log('');
    });

    // Compter les comptes avec ID invalide
    const invalidCount = accounts.filter(acc => 
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acc.id) &&
      !/^[0-9a-f]{32}$/i.test(acc.id)
    ).length;

    if (invalidCount > 0) {
      console.log(`⚠️  ${invalidCount} compte(s) ont des IDs invalides !`);
      console.log('   Exécutez: node scripts/fix-all-accounts.js\n');
    } else {
      console.log('✅ Tous les comptes ont des IDs valides\n');
    }

  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccounts();

