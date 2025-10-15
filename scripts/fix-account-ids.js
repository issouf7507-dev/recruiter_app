/**
 * Script pour corriger les IDs des comptes credential mal formés
 * Usage: node scripts/fix-account-ids.js
 */

const { PrismaClient } = require('../app/generated/prisma');
const { randomBytes } = require('crypto');
const prisma = new PrismaClient();

async function fixAccountIds() {
  try {
    console.log('🔍 Recherche des comptes avec des IDs mal formés...');

    // Trouver tous les comptes credential avec des IDs contenant "-credential"
    const badAccounts = await prisma.account.findMany({
      where: {
        providerId: 'credential',
        id: {
          contains: '-credential',
        },
      },
    });

    console.log(`   Trouvé ${badAccounts.length} compte(s) à corriger`);

    if (badAccounts.length === 0) {
      console.log('✅ Aucun compte à corriger');
      return;
    }

    // Corriger chaque compte
    for (const account of badAccounts) {
      console.log(`\n🔧 Correction du compte pour userId: ${account.userId}`);
      
      // Générer un nouvel ID valide
      const newId = randomBytes(16).toString('hex');
      
      // Supprimer l'ancien compte
      await prisma.account.delete({
        where: { id: account.id },
      });
      
      // Créer le nouveau compte avec un ID valide
      await prisma.account.create({
        data: {
          id: newId,
          accountId: account.accountId,
          providerId: account.providerId,
          userId: account.userId,
          password: account.password,
          accessToken: account.accessToken,
          refreshToken: account.refreshToken,
          idToken: account.idToken,
          accessTokenExpiresAt: account.accessTokenExpiresAt,
          refreshTokenExpiresAt: account.refreshTokenExpiresAt,
          scope: account.scope,
          createdAt: account.createdAt,
          updatedAt: new Date(),
        },
      });
      
      console.log(`   ✅ Compte corrigé avec le nouvel ID: ${newId}`);
    }

    console.log(`\n🎉 ${badAccounts.length} compte(s) corrigé(s) avec succès !`);

  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixAccountIds();

