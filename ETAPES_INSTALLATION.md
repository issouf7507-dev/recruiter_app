# 🚀 Étapes d'Installation - Système de Mise à Jour Forcée des Mots de Passe

## ⚠️ Important

Le système est maintenant installé, mais vous devez suivre ces étapes pour le rendre fonctionnel.

## 📋 Étapes Obligatoires

### 1. Générer le Client Prisma

Le nouveau champ `passwordNeedsUpdate` a été ajouté au schéma, mais le client Prisma doit être régénéré :

```bash
# Générer le client Prisma avec le nouveau champ
npx prisma generate
```

### 2. Créer et Appliquer la Migration

```bash
# Créer la migration en développement
npx prisma migrate dev --name add_password_needs_update

# OU en production
npx prisma migrate deploy
```

### 3. Installer les Dépendances Manquantes (si nécessaire)

Assurez-vous que `bcryptjs` est installé :

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

### 4. Marquer les Utilisateurs Existants

Exécutez le script pour marquer les anciens utilisateurs :

```bash
# Vérifier d'abord le nombre d'utilisateurs concernés
npx ts-node scripts/mark-existing-users.ts mark-all

# Après confirmation, décommentez la ligne de sécurité dans le script
# puis réexécutez la commande
```

**Alternative SQL directe** :

```sql
-- Marquer tous les utilisateurs créés avant aujourd'hui
UPDATE user 
SET passwordNeedsUpdate = false 
WHERE createdAt < '2025-10-14' AND password IS NOT NULL;
```

### 5. Vérifier l'Installation

```bash
# Vérifier le statut d'un utilisateur
npx ts-node scripts/mark-existing-users.ts check email@example.com
```

## 🧪 Tests

### Test 1 : Ancien Utilisateur

1. Marquez un utilisateur pour la migration :
   ```bash
   npx ts-node scripts/mark-existing-users.ts mark-user test@example.com
   ```

2. Connectez-vous avec ce compte
3. Vous devriez être redirigé vers `/update-password`
4. Mettez à jour le mot de passe
5. Vérifiez l'accès au dashboard

### Test 2 : Nouvel Utilisateur

1. Créez un nouveau compte via l'inscription
2. Connectez-vous
3. Vous devriez accéder directement au dashboard (pas de redirection)

## 📊 Vérification en Base de Données

```sql
-- Voir le statut de tous les utilisateurs
SELECT 
  email,
  passwordNeedsUpdate,
  createdAt
FROM user
ORDER BY createdAt DESC;

-- Statistiques
SELECT 
  passwordNeedsUpdate,
  COUNT(*) as count
FROM user
GROUP BY passwordNeedsUpdate;
```

## 🔧 Structure des Fichiers Créés

```
├── prisma/
│   └── schema.prisma                    # ✅ Modifié (ajout passwordNeedsUpdate)
│
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── force-update-password/
│   │       │   └── route.ts            # ✅ API pour mettre à jour le mot de passe
│   │       └── check-password-status/
│   │           └── route.ts            # ✅ API pour vérifier le statut
│   │
│   ├── update-password/
│   │   └── page.tsx                    # ✅ Page de mise à jour du mot de passe
│   │
│   └── layout.tsx                      # ✅ Modifié (ajout PasswordCheckGuard)
│
├── hooks/
│   └── usePasswordCheck.ts             # ✅ Hook pour vérifier le statut
│
├── components/
│   └── password-check-guard.tsx        # ✅ Guard pour protéger les routes
│
├── scripts/
│   └── mark-existing-users.ts          # ✅ Script de migration
│
├── auth/
│   ├── candidat/connexion/page.tsx     # ✅ Modifié (logique de vérification)
│   └── recruteur/connexion/page.tsx    # ✅ Modifié (logique de vérification)
│
└── MIGRATION_MOT_DE_PASSE.md          # ✅ Documentation complète
```

## ⚡ Commandes Rapides

```bash
# Setup complet
npx prisma generate
npx prisma migrate dev --name add_password_needs_update
npx ts-node scripts/mark-existing-users.ts mark-all

# Vérifier un utilisateur
npx ts-node scripts/mark-existing-users.ts check user@example.com

# Statistiques
npm run dev  # et accédez à /api/stats (si vous créez cette route)
```

## 🐛 Problèmes Courants

### Erreur TypeScript sur `passwordNeedsUpdate`

**Solution** : Régénérez le client Prisma
```bash
npx prisma generate
```

### Les utilisateurs ne sont pas redirigés

**Solution** : Vérifiez que les utilisateurs sont bien marqués en base
```sql
SELECT email, passwordNeedsUpdate FROM user LIMIT 10;
```

### Erreur bcrypt

**Solution** : Réinstallez bcryptjs
```bash
npm install bcryptjs @types/bcryptjs
```

## 📞 Support

Pour plus d'informations, consultez :
- `MIGRATION_MOT_DE_PASSE.md` - Documentation détaillée
- Logs de l'application
- Console du navigateur

---

**Une fois ces étapes terminées, le système sera pleinement opérationnel !** ✅

