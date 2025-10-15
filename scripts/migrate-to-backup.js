/**
 * Script pour migrer tous les utilisateurs actuels vers BackupUser
 * Usage: node scripts/migrate-to-backup.js
 */

const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function migrateToBackup() {
  try {
    console.log('🚀 Migration des utilisateurs vers BackupUser...\n');

    // Récupérer tous les utilisateurs avec leurs relations
    const users = await prisma.user.findMany({
      include: {
        candidat: true,
        recruteur: true,
        collaborateur: true,
      },
    });

    console.log(`👥 ${users.length} utilisateur(s) trouvé(s)\n`);

    let migrated = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        // Vérifier si l'utilisateur existe déjà dans BackupUser
        const existing = await prisma.backupUser.findUnique({
          where: { email: user.email },
        });

        if (existing) {
          console.log(`⏭️  ${user.email} - Déjà dans BackupUser`);
          skipped++;
          continue;
        }

        // Déterminer le type d'utilisateur
        let type = null;
        let userData = {};

        if (user.candidat) {
          type = 'CANDIDAT';
          userData.candidat = {
            id: user.candidat.id,
            nom: user.candidat.nom,
            prenom: user.candidat.prenom,
            telephone: user.candidat.telephone,
            // ... autres champs si nécessaire
          };
        }

        if (user.recruteur) {
          type = 'RECRUTEUR';
          userData.recruteur = {
            id: user.recruteur.id,
            entreprise: user.recruteur.entreprise,
            type: user.recruteur.type,
            // ... autres champs si nécessaire
          };
        }

        if (user.collaborateur) {
          type = 'COLLABORATEUR';
          userData.collaborateur = {
            id: user.collaborateur.id,
            nom: user.collaborateur.nom,
            prenom: user.collaborateur.prenom,
            role: user.collaborateur.role,
            // ... autres champs si nécessaire
          };
        }

        // Créer l'entrée dans BackupUser
        await prisma.backupUser.create({
          data: {
            email: user.email,
            name: user.name,
            password: user.password || '',
            type: type || user.type?.toString(),
            userData: JSON.stringify(userData),
            migrated: false,
            createdAt: user.createdAt,
          },
        });

        console.log(`✅ ${user.email} - Migré vers BackupUser (${type || 'N/A'})`);
        migrated++;

      } catch (error) {
        console.error(`❌ Erreur pour ${user.email}:`, error.message);
      }
    }

    console.log(`\n🎉 Migration terminée !`);
    console.log(`   ✅ ${migrated} utilisateur(s) migré(s)`);
    console.log(`   ⏭️  ${skipped} utilisateur(s) ignoré(s) (déjà migrés)`);

    // Statistiques
    const totalBackup = await prisma.backupUser.count();
    const migratedCount = await prisma.backupUser.count({
      where: { migrated: true }
    });
    const pendingCount = await prisma.backupUser.count({
      where: { migrated: false }
    });

    console.log(`\n📊 Statistiques BackupUser:`);
    console.log(`   Total: ${totalBackup}`);
    console.log(`   Migrés (réenregistrés): ${migratedCount}`);
    console.log(`   En attente: ${pendingCount}`);

  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToBackup();



