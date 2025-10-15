# 🟠 04 - PROBLÈMES DE BASE DE DONNÉES

## ⚠️ Priorité: IMPORTANTE

Ces problèmes concernent le schéma Prisma, les relations, les indexes et l'optimisation des requêtes.

---

## 1. 🔧 Schéma Prisma: Duplication de Structures

### 📍 Localisation
**Fichier**: `prisma/schema.prisma`  
**Lignes**: 230-668

### ❌ Problème

Duplication massive de structures entre versions "normales" et "Custom" :

```prisma
// Version normale
model Application {
  id String @id @default(cuid())
  candidatId String
  jobOfferId String
  // ... autres champs
  candidat Candidat @relation(...)
  notes ApplicationNote[]
}

model ApplicationNote { /* ... */ }
model ApplicationFile { /* ... */ }
model ChecklistItem { /* ... */ }

// Version "Custom" - DUPLIQUÉE !
model ApplicationCustom {
  id String @id @default(cuid())
  title String
  description String
  // ... autres champs
  notes ApplicationNoteCustom[]
}

model ApplicationNoteCustom { /* ... */ } // Identique à ApplicationNote !
model ApplicationFileCustom { /* ... */ } // Identique à ApplicationFile !
model ChecklistItemCustom { /* ... */ }   // Identique à ChecklistItem !
```

### ⚠️ Risques
- Maintenance double
- Bugs différents entre les versions
- Performance dégradée
- Confusion pour les développeurs
- Migrations complexes

### ✅ Solution

Utiliser l'héritage et la composition :

```prisma
// Base models réutilisables
model Application {
  id             String    @id @default(cuid())
  candidatId     String?   // Optionnel pour les applications custom
  jobOfferId     String?   // Optionnel pour les applications custom
  columnId       String
  
  // Champs communs
  rating         Int?
  message        String?
  cv             String?
  favorite       Boolean?  @default(false)
  duedate        DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  // Type discriminator
  type           ApplicationType @default(STANDARD)
  
  // Relations conditionnelles
  candidat       Candidat?   @relation(fields: [candidatId], references: [id], onDelete: Cascade)
  jobOffer       JobOffer?   @relation(fields: [jobOfferId], references: [id], onDelete: Cascade)
  column         KanbanColumn @relation(fields: [columnId], references: [id], onDelete: Cascade)
  
  // Champs spécifiques aux applications custom
  customTitle    String?
  customCompany  String?
  customLocation String?
  
  // Relations communes
  collaborateurs ApplicationCollaborateur[]
  files          ApplicationFile[]
  notes          ApplicationNote[]
  checklist      ChecklistItem[]
  
  @@index([candidatId])
  @@index([jobOfferId])
  @@index([columnId])
  @@index([type])
}

enum ApplicationType {
  STANDARD   // Application à une offre existante
  CUSTOM     // Application libre
}

// Plus besoin de ApplicationCustom, ApplicationNoteCustom, etc.
// Un seul modèle Application pour tout !
```

**Migration des données existantes** :

```typescript
// prisma/migrations/consolidate-applications.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function consolidateApplications() {
  console.log("Début de la consolidation des applications...");

  // 1. Migrer ApplicationCustom vers Application
  const customApps = await prisma.applicationCustom.findMany({
    include: {
      notes: true,
      files: true,
      checklist: true,
      candidatCustom: true,
    },
  });

  for (const customApp of customApps) {
    // Créer l'application standard avec type CUSTOM
    const newApp = await prisma.application.create({
      data: {
        type: "CUSTOM",
        customTitle: customApp.title,
        customCompany: customApp.company,
        customLocation: customApp.location,
        duedate: customApp.duedate,
        columnId: customApp.kanbanColumnCustomid,
        
        // Migrer les notes
        notes: {
          create: customApp.notes.map(note => ({
            content: note.content,
            authorId: note.authorId,
            authorName: note.authorName,
            authorType: note.authorType,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          })),
        },
        
        // Migrer les fichiers
        files: {
          create: customApp.files.map(file => ({
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            fileType: file.fileType,
            fileSize: file.fileSize,
            uploadedById: file.uploadedById,
            uploadedByType: file.uploadedByType,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
          })),
        },
        
        // Migrer la checklist
        checklist: {
          create: customApp.checklist.map(item => ({
            title: item.title,
            description: item.description,
            isCompleted: item.isCompleted,
            createdById: item.createdById,
            createdByType: item.createdByType,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })),
        },
      },
    });

    console.log(`Migré ApplicationCustom ${customApp.id} -> Application ${newApp.id}`);
  }

  console.log("Consolidation terminée !");
}

consolidateApplications()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 📝 Actions
1. Créer le nouveau schéma consolidé
2. Écrire le script de migration
3. Tester la migration sur une copie de la base
4. Migrer en production
5. Supprimer les anciennes tables

---

## 2. 🔧 Indexes Manquants

### 📍 Localisation
**Fichier**: `prisma/schema.prisma`

### ❌ Problème

Beaucoup de tables manquent d'indexes sur les colonnes fréquemment requêtées :

```prisma
model Candidat {
  // ❌ Pas d'index sur les champs de recherche
  nom String?
  prenom String?
  ville String?
  pays String
  statut String?
  // ...
}

model JobOffer {
  // ❌ Pas d'index sur les filtres
  location String?
  type String?
  etat String? @default("active")
  experience String?
  createdAt DateTime @default(now())
  // ...
}

model Message {
  // ❌ Pas d'index sur les timestamps
  createdAt DateTime @default(now())
  isRead Boolean @default(false)
  // ...
}
```

### ⚠️ Risques
- Requêtes lentes
- Full table scans
- Performance dégradée avec la croissance
- Timeouts en production

### ✅ Solution

Ajouter les indexes appropriés :

```prisma
model Candidat {
  id String @id @default(cuid())
  userId String @unique
  nom String?
  prenom String?
  telephone String?
  cv String?
  letterm String?
  email String @unique
  bio String?
  adresse String?
  ville String?
  statut String?
  pays String
  dateNaissance DateTime
  nationalite String?
  situationFamiliale String?
  permisConduire String?
  image String?
  
  // ... relations
  
  // ✅ Indexes pour la recherche
  @@index([nom, prenom]) // Recherche par nom
  @@index([pays]) // Filtrage par pays
  @@index([ville]) // Filtrage par ville
  @@index([statut]) // Filtrage par statut
  @@index([createdAt]) // Tri par date
  
  // ✅ Index composite pour recherche avancée
  @@index([pays, ville, statut])
}

model JobOffer {
  id String @id @default(cuid())
  title String
  description String? @db.Text
  company String?
  location String?
  type String?
  etat String? @default("active")
  experience String?
  salaryMin Float?
  salaryMax Float?
  recruteurId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // ... relations
  
  // ✅ Indexes pour la recherche et le filtrage
  @@index([etat]) // Filtrer offres actives
  @@index([recruteurId]) // Déjà présent
  @@index([location]) // Filtrage par localisation
  @@index([type]) // Filtrage par type
  @@index([experience]) // Filtrage par expérience
  @@index([createdAt]) // Tri chronologique
  @@index([salaryMin, salaryMax]) // Filtrage par salaire
  
  // ✅ Index composite pour recherche multi-critères
  @@index([etat, location, type])
  @@index([recruteurId, etat, createdAt])
  
  // ✅ Index full-text pour la recherche textuelle (MySQL)
  @@fulltext([title])
}

model Application {
  id String @id @default(cuid())
  candidatId String
  jobOfferId String
  columnId String
  rating Int?
  favorite Boolean? @default(false)
  duedate DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // ... relations
  
  // ✅ Indexes déjà présents
  @@index([candidatId])
  @@index([jobOfferId])
  @@index([columnId])
  
  // ✅ Nouveaux indexes
  @@index([favorite]) // Filtrer les favoris
  @@index([rating]) // Tri par note
  @@index([duedate]) // Filtrer par échéance
  @@index([createdAt]) // Tri chronologique
  
  // ✅ Index composites pour les requêtes complexes
  @@index([jobOfferId, columnId]) // Kanban par offre
  @@index([candidatId, createdAt]) // Historique candidat
  @@index([favorite, rating]) // Top candidatures
}

model Message {
  id String @id @default(cuid())
  conversationId String
  senderId String
  senderType SenderType
  content String @db.Text
  isRead Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // ... relations
  
  // ✅ Index existant
  @@index([conversationId])
  
  // ✅ Nouveaux indexes
  @@index([senderId]) // Rechercher messages d'un utilisateur
  @@index([isRead]) // Filtrer messages non lus
  @@index([createdAt]) // Tri chronologique
  
  // ✅ Index composites
  @@index([conversationId, createdAt]) // Messages d'une conversation
  @@index([conversationId, isRead]) // Messages non lus
  @@index([senderId, senderType, createdAt]) // Historique utilisateur
}

model Notification {
  id String @id @default(cuid())
  titre String
  message String
  type String
  lu Boolean @default(false)
  candidatId String
  offreId Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // ... relations
  
  // ✅ Index existant
  @@index([candidatId])
  
  // ✅ Nouveaux indexes
  @@index([lu]) // Filtrer notifications non lues
  @@index([type]) // Filtrer par type
  @@index([createdAt]) // Tri chronologique
  
  // ✅ Index composites
  @@index([candidatId, lu, createdAt]) // Notifications non lues récentes
}

model Experience {
  id String @id @default(cuid())
  poste String
  entreprise String
  localisation String
  typeContrat String
  dateDebut DateTime
  dateFin DateTime?
  description String
  candidatId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // ... relations
  
  // ✅ Index existant
  @@index([candidatId])
  
  // ✅ Nouveaux indexes
  @@index([dateDebut]) // Tri chronologique
  @@index([candidatId, dateDebut]) // Expériences d'un candidat triées
}

model Formation {
  id String @id @default(cuid())
  diplome String
  etablissement String
  domaine String
  dateDebut DateTime
  dateFin DateTime?
  description String
  candidatId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // ... relations
  
  // ✅ Index existant
  @@index([candidatId])
  
  // ✅ Nouveaux indexes
  @@index([dateDebut]) // Tri chronologique
  @@index([candidatId, dateDebut]) // Formations d'un candidat triées
  @@index([domaine]) // Recherche par domaine
}
```

**Commandes pour créer les indexes** :

```bash
# Générer la migration
npx prisma migrate dev --name add_missing_indexes

# Ou créer manuellement les indexes en SQL
```

**Script SQL pour ajouter les indexes** :

```sql
-- Candidat
CREATE INDEX idx_candidat_nom_prenom ON candidat(nom, prenom);
CREATE INDEX idx_candidat_pays ON candidat(pays);
CREATE INDEX idx_candidat_ville ON candidat(ville);
CREATE INDEX idx_candidat_statut ON candidat(statut);
CREATE INDEX idx_candidat_search ON candidat(pays, ville, statut);

-- JobOffer
CREATE INDEX idx_joboffer_etat ON joboffer(etat);
CREATE INDEX idx_joboffer_location ON joboffer(location);
CREATE INDEX idx_joboffer_type ON joboffer(type);
CREATE INDEX idx_joboffer_experience ON joboffer(experience);
CREATE INDEX idx_joboffer_salary ON joboffer(salaryMin, salaryMax);
CREATE INDEX idx_joboffer_search ON joboffer(etat, location, type);
CREATE FULLTEXT INDEX idx_joboffer_title ON joboffer(title);

-- Application
CREATE INDEX idx_application_favorite ON application(favorite);
CREATE INDEX idx_application_rating ON application(rating);
CREATE INDEX idx_application_duedate ON application(duedate);
CREATE INDEX idx_application_kanban ON application(jobOfferId, columnId);

-- Message
CREATE INDEX idx_message_sender ON message(senderId);
CREATE INDEX idx_message_isread ON message(isRead);
CREATE INDEX idx_message_conversation ON message(conversationId, createdAt);

-- Notification
CREATE INDEX idx_notification_lu ON notification(lu);
CREATE INDEX idx_notification_type ON notification(type);
CREATE INDEX idx_notification_recent ON notification(candidatId, lu, createdAt);
```

### 📝 Actions
1. Analyser les requêtes lentes (slow query log)
2. Identifier les colonnes fréquemment requêtées
3. Ajouter les indexes manquants
4. Tester les performances avant/après
5. Monitorer l'utilisation des indexes

---

## 3. 🔧 Relations Incohérentes

### 📍 Localisation
**Fichier**: `prisma/schema.prisma`

### ❌ Problème

Certaines relations ont des problèmes :

```prisma
model Notification {
  // ❌ offreId est un Int alors que JobOffer.id est un String !
  offreId Int?
  // Pas de relation définie
}

model KanbanColumnCustom {
  // ❌ jobOfferId est un Int, mais les autres colonnes utilisent String
  jobOfferId Int
  // Pas de relation vers JobOffer
}

model BackupUser {
  // ❌ Pas de relation, juste un champ texte
  userData String? @db.Text // JSON stocké en texte brut !
}
```

### ⚠️ Risques
- Données orphelines
- Incohérence des types
- Requêtes complexes et lentes
- Impossibilité d'utiliser les joins

### ✅ Solution

Corriger les relations :

```prisma
model Notification {
  id String @id @default(cuid())
  titre String
  message String
  type String
  lu Boolean @default(false)
  candidatId String
  // ✅ Corriger le type
  jobOfferId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // ✅ Ajouter la relation
  candidat Candidat @relation(fields: [candidatId], references: [id], onDelete: Cascade)
  jobOffer JobOffer? @relation(fields: [jobOfferId], references: [id], onDelete: SetNull)
  
  @@index([candidatId])
  @@index([jobOfferId])
  @@index([lu])
}

model JobOffer {
  // ...
  notifications Notification[]
}

// ✅ Unifier les types de KanbanColumn
model KanbanColumn {
  id String @id @default(cuid())
  color String
  name String
  order Int
  isDefault Boolean @default(false)
  jobOfferId String  // ✅ String comme JobOffer.id
  recruteurId String  // ✅ Ajouter pour filtrage
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  applications Application[]
  jobOffer JobOffer @relation(fields: [jobOfferId], references: [id], onDelete: Cascade)
  recruteur Recruteur @relation(fields: [recruteurId], references: [id], onDelete: Cascade)
  
  @@index([jobOfferId])
  @@index([recruteurId])
}

// ✅ Stocker les données structurées au lieu de JSON
model BackupUser {
  id String @id @default(cuid())
  email String @unique
  name String?
  password String
  type UserType?
  migrated Boolean @default(false)
  migratedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // ✅ Relations au lieu de JSON
  candidatBackup CandidatBackup?
  recruteurBackup RecruteurBackup?
  
  @@map("backup_user")
}

model CandidatBackup {
  id String @id @default(cuid())
  backupUserId String @unique
  backupUser BackupUser @relation(fields: [backupUserId], references: [id], onDelete: Cascade)
  
  // Données du candidat
  nom String?
  prenom String?
  telephone String?
  pays String
  dateNaissance DateTime
  // ... autres champs
}

model RecruteurBackup {
  id String @id @default(cuid())
  backupUserId String @unique
  backupUser BackupUser @relation(fields: [backupUserId], references: [id], onDelete: Cascade)
  
  // Données du recruteur
  entreprise String?
  description String?
  // ... autres champs
}
```

### 📝 Actions
1. Identifier toutes les relations manquantes ou incorrectes
2. Créer les migrations pour corriger les types
3. Ajouter les relations manquantes
4. Migrer les données JSON vers des tables structurées
5. Nettoyer les données orphelines

---

## 4. 🔧 Absence de Soft Delete

### 📍 Localisation
**Général**: Toutes les suppressions sont définitives

### ❌ Problème

Toutes les suppressions utilisent `onDelete: Cascade`, ce qui supprime définitivement les données.

### ⚠️ Risques
- Perte de données irréversible
- Impossible d'auditer les suppressions
- Pas de restauration possible
- Problèmes légaux (RGPD)

### ✅ Solution

Implémenter le soft delete :

```prisma
// Ajouter un champ deletedAt aux modèles critiques
model User {
  id String @id @default(cuid())
  email String @unique
  name String?
  // ... autres champs
  
  // ✅ Soft delete
  deletedAt DateTime?
  
  // ✅ Changer les cascades
  candidat Candidat? @relation("UserAsCandidat", onDelete: Restrict)
  recruteur Recruteur? @relation("UserAsRecruteur", onDelete: Restrict)
  
  @@map("user")
}

model Candidat {
  id String @id @default(cuid())
  userId String @unique
  // ... champs
  
  // ✅ Soft delete
  deletedAt DateTime?
  
  // Relations
  user User @relation("UserAsCandidat", fields: [userId], references: [id])
  applications Application[]
}

model JobOffer {
  id String @id @default(cuid())
  title String
  // ... champs
  
  // ✅ Soft delete
  deletedAt DateTime?
  archivedAt DateTime? // Pour archivage différencié
  
  // Relations
  applications Application[]
}

model Application {
  id String @id @default(cuid())
  // ... champs
  
  // ✅ Soft delete
  deletedAt DateTime?
  
  // Relations
  candidat Candidat @relation(fields: [candidatId], references: [id])
  jobOffer JobOffer @relation(fields: [jobOfferId], references: [id])
}
```

**Middleware Prisma pour soft delete automatique** :

```typescript
// lib/prisma.ts
import { PrismaClient } from "@/app/generated/prisma";

const prismaClientSingleton = () => {
  const prisma = new PrismaClient();

  // ✅ Middleware pour soft delete
  prisma.$use(async (params, next) => {
    // Modèles concernés par le soft delete
    const softDeleteModels = [
      "user",
      "candidat",
      "recruteur",
      "jobOffer",
      "application",
    ];

    if (softDeleteModels.includes(params.model?.toLowerCase() || "")) {
      // DELETE -> UPDATE avec deletedAt
      if (params.action === "delete") {
        params.action = "update";
        params.args.data = { deletedAt: new Date() };
      }

      // DELETE MANY -> UPDATE MANY
      if (params.action === "deleteMany") {
        params.action = "updateMany";
        if (params.args.data !== undefined) {
          params.args.data.deletedAt = new Date();
        } else {
          params.args.data = { deletedAt: new Date() };
        }
      }

      // Exclure les éléments supprimés des requêtes par défaut
      if (params.action === "findUnique" || params.action === "findFirst") {
        params.action = "findFirst";
        params.args.where = {
          ...params.args.where,
          deletedAt: null,
        };
      }

      if (params.action === "findMany") {
        if (params.args.where) {
          if (params.args.where.deletedAt === undefined) {
            params.args.where.deletedAt = null;
          }
        } else {
          params.args.where = { deletedAt: null };
        }
      }

      // COUNT exclut aussi les éléments supprimés
      if (params.action === "count") {
        if (params.args.where) {
          if (params.args.where.deletedAt === undefined) {
            params.args.where.deletedAt = null;
          }
        } else {
          params.args.where = { deletedAt: null };
        }
      }

      // Autoriser la récupération des éléments supprimés explicitement
      if (params.action === "findMany" && params.args.where?.deletedAt) {
        // Ne pas écraser si explicitement demandé
      }
    }

    return next(params);
  });

  return prisma;
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
```

**Méthodes utilitaires** :

```typescript
// lib/repositories/base.repository.ts
import prisma from "@/lib/prisma";

export class BaseRepository {
  /**
   * Soft delete
   */
  static async softDelete(model: string, id: string) {
    return (prisma as any)[model].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Restaurer un élément supprimé
   */
  static async restore(model: string, id: string) {
    return (prisma as any)[model].update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * Supprimer définitivement (hard delete)
   */
  static async forceDelete(model: string, id: string) {
    // Bypass le middleware
    return (prisma as any)[model].delete({
      where: { id },
    });
  }

  /**
   * Récupérer les éléments supprimés
   */
  static async findDeleted(model: string, params?: any) {
    return (prisma as any)[model].findMany({
      where: {
        ...params?.where,
        deletedAt: { not: null },
      },
      ...params,
    });
  }
}
```

### 📝 Actions
1. Ajouter `deletedAt` aux modèles critiques
2. Implémenter le middleware Prisma
3. Créer les méthodes utilitaires
4. Mettre à jour les requêtes existantes
5. Ajouter une interface d'administration pour restaurer

---

## 5. 🔧 Pas de Gestion des Transactions

### 📍 Localisation
**Routes API**: Opérations multiples sans transaction

### ❌ Problème

Les opérations complexes ne sont pas atomiques :

```typescript
// ❌ Sans transaction
await prisma.application.create({...});
await prisma.notification.create({...});
await prisma.kanbanColumn.update({...});
// Si la 3ème échoue, les 2 premières sont déjà faites !
```

### ⚠️ Risques
- Données incohérentes
- État partiel en cas d'erreur
- Difficile à rollback
- Bugs complexes

### ✅ Solution

Utiliser les transactions Prisma :

```typescript
// ✅ Avec transaction
await prisma.$transaction(async (tx) => {
  const application = await tx.application.create({...});
  
  await tx.notification.create({
    data: {
      candidatId: application.candidatId,
      titre: "Nouvelle candidature",
      // ...
    },
  });
  
  await tx.kanbanColumn.update({
    where: { id: columnId },
    data: { /* ... */ },
  });
});
// Tout réussit ou tout échoue !
```

**Exemples dans les services** :

```typescript
// lib/services/application.service.ts
export class ApplicationService {
  /**
   * Créer une candidature (avec notifications et stats)
   */
  static async createApplication(data: CreateApplicationInput) {
    return prisma.$transaction(async (tx) => {
      // 1. Créer l'application
      const application = await tx.application.create({
        data: {
          candidatId: data.candidatId,
          jobOfferId: data.jobOfferId,
          columnId: data.columnId,
          message: data.message,
          cv: data.cv,
        },
      });

      // 2. Notifier le candidat
      await tx.notification.create({
        data: {
          candidatId: data.candidatId,
          titre: "Candidature envoyée",
          message: `Votre candidature pour "${data.jobTitle}" a été envoyée.`,
          type: "APPLICATION_SENT",
        },
      });

      // 3. Notifier le recruteur
      await tx.notification.create({
        data: {
          candidatId: data.recruteurId, // À adapter selon votre schéma
          titre: "Nouvelle candidature",
          message: `Nouvelle candidature pour "${data.jobTitle}".`,
          type: "APPLICATION_RECEIVED",
        },
      });

      // 4. Incrémenter le compteur d'applications
      await tx.jobOffer.update({
        where: { id: data.jobOfferId },
        data: {
          views: { increment: 1 },
        },
      });

      return application;
    });
  }

  /**
   * Déplacer une application dans le kanban
   */
  static async moveApplication(
    applicationId: string,
    newColumnId: string,
    newOrder: number
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Mettre à jour l'application
      const application = await tx.application.update({
        where: { id: applicationId },
        data: {
          columnId: newColumnId,
        },
      });

      // 2. Réorganiser l'ordre des autres applications
      await tx.application.updateMany({
        where: {
          columnId: newColumnId,
          id: { not: applicationId },
        },
        data: {
          // Logique de réorganisation
        },
      });

      // 3. Logger l'action
      // await tx.auditLog.create({...});

      return application;
    });
  }
}
```

### 📝 Actions
1. Identifier toutes les opérations multi-étapes
2. Envelopper dans des transactions
3. Ajouter la gestion d'erreurs appropriée
4. Tester les rollbacks

---

## 📊 Résumé des Actions Prioritaires

| #  | Action | Effort | Impact |
|----|--------|--------|--------|
| 1  | Consolider les modèles dupliqués | 3 jours | 🔴 Élevé |
| 2  | Ajouter les indexes manquants | 1 jour | 🔴 Élevé |
| 3  | Corriger les relations | 2 jours | 🟠 Moyen |
| 4  | Implémenter soft delete | 1 jour | 🟠 Moyen |
| 5  | Ajouter les transactions | 1 jour | 🟠 Moyen |

## ✅ Checklist Base de Données

- [ ] Schéma consolidé sans duplication
- [ ] Tous les indexes nécessaires ajoutés
- [ ] Relations cohérentes et correctes
- [ ] Soft delete implémenté
- [ ] Transactions pour opérations complexes
- [ ] Migrations testées
- [ ] Performance mesurée
- [ ] Backup réguliers configurés

---

**⚠️ IMPORTANT**: Tester TOUTES les migrations sur une copie de la base de données avant la production !


