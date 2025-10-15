/**
 * Script pour déboguer et voir les vrais utilisateurs
 * Usage: node scripts/debug-users-accounts.js
 */

const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function debugUsersAccounts() {
  try {
    console.log('👥 UTILISATEURS EN BASE:\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        passwordNeedsUpdate: true,
      },
      take: 10,
    });

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Password: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}`);
      console.log(`   passwordNeedsUpdate: ${user.passwordNeedsUpdate}`);
      console.log('');
    });

    console.log('\n🔐 COMPTES CREDENTIAL:\n');

    const accounts = await prisma.account.findMany({
      where: { providerId: 'credential' },
      select: {
        id: true,
        accountId: true,
        providerId: true,
        userId: true,
        password: true,
      },
    });

    accounts.forEach((account, index) => {
      console.log(`Account ${index + 1}:`);
      console.log(`   ID: ${account.id}`);
      console.log(`   AccountId: ${account.accountId}`);
      console.log(`   ProviderId: ${account.providerId}`);
      console.log(`   UserId: ${account.userId}`);
      console.log(`   Password: ${account.password ? account.password.substring(0, 20) + '...' : 'NULL'}`);
      console.log('');
    });

    console.log('\n🔗 CORRESPONDANCES:\n');

    for (const account of accounts) {
      const user = users.find(u => u.id === account.userId);
      if (user) {
        const match = account.accountId === user.email ? '✅' : '❌';
        console.log(`${match} Account ${account.accountId} → User ${user.email}`);
        if (account.accountId !== user.email) {
          console.log(`   ⚠️  PROBLÈME: accountId ne correspond pas à l'email de l'utilisateur !`);
        }
      } else {
        console.log(`❌ Account ${account.accountId} → Aucun utilisateur trouvé`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

debugUsersAccounts();

