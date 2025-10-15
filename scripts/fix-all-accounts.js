/**
 * Script pour corriger TOUS les comptes avec des IDs invalides
 * Usage: node scripts/fix-all-accounts.js
 */

const { PrismaClient } = require('../app/generated/prisma');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

async function fixAllAccounts() {
  try {
    console.log('🔍 Recherche de tous les comptes...\n');

    // Récupérer tous les comptes credential
    const accounts = await prisma.account.findMany({
      where: { providerId: 'credential' }
    });

    console.log(`📊 ${accounts.length} compte(s) credential trouvé(s)\n`);

    // Identifier les comptes avec IDs invalides
    const invalidAccounts = accounts.filter(acc => {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acc.id);
      const isHex = /^[0-9a-f]{32}$/i.test(acc.id);
      return !isUUID && !isHex;
    });

    if (invalidAccounts.length === 0) {
      console.log('✅ Aucun compte à corriger, tous les IDs sont valides\n');
      return;
    }

    console.log(`⚠️  ${invalidAccounts.length} compte(s) avec IDs invalides\n`);

    // Corriger chaque compte
    for (const account of invalidAccounts) {
      console.log(`🔧 Correction du compte:`);
      console.log(`   Ancien ID: ${account.id}`);
      console.log(`   Email: ${account.accountId}`);
      console.log(`   UserId: ${account.userId}`);
      
      // Générer un nouvel UUID valide
      const newId = randomUUID();
      console.log(`   Nouvel ID: ${newId}`);
      
      try {
        // Supprimer l'ancien compte
        await prisma.account.delete({
          where: { id: account.id },
        });
        
        // Créer le nouveau compte avec l'UUID valide
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
        
        console.log(`   ✅ Compte corrigé avec succès\n`);
      } catch (error) {
        console.error(`   ❌ Erreur lors de la correction:`, error.message);
        console.log('');
      }
    }

    console.log(`🎉 ${invalidAccounts.length} compte(s) corrigé(s) avec succès !\n`);

    // Vérification finale
    console.log('🔍 Vérification finale...');
    const remainingInvalid = await prisma.account.findMany({
      where: { providerId: 'credential' }
    });

    const stillInvalid = remainingInvalid.filter(acc => {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(acc.id);
      const isHex = /^[0-9a-f]{32}$/i.test(acc.id);
      return !isUUID && !isHex;
    });

    if (stillInvalid.length === 0) {
      console.log('✅ Tous les comptes ont maintenant des IDs valides !\n');
    } else {
      console.log(`❌ ${stillInvalid.length} compte(s) ont encore des IDs invalides\n`);
    }

  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllAccounts();

