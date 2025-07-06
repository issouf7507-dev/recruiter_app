const { PrismaClient } = require("./app/generated/prisma");

const prisma = new PrismaClient();

async function testCollaborateurData() {
  try {
    console.log("=== Test des données Collaborateur ===");

    // 1. Récupérer tous les utilisateurs de type COLLABORATEUR
    const collaborateurs = await prisma.user.findMany({
      where: {
        type: "COLLABORATEUR",
      },
      include: {
        collaborateur: {
          include: {
            recruteur: true,
          },
        },
      },
    });

    console.log(`Nombre de collaborateurs trouvés: ${collaborateurs.length}`);

    collaborateurs.forEach((user, index) => {
      console.log(`\n--- Collaborateur ${index + 1} ---`);
      console.log("User ID:", user.id);
      console.log("User Email:", user.email);
      console.log("User Type:", user.type);

      if (user.collaborateur) {
        console.log("Collaborateur ID:", user.collaborateur.id);
        console.log("Collaborateur Email:", user.collaborateur.email);
        console.log(
          "Collaborateur RecruteurId:",
          user.collaborateur.recruteurId
        );

        if (user.collaborateur.recruteur) {
          console.log("Recruteur associé:", {
            id: user.collaborateur.recruteur.id,
            name: user.collaborateur.recruteur.name,
            email: user.collaborateur.recruteur.email,
          });
        } else {
          console.log("❌ Aucun recruteur associé!");
        }
      } else {
        console.log("❌ Aucun profil collaborateur trouvé!");
      }
    });

    // 2. Vérifier s'il y a des offres d'emploi
    const offres = await prisma.jobOffer.findMany({
      include: {
        recruteur: true,
      },
    });

    console.log(`\n=== Offres d'emploi ===`);
    console.log(`Nombre d'offres trouvées: ${offres.length}`);

    offres.forEach((offre, index) => {
      console.log(`\n--- Offre ${index + 1} ---`);
      console.log("Offre ID:", offre.id);
      console.log("Titre:", offre.title);
      console.log("RecruteurId:", offre.recruteurId);

      if (offre.recruteur) {
        console.log("Recruteur:", {
          id: offre.recruteur.id,
          name: offre.recruteur.name,
          email: offre.recruteur.email,
        });
      } else {
        console.log("❌ Aucun recruteur associé à cette offre!");
      }
    });

    // 3. Test spécifique pour un collaborateur
    if (collaborateurs.length > 0) {
      const testUser = collaborateurs[0];
      console.log(`\n=== Test spécifique pour ${testUser.email} ===`);

      if (testUser.collaborateur && testUser.collaborateur.recruteur) {
        const recruteurId = testUser.collaborateur.recruteur.id;
        console.log("RecruteurId du collaborateur:", recruteurId);

        const offresDuRecruteur = await prisma.jobOffer.findMany({
          where: {
            recruteurId: recruteurId,
          },
        });

        console.log(
          `Nombre d'offres pour ce recruteur: ${offresDuRecruteur.length}`
        );
        offresDuRecruteur.forEach((offre) => {
          console.log(`- ${offre.title} (ID: ${offre.id})`);
        });
      }
    }
  } catch (error) {
    console.error("Erreur lors du test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCollaborateurData();
