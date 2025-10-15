# 🟡 07 - TYPES TYPESCRIPT

## ⚠️ Priorité: MOYENNE

Ces problèmes concernent le typage TypeScript et la sécurité de type.

---

## 1. 🔧 Types `any` Utilisés

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

```typescript
// ❌ Perd tous les bénéfices de TypeScript
function handleData(data: any) {
  return data.someProperty; // Aucune vérification !
}
```

### ✅ Solution

```typescript
// ✅ Type explicite
interface UserData {
  id: string;
  name: string;
  email: string;
}

function handleData(data: UserData) {
  return data.name; // ✅ Vérifié par TypeScript
}

// ✅ Ou générique si vraiment nécessaire
function handleData<T>(data: T): T {
  return data;
}
```

---

## 2. 🔧 Interfaces vs Types Incohérents

### 📍 Localisation
**Fichiers de types**

### ❌ Problème

Utilisation aléatoire de `interface` et `type` :

```typescript
// Fichier 1
interface User {
  id: string;
}

// Fichier 2
type Candidat = {
  id: string;
};
```

### ✅ Solution

**Convention recommandée** :

```typescript
// ✅ Interfaces pour les objets extensibles
interface User {
  id: string;
  name: string;
}

interface Candidat extends User {
  cv: string;
}

// ✅ Types pour les unions, intersections, utilitaires
type UserType = "CANDIDAT" | "RECRUTEUR" | "COLLABORATEUR";

type AuthUser = User & {
  type: UserType;
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};
```

---

## 3. 🔧 Pas de Types pour les Props

### 📍 Localisation
**Composants React**

### ❌ Problème

```typescript
// ❌ Props non typées
export function UserCard({ user, onSelect }) {
  return <div onClick={() => onSelect(user.id)}>...</div>;
}
```

### ✅ Solution

```typescript
// ✅ Props typées
interface UserCardProps {
  user: User;
  onSelect: (userId: string) => void;
  className?: string;
}

export function UserCard({ user, onSelect, className }: UserCardProps) {
  return (
    <div 
      onClick={() => onSelect(user.id)}
      className={className}
    >
      {user.name}
    </div>
  );
}
```

---

## 4. 🔧 Types Dupliqués

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

Même type redéfini partout :

```typescript
// hooks/useUser.ts
interface User {
  id: string;
  email: string;
  // ...
}

// store/userStore.ts (DUPLIQUÉ)
interface User {
  id: string;
  email: string;
  // ...
}
```

### ✅ Solution

Centraliser les types :

```typescript
// types/auth.types.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  type: UserType;
}

export interface Candidat {
  id: string;
  userId: string;
  nom: string;
  prenom: string;
  // ...
}

export interface Recruteur {
  id: string;
  userId: string;
  entreprise: string;
  // ...
}

export type UserType = "CANDIDAT" | "RECRUTEUR" | "COLLABORATEUR";

// Utiliser partout
import type { User, Candidat } from "@/types/auth.types";
```

---

## 5. 🔧 Pas de Typage des Réponses API

### 📍 Localisation
**Routes API et fetches**

### ❌ Problème

```typescript
// ❌ Type unknown/any
const response = await fetch("/api/user");
const data = await response.json(); // any !
```

### ✅ Solution

```typescript
// types/api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Utilisation côté serveur
export async function GET(): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const user = await UserRepository.findById(id);
    
    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "User not found",
    });
  }
}

// Utilisation côté client
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/user/${id}`);
  const result: ApiResponse<User> = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch user");
  }
  
  return result.data; // ✅ Typé !
}
```

---

## 6. 🔧 Assertions de Type Dangereuses

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

```typescript
// ❌ Assertion non vérifiée
const user = data as User; // Dangereux !
```

### ✅ Solution

```typescript
// ✅ Type guard
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "email" in data &&
    typeof (data as any).id === "string" &&
    typeof (data as any).email === "string"
  );
}

// Utilisation
if (isUser(data)) {
  // data est maintenant User
  console.log(data.email);
}

// ✅ Ou avec Zod
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
});

type User = z.infer<typeof UserSchema>;

// Validation runtime + type
const user = UserSchema.parse(data); // ✅ Vérifié !
```

---

## 7. 🔧 Pas de Types pour les Événements

### 📍 Localisation
**Handlers d'événements**

### ❌ Problème

```typescript
// ❌ Type implicite any
<input onChange={(e) => handleChange(e)} />

function handleChange(e) {
  console.log(e.target.value);
}
```

### ✅ Solution

```typescript
// ✅ Type explicite
import { ChangeEvent } from "react";

<input onChange={handleChange} />

function handleChange(e: ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value); // ✅ Typé !
}

// Types courants
type InputChangeEvent = ChangeEvent<HTMLInputElement>;
type FormSubmitEvent = FormEvent<HTMLFormElement>;
type ButtonClickEvent = MouseEvent<HTMLButtonElement>;
```

---

## 8. 🔧 Enums vs Union Types

### 📍 Localisation
**Prisma schema et code TypeScript**

### ❌ Problème

Prisma génère des enums mais code utilise des strings :

```prisma
enum UserType {
  CANDIDAT
  RECRUTEUR
  COLLABORATEUR
}
```

```typescript
// ❌ Type string
if (user.type === "CANDIDAT") { }
```

### ✅ Solution

```typescript
// ✅ Utiliser l'enum Prisma
import { UserType } from "@prisma/client";

if (user.type === UserType.CANDIDAT) { }

// ✅ Ou union type
type UserTypeUnion = "CANDIDAT" | "RECRUTEUR" | "COLLABORATEUR";

// ✅ Helper pour vérification
function isUserType(value: string): value is UserTypeUnion {
  return ["CANDIDAT", "RECRUTEUR", "COLLABORATEUR"].includes(value);
}
```

---

## 9. 🔧 Pas de Types pour les Utilitaires

### 📍 Localisation
**Fonctions utilitaires**

### ❌ Problème

```typescript
// ❌ Types loosely typed
function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {});
}
```

### ✅ Solution

```typescript
// ✅ Génériques typés
function pick<T, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Pick<T, K>);
}

// Utilisation
const user = { id: "1", name: "John", email: "john@example.com" };
const picked = pick(user, ["id", "name"]); // { id: string, name: string }
```

---

## 10. 🔧 Types Incomplets pour Prisma

### 📍 Localisation
**Utilisation de Prisma**

### ❌ Problème

```typescript
// ❌ Type généré automatiquement incomplet
const user = await prisma.user.findUnique({
  include: { candidat: true },
});
// user.candidat peut être null mais TypeScript ne le sait pas bien
```

### ✅ Solution

```typescript
// ✅ Type Prisma avec includes
import { Prisma } from "@prisma/client";

type UserWithCandidat = Prisma.UserGetPayload<{
  include: { candidat: true };
}>;

const user: UserWithCandidat | null = await prisma.user.findUnique({
  where: { id },
  include: { candidat: true },
});

if (user?.candidat) {
  // ✅ TypeScript sait que candidat existe ici
  console.log(user.candidat.nom);
}

// ✅ Définir des types réutilisables
export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    candidat: true;
    recruteur: true;
    collaborateur: true;
  };
}>;

export type JobOfferWithDetails = Prisma.JobOfferGetPayload<{
  include: {
    recruteur: {
      select: {
        name: true;
        logo: true;
      };
    };
    applications: {
      include: {
        candidat: true;
      };
    };
  };
}>;
```

---

## 11. 🔧 Pas de Discriminated Unions

### 📍 Localisation
**Types d'état ou de résultats**

### ❌ Problème

```typescript
// ❌ État ambigu
interface Result {
  success: boolean;
  data?: User;
  error?: string;
}

// Problème: Peut avoir data ET error en même temps !
```

### ✅ Solution

```typescript
// ✅ Discriminated union
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Utilisation avec narrowing automatique
const result: Result<User> = await fetchUser();

if (result.success) {
  console.log(result.data); // ✅ data existe
  // console.log(result.error); // ❌ Erreur TypeScript !
} else {
  console.log(result.error); // ✅ error existe
  // console.log(result.data); // ❌ Erreur TypeScript !
}
```

---

## 12. 🔧 Pas de Types pour les Config

### 📍 Localisation
**Configuration et constantes**

### ❌ Problème

```typescript
// ❌ Config non typée
const config = {
  apiUrl: process.env.API_URL,
  timeout: process.env.TIMEOUT,
};
```

### ✅ Solution

```typescript
// ✅ Config typée
interface AppConfig {
  apiUrl: string;
  timeout: number;
  features: {
    enableChat: boolean;
    enableNotifications: boolean;
  };
}

function loadConfig(): AppConfig {
  const timeout = parseInt(process.env.TIMEOUT || "5000", 10);
  
  if (isNaN(timeout)) {
    throw new Error("Invalid TIMEOUT configuration");
  }
  
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    timeout,
    features: {
      enableChat: process.env.NEXT_PUBLIC_ENABLE_CHAT === "true",
      enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === "true",
    },
  };
}

export const config: AppConfig = loadConfig();
```

---

## ✅ Checklist TypeScript

- [ ] Aucun type `any`
- [ ] Convention cohérente (interface vs type)
- [ ] Tous les composants ont des props typées
- [ ] Types centralisés (pas de duplication)
- [ ] Réponses API typées
- [ ] Type guards au lieu d'assertions
- [ ] Événements typés
- [ ] Enums Prisma utilisés
- [ ] Utilitaires génériques typés
- [ ] Types Prisma avec includes
- [ ] Discriminated unions pour états
- [ ] Configuration typée

## 📚 Types Utilitaires à Connaître

```typescript
// Partial: Rend tous les champs optionnels
type PartialUser = Partial<User>;

// Required: Rend tous les champs obligatoires
type RequiredUser = Required<User>;

// Pick: Sélectionne certains champs
type UserBasic = Pick<User, "id" | "name">;

// Omit: Exclut certains champs
type UserWithoutPassword = Omit<User, "password">;

// Record: Crée un type objet
type UserById = Record<string, User>;

// Readonly: Rend immuable
type ReadonlyUser = Readonly<User>;

// NonNullable: Enlève null/undefined
type DefinedUser = NonNullable<User | null>;

// ReturnType: Type de retour d'une fonction
type FetchResult = ReturnType<typeof fetchUser>;

// Parameters: Types des paramètres
type FetchParams = Parameters<typeof fetchUser>;
```

---

**💡 Règle**: Si TypeScript se plaint, c'est probablement qu'il a raison !


