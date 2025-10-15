# 🔴 01 - PROBLÈMES DE SÉCURITÉ CRITIQUES

## ⚠️ Priorité: CRITIQUE

Ces problèmes doivent être corrigés immédiatement car ils exposent l'application à des vulnérabilités de sécurité graves.

---

## 1. 🚨 Validation des Données Désactivée

### 📍 Localisation
**Fichier**: `app/auth/candidat/inscription/page.tsx`  
**Ligne**: 115

### ❌ Problème
```typescript
const form = useForm<z.infer<typeof formSchema>>({
  // resolver: zodResolver(formSchema),  // ❌ DÉSACTIVÉ !
  defaultValues: {
    email: "",
    password: "",
    // ...
  },
});
```

Le validateur Zod est commenté, ce qui permet d'envoyer des données non validées au serveur.

### ⚠️ Risques
- Injection SQL possible
- Données malformées dans la base
- Bypass de la validation des mots de passe
- Création de comptes avec des emails invalides

### ✅ Solution
```typescript
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema), // ✅ ACTIVER LA VALIDATION
  defaultValues: {
    email: "",
    password: "",
    confirmPassword: "",
    nom: "",
    prenom: "",
    telephone: "",
    pays: "",
    dateNaissance: "",
    nationalite: "",
    situationFamiliale: "",
    permisConduire: "",
  },
});
```

### 📝 Actions
1. Réactiver le `zodResolver`
2. Tester tous les champs avec des données invalides
3. S'assurer que les messages d'erreur s'affichent correctement

---

## 2. 🚨 Absence de Validation Côté Serveur

### 📍 Localisation
**Fichier**: `action/signup.ts`  
**Lignes**: 6-70

### ❌ Problème
```typescript
export async function completeSignupCandidat(data: {
  email: string;
  password: string;
  // ... autres champs
}) {
  // ❌ Aucune validation des données !
  return await prisma.user.update({
    where: { email: data.email },
    data: {
      email: data.email,
      name: data.nom + " " + data.prenom,
      // ...
    },
  });
}
```

Aucune validation n'est effectuée côté serveur. Les données sont directement utilisées.

### ⚠️ Risques
- Injection de données malveillantes
- Bypass complet de la validation client
- Données incohérentes en base
- XSS potentiel via les noms

### ✅ Solution
```typescript
import { z } from "zod";

// Schéma de validation côté serveur
const candidatSignupSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
  confirmPassword: z.string(),
  nom: z.string().min(2).max(100).trim(),
  prenom: z.string().min(2).max(100).trim(),
  telephone: z.string().min(8).max(20),
  pays: z.string().length(2, "Code pays invalide"),
  dateNaissance: z.string().refine((date) => {
    const birthDate = new Date(date);
    const age = (new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 16 && age <= 120;
  }, "Âge invalide"),
  nationalite: z.string().min(2).max(100),
  situationFamiliale: z.enum(["celibataire", "marie", "divorce", "veuf"]),
  permisConduire: z.enum(["oui", "non"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export async function completeSignupCandidat(data: unknown) {
  // ✅ Validation stricte
  const validatedData = candidatSignupSchema.parse(data);
  
  // ✅ Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });
  
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  
  // ✅ Vérifier qu'il n'a pas déjà un profil candidat
  if (user.candidat) {
    throw new Error("Profil candidat déjà existant");
  }
  
  return await prisma.user.update({
    where: { email: validatedData.email },
    data: {
      name: `${validatedData.nom} ${validatedData.prenom}`,
      type: "CANDIDAT",
      candidat: {
        create: {
          nom: validatedData.nom,
          prenom: validatedData.prenom,
          telephone: validatedData.telephone,
          pays: validatedData.pays,
          dateNaissance: new Date(validatedData.dateNaissance),
          nationalite: validatedData.nationalite,
          situationFamiliale: validatedData.situationFamiliale,
          permisConduire: validatedData.permisConduire,
          email: validatedData.email,
        },
      },
    },
  });
}
```

### 📝 Actions
1. Créer des schémas Zod pour toutes les actions serveur
2. Valider TOUTES les entrées utilisateur
3. Ajouter des messages d'erreur clairs
4. Logger les tentatives de validation échouées

---

## 3. 🚨 Stockage Non Sécurisé du Mot de Passe

### 📍 Localisation
**Fichier**: `app/api/auth/force-update-password/route.ts`  
**Lignes**: 43-53

### ❌ Problème
```typescript
const bcrypt = require("bcryptjs"); // ❌ require() au lieu d'import
const hashedPassword = await bcrypt.hash(newPassword, 10);

await prisma.user.update({
  where: { email: email },
  data: {
    password: hashedPassword,
    passwordNeedsUpdate: true, // ❌ Logique inversée ?
  },
});
```

Plusieurs problèmes :
1. Utilisation de `require()` au lieu d'`import`
2. Le flag `passwordNeedsUpdate` devrait être `false` après mise à jour
3. Pas de validation de la force du mot de passe
4. Pas de vérification de l'ancien mot de passe

### ⚠️ Risques
- Mot de passe faible accepté
- Logique métier incorrecte
- Possibilité de changer le mot de passe sans vérification

### ✅ Solution
```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Schéma de validation robuste
const passwordUpdateSchema = z.object({
  email: z.string().email(),
  oldPassword: z.string().optional(), // Pour vérification si utilisateur connecté
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // ✅ Validation stricte
    const validatedData = passwordUpdateSchema.parse(body);

    // ✅ Récupérer l'utilisateur avec le mot de passe actuel
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        accounts: {
          where: { providerId: "credential" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // ✅ Si oldPassword fourni, vérifier qu'il correspond
    if (validatedData.oldPassword && user.accounts[0]?.password) {
      const isValid = await bcrypt.compare(
        validatedData.oldPassword,
        user.accounts[0].password
      );
      
      if (!isValid) {
        return NextResponse.json(
          { error: "Ancien mot de passe incorrect" },
          { status: 401 }
        );
      }
    }

    // ✅ Hasher le nouveau mot de passe avec un salt plus fort
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // ✅ Mettre à jour dans une transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { email: validatedData.email },
        data: {
          password: hashedPassword,
          passwordNeedsUpdate: false, // ✅ Logique correcte
        },
      }),
      prisma.account.upsert({
        where: {
          id: user.accounts[0]?.id || crypto.randomUUID(),
        },
        create: {
          id: crypto.randomUUID(),
          accountId: user.email,
          providerId: "credential",
          userId: user.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        update: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }),
    ]);

    // ✅ Logger l'action (audit trail)
    console.info(`Password updated for user: ${user.email}`);

    return NextResponse.json(
      { 
        success: true, 
        message: "Mot de passe mis à jour avec succès" 
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Erreur lors de la mise à jour du mot de passe:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
```

### 📝 Actions
1. Implémenter la politique de mots de passe forts
2. Vérifier l'ancien mot de passe avant changement
3. Utiliser bcrypt avec un salt de 12 minimum
4. Logger les changements de mot de passe pour l'audit
5. Envoyer un email de notification

---

## 4. 🚨 Exposition d'Informations Sensibles

### 📍 Localisation
**Fichier**: `app/components/header/header.tsx`  
**Ligne**: 44

### ❌ Problème
```typescript
console.log(user); // ❌ Log de l'objet utilisateur complet !
```

Les données utilisateur complètes sont loggées en production.

### ⚠️ Risques
- Exposition des données personnelles dans les logs
- Violation du RGPD
- Informations sensibles accessibles en production

### ✅ Solution
```typescript
// ❌ NE JAMAIS FAIRE
console.log(user);

// ✅ En développement seulement, avec données filtrées
if (process.env.NODE_ENV === "development") {
  console.log("User loaded:", {
    id: user?.id,
    type: user?.type,
    // N'inclure que les données non sensibles
  });
}

// ✅ Ou utiliser un logger approprié
import logger from "@/lib/logger";
logger.debug("User loaded", { userId: user?.id });
```

### 📝 Actions
1. Supprimer TOUS les `console.log` de données utilisateur
2. Implémenter un système de logging approprié
3. Filtrer les données sensibles des logs
4. Configurer différents niveaux de log selon l'environnement

---

## 5. 🚨 Routes API Non Protégées

### 📍 Localisation
**Multiples fichiers** dans `app/api/`

### ❌ Problème
Beaucoup de routes API n'ont pas de vérification d'authentification ou d'autorisation.

### ⚠️ Risques
- Accès non autorisé aux données
- Modification de données par des utilisateurs non authentifiés
- Escalade de privilèges

### ✅ Solution

Créer un middleware d'authentification :

```typescript
// lib/auth-middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function requireAuth(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }
  
  return session;
}

export async function requireCandidat(request: NextRequest) {
  const session = await requireAuth(request);
  
  if (session instanceof NextResponse) {
    return session; // Erreur d'auth
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { candidat: true },
  });
  
  if (!user?.candidat) {
    return NextResponse.json(
      { error: "Accès refusé - Profil candidat requis" },
      { status: 403 }
    );
  }
  
  return { session, user, candidat: user.candidat };
}

export async function requireRecruteur(request: NextRequest) {
  const session = await requireAuth(request);
  
  if (session instanceof NextResponse) {
    return session;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { recruteur: true },
  });
  
  if (!user?.recruteur) {
    return NextResponse.json(
      { error: "Accès refusé - Profil recruteur requis" },
      { status: 403 }
    );
  }
  
  return { session, user, recruteur: user.recruteur };
}
```

Utilisation dans les routes :

```typescript
// app/api/candidat/profile/route.ts
import { requireCandidat } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  const auth = await requireCandidat(request);
  
  // Si c'est une NextResponse, c'est une erreur
  if (auth instanceof NextResponse) {
    return auth;
  }
  
  const { candidat } = auth;
  
  // Suite du traitement...
  return NextResponse.json({ candidat });
}

export async function PUT(request: NextRequest) {
  const auth = await requireCandidat(request);
  
  if (auth instanceof NextResponse) {
    return auth;
  }
  
  const { candidat } = auth;
  const body = await request.json();
  
  // Validation et mise à jour...
}
```

### 📝 Actions
1. Auditer TOUTES les routes API
2. Ajouter l'authentification aux routes protégées
3. Implémenter l'autorisation basée sur les rôles
4. Tester les accès non autorisés

---

## 6. 🚨 Injection SQL Potentielle

### 📍 Localisation
**Risque général** avec Prisma si mal utilisé

### ⚠️ Risques
Bien que Prisma protège contre les injections SQL, les requêtes brutes (`$queryRaw`) sont dangereuses.

### ✅ Solution
```typescript
// ❌ DANGEREUX
const users = await prisma.$queryRaw`
  SELECT * FROM user WHERE email = ${email}
`;

// ✅ SÉCURISÉ avec Prisma ORM
const users = await prisma.user.findMany({
  where: { email },
});

// ✅ Si vraiment besoin de requête brute, utiliser les paramètres
import { Prisma } from "@prisma/client";

const users = await prisma.$queryRaw(
  Prisma.sql`SELECT * FROM user WHERE email = ${email}`
);
```

### 📝 Actions
1. Éviter `$queryRaw` et `$executeRaw`
2. Toujours utiliser l'ORM Prisma
3. Si requête brute nécessaire, utiliser les paramètres Prisma.sql

---

## 📊 Résumé des Actions Prioritaires

| #  | Action | Fichier(s) | Effort | Impact |
|----|--------|-----------|--------|--------|
| 1  | Activer la validation Zod | inscription/page.tsx | 5 min | 🔴 Élevé |
| 2  | Ajouter validation serveur | action/signup.ts | 2h | 🔴 Élevé |
| 3  | Corriger la gestion des mots de passe | force-update-password/route.ts | 3h | 🔴 Élevé |
| 4  | Supprimer les console.log | Tous les fichiers | 1h | 🟡 Moyen |
| 5  | Protéger les routes API | app/api/* | 1 jour | 🔴 Élevé |
| 6  | Créer middleware d'auth | lib/auth-middleware.ts | 4h | 🔴 Élevé |

## ✅ Checklist de Sécurité

- [ ] Validation côté client activée
- [ ] Validation côté serveur implémentée
- [ ] Mots de passe forts obligatoires
- [ ] Routes API protégées
- [ ] Logs nettoyés des données sensibles
- [ ] Pas d'injection SQL possible
- [ ] HTTPS activé en production
- [ ] Headers de sécurité configurés
- [ ] Rate limiting implémenté
- [ ] CORS correctement configuré

---

**⚠️ IMPORTANT**: Ces problèmes de sécurité doivent être corrigés AVANT toute mise en production ou exposition publique de l'application.


