# 🟢 09 - CLEAN CODE ET BEST PRACTICES

## ⚠️ Priorité: FAIBLE (mais important pour la qualité)

Ces problèmes concernent la qualité générale du code.

---

## 1. 🧹 Console.log Partout

### 📍 Localisation
**Fichier**: `app/components/header/header.tsx` ligne 44  
**Et multiples autres fichiers**

### ❌ Problème

```typescript
console.log(user); // ❌ En production !
```

### ✅ Solution

Créer un logger approprié :

```typescript
// lib/logger.ts
const isDev = process.env.NODE_ENV === "development";

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) console.log("[DEBUG]", ...args);
  },
  
  info: (...args: any[]) => {
    if (isDev) console.info("[INFO]", ...args);
  },
  
  warn: (...args: any[]) => {
    console.warn("[WARN]", ...args);
  },
  
  error: (...args: any[]) => {
    console.error("[ERROR]", ...args);
    // Envoyer à Sentry en production
  },
};

// Utilisation
logger.debug("User loaded:", { userId: user.id });
```

---

## 2. 🧹 Code Commenté

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

Code mort commenté :

```typescript
// const { loading: loadingCandidat, candidat } = useAuthCandidat();
// if (user.type === "CANDIDAT") {
//   router.push("/dashboard-candidats");
// } else if (user.type === "RECRUTEUR") {
//   router.push("/dashboard-recruteurs");
// }
```

### ✅ Solution

**SUPPRIMER !** Git garde l'historique.

---

## 3. 🧹 Magic Numbers et Strings

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

```typescript
// ❌ Magic numbers
form.setValue("password", "******");
if (password.length < 6) { }
staleTime: 300000 // Quoi ?

// ❌ Magic strings
if (user.type === "CANDIDAT") { }
```

### ✅ Solution

```typescript
// ✅ Constants
// lib/constants/index.ts
export const PASSWORD_MIN_LENGTH = 8;
export const CACHE_TIME = {
  SHORT: 5 * 60 * 1000,    // 5 minutes
  MEDIUM: 30 * 60 * 1000,  // 30 minutes
  LONG: 60 * 60 * 1000,    // 1 heure
};

export const USER_TYPES = {
  CANDIDAT: "CANDIDAT",
  RECRUTEUR: "RECRUTEUR",
  COLLABORATEUR: "COLLABORATEUR",
} as const;

// Utilisation
if (password.length < PASSWORD_MIN_LENGTH) { }
staleTime: CACHE_TIME.SHORT
if (user.type === USER_TYPES.CANDIDAT) { }
```

---

## 4. 🧹 Noms de Variables Peu Clairs

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

```typescript
// ❌ BAD
const res = await signUp.email({...});
if (res.data) { }

const c = candidates[0];
const d = new Date();
```

### ✅ Solution

```typescript
// ✅ GOOD
const signupResult = await signUp.email({...});
if (signupResult.data) { }

const firstCandidate = candidates[0];
const currentDate = new Date();
```

---

## 5. 🧹 Fonctions Trop Longues

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

Fonctions de 100+ lignes

### ✅ Solution

Décomposer :

```typescript
// ❌ BAD: 100 lignes
async function onSubmit(values) {
  // Validation
  // Transformation
  // Requête
  // Gestion erreurs
  // Redirect
  // Etc...
}

// ✅ GOOD
async function onSubmit(values) {
  const validated = await validateForm(values);
  const transformed = transformFormData(validated);
  const result = await submitData(transformed);
  handleSubmitResult(result);
}

function validateForm(values) { }
function transformFormData(data) { }
async function submitData(data) { }
function handleSubmitResult(result) { }
```

---

## 6. 🧹 Conditions Complexes

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

```typescript
// ❌ BAD: Difficile à lire
if (!isPending && session?.user && user?.type === "RECRUTEUR" && user.recruteur?.isActive) {
  // ...
}
```

### ✅ Solution

```typescript
// ✅ GOOD: Extraire dans des variables
const isAuthenticated = !isPending && !!session?.user;
const isRecruteur = user?.type === "RECRUTEUR";
const isActiveRecruteur = user.recruteur?.isActive ?? false;
const canAccessRecruteurDashboard = isAuthenticated && isRecruteur && isActiveRecruteur;

if (canAccessRecruteurDashboard) {
  // ...
}

// ✅ Ou extraire dans une fonction
function canAccessRecruteurDashboard(user, session, isPending) {
  return !isPending 
    && !!session?.user 
    && user?.type === "RECRUTEUR"
    && user.recruteur?.isActive;
}
```

---

## 7. 🧹 Imports Désorganisés

### 📍 Localisation
**Tous les fichiers**

### ❌ Problème

```typescript
// ❌ Désordre
import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
```

### ✅ Solution

Organiser par catégorie :

```typescript
// ✅ GOOD
// 1. React
import React, { useState, useEffect } from "react";

// 2. Next.js
import Link from "next/link";
import { useRouter } from "next/navigation";

// 3. External libraries
import { z } from "zod";
import { useForm } from "react-hook-form";

// 4. Internal - UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 5. Internal - Features
import { useAuth } from "@/hooks/useAuth";
import { AuthService } from "@/lib/services/auth.service";

// 6. Types
import type { User } from "@/types/auth.types";

// 7. Styles (si nécessaire)
import styles from "./styles.module.css";
```

---

## 8. 🧹 Gestion Incohérente des Erreurs

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

```typescript
// Version 1
try {
  // ...
} catch (error) {
  console.error(error);
  toast.error("Erreur");
}

// Version 2
try {
  // ...
} catch (e) {
  return { error: "Erreur" };
}

// Version 3
try {
  // ...
} catch (err) {
  // Ne rien faire
}
```

### ✅ Solution

Gestion uniforme (voir 03-ARCHITECTURE.md) :

```typescript
// ✅ GOOD
try {
  await someOperation();
} catch (error) {
  logger.error("Operation failed:", error);
  
  if (error instanceof AppError) {
    throw error;
  }
  
  throw new AppError("Une erreur est survenue", 500);
}
```

---

## 9. 🧹 Fichiers Trop Gros

### 📍 Localisation
**header.tsx** (541 lignes)  
**page.tsx** d'inscription (681 lignes)

### ❌ Problème

Fichiers impossibles à maintenir

### ✅ Solution

**Règle**: Max 200-300 lignes par fichier

Décomposer en :
- Composants plus petits
- Hooks personnalisés
- Utilitaires
- Services

---

## 10. 🧹 Pas de PropTypes/Types Documentés

### 📍 Localisation
**Composants**

### ❌ Problème

```typescript
// ❌ Props non documentées
export const UserCard = ({ user, onSelect }) => {
  return <div>...</div>;
};
```

### ✅ Solution

```typescript
// ✅ Types documentés
/**
 * Carte affichant les informations d'un utilisateur
 */
interface UserCardProps {
  /** Données de l'utilisateur à afficher */
  user: User;
  
  /** Callback appelé lors de la sélection */
  onSelect?: (userId: string) => void;
  
  /** Afficher le bouton de sélection */
  showSelectButton?: boolean;
  
  /** Classe CSS additionnelle */
  className?: string;
}

export const UserCard = ({
  user,
  onSelect,
  showSelectButton = true,
  className,
}: UserCardProps) => {
  return <div className={className}>...</div>;
};
```

---

## 11. 🧹 Return Early Pattern Non Utilisé

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

```typescript
// ❌ BAD: Nesting profond
function processUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // Faire quelque chose
        return result;
      } else {
        throw new Error("No permission");
      }
    } else {
      throw new Error("Inactive");
    }
  } else {
    throw new Error("No user");
  }
}
```

### ✅ Solution

```typescript
// ✅ GOOD: Return early
function processUser(user) {
  if (!user) {
    throw new Error("No user");
  }
  
  if (!user.isActive) {
    throw new Error("Inactive");
  }
  
  if (!user.hasPermission) {
    throw new Error("No permission");
  }
  
  // Logique principale au premier niveau
  return result;
}
```

---

## 12. 🧹 État Local Inutile

### 📍 Localisation
**Composants React**

### ❌ Problème

```typescript
// ❌ BAD: État dérivé
const [fullName, setFullName] = useState("");

useEffect(() => {
  setFullName(`${user.firstName} ${user.lastName}`);
}, [user]);
```

### ✅ Solution

```typescript
// ✅ GOOD: Calculé à la volée
const fullName = `${user.firstName} ${user.lastName}`;

// Ou avec useMemo si coûteux
const fullName = useMemo(
  () => `${user.firstName} ${user.lastName}`,
  [user.firstName, user.lastName]
);
```

---

## 13. 🧹 Pas de Guards/Type Narrowing

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

```typescript
// ❌ BAD: Unsafe
function getUserName(user: User | null) {
  return user.name; // ❌ Peut crasher !
}
```

### ✅ Solution

```typescript
// ✅ GOOD: Type guards
function getUserName(user: User | null): string {
  if (!user) {
    return "Invité";
  }
  
  return user.name ?? "Sans nom";
}

// ✅ Ou assertions
function getUserName(user: User | null): string {
  return user?.name ?? "Invité";
}
```

---

## ✅ Checklist Clean Code

- [ ] Supprimer tous les console.log
- [ ] Supprimer le code commenté
- [ ] Extraire les magic numbers/strings
- [ ] Noms de variables explicites
- [ ] Fonctions courtes (< 30 lignes)
- [ ] Conditions simplifiées
- [ ] Imports organisés
- [ ] Gestion d'erreurs uniforme
- [ ] Fichiers courts (< 300 lignes)
- [ ] Props typées et documentées
- [ ] Return early pattern
- [ ] Pas d'état local inutile
- [ ] Type guards appropriés

## 📚 Ressources

- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Airbnb Style Guide](https://github.com/airbnb/javascript)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

## 🔧 Configuration ESLint Recommandée

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "max-lines": ["warn", { max: 300 }],
    "max-lines-per-function": ["warn", { max: 50 }],
    "complexity": ["warn", 10],
  },
};
```

---

**💡 Principe**: Le code est lu 10 fois plus qu'il n'est écrit. Optimisez pour la lecture !


