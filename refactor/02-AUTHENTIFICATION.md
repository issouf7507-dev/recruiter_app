# 🔴 02 - PROBLÈMES D'AUTHENTIFICATION ET SESSIONS

## ⚠️ Priorité: CRITIQUE

Ces problèmes concernent la gestion de l'authentification, des sessions et des autorisations.

---

## 1. 🚨 Gestion Incohérente de l'Authentification

### 📍 Localisation
**Fichiers multiples**: 
- `app/components/header/header.tsx`
- `hooks/useUser.ts`
- `lib/auth.ts`

### ❌ Problème

Multiple systèmes d'authentification coexistent :

```typescript
// header.tsx ligne 27
import { signOut, useSession } from "@/lib/auth-client";

// header.tsx ligne 33
const { data: session, isPending } = useSession();

// header.tsx ligne 36
const { user, loading } = useUser();
```

Deux sources de vérité pour l'état utilisateur :
1. `session` de Better Auth
2. `user` du custom hook `useUser`

### ⚠️ Risques
- État incohérent entre les sources
- Race conditions
- Bugs difficiles à débugger
- Performance dégradée (double fetch)

### ✅ Solution

Unifier la gestion de l'authentification :

```typescript
// hooks/useAuth.ts (nouveau hook unifié)
import { useSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  type: "CANDIDAT" | "RECRUTEUR" | "COLLABORATEUR";
  candidat?: CandidatProfile;
  recruteur?: RecruteurProfile;
  collaborateur?: CollaborateurProfile;
}

export function useAuth() {
  const { data: session, isPending: sessionPending } = useSession();
  
  // Fetch des données utilisateur complètes seulement si authentifié
  const { 
    data: user, 
    isLoading: userLoading,
    refetch,
  } = useQuery({
    queryKey: ["user", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const response = await fetch("/api/auth/me");
      if (!response.ok) throw new Error("Failed to fetch user");
      
      const data = await response.json();
      return data.user as AuthUser;
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    // État
    user,
    session,
    isLoading: sessionPending || userLoading,
    isAuthenticated: !!session?.user && !!user,
    
    // Helpers
    isCandidat: user?.type === "CANDIDAT",
    isRecruteur: user?.type === "RECRUTEUR",
    isCollaborateur: user?.type === "COLLABORATEUR",
    
    // Actions
    refetch,
  };
}
```

Utilisation simplifiée dans les composants :

```typescript
// app/components/header/header.tsx (refactorisé)
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth-client";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading, isCandidat, isRecruteur } = useAuth();
  const router = useRouter();

  // Plus de duplication, un seul état !
  
  return (
    <header>
      {/* ... */}
      {!isLoading && user && isRecruteur && (
        <DropdownMenu>
          {/* Menu recruteur */}
        </DropdownMenu>
      )}
      
      {!isLoading && user && isCandidat && (
        <DropdownMenu>
          {/* Menu candidat */}
        </DropdownMenu>
      )}
      
      {!isLoading && !user && (
        <Button onClick={() => setIsOpen(true)}>
          Commencer gratuitement
        </Button>
      )}
    </header>
  );
};
```

### 📝 Actions
1. Créer le hook `useAuth` unifié
2. Remplacer tous les `useSession` + `useUser` par `useAuth`
3. Supprimer l'ancien hook `useUser`
4. Migrer tous les composants

---

## 2. 🚨 Flux d'Inscription Fragmenté

### 📍 Localisation
**Fichiers**:
- `app/auth/candidat/inscription/page.tsx`
- `lib/auth-client.ts`
- `action/signup.ts`

### ❌ Problème

Le flux d'inscription est divisé en plusieurs étapes non atomiques :

```typescript
// 1. Créer le compte Better Auth
const res = await signUp.email({
  email: values.email,
  password: values.password,
  name: values.nom + " " + values.prenom || "",
});

// 2. Créer le profil candidat (séparé)
if (res.data) {
  await completeSignupCandidat({
    email: values.email,
    password: values.password,
    // ...
  });
  
  router.push("/auth/candidat/connexion");
}
```

Si l'étape 2 échoue, l'utilisateur a un compte sans profil !

### ⚠️ Risques
- Données incohérentes
- Utilisateurs "orphelins" sans profil
- Impossible de se connecter après inscription
- Pas de rollback automatique

### ✅ Solution

Créer une transaction atomique côté serveur :

```typescript
// action/auth/signup.ts (refactorisé)
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

const candidatSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nom: z.string().min(2).max(100),
  prenom: z.string().min(2).max(100),
  telephone: z.string().min(8),
  pays: z.string().length(2),
  dateNaissance: z.string(),
  nationalite: z.string(),
  situationFamiliale: z.enum(["celibataire", "marie", "divorce", "veuf"]),
  permisConduire: z.enum(["oui", "non"]),
});

export async function signupCandidat(data: unknown) {
  try {
    // ✅ Validation
    const validated = candidatSignupSchema.parse(data);
    
    // ✅ Vérifier que l'email n'existe pas
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    
    if (existingUser) {
      throw new Error("Un compte existe déjà avec cet email");
    }
    
    // ✅ Transaction atomique
    const user = await prisma.$transaction(async (tx) => {
      // 1. Créer l'utilisateur
      const newUser = await tx.user.create({
        data: {
          email: validated.email,
          name: `${validated.nom} ${validated.prenom}`,
          type: "CANDIDAT",
          emailVerified: false,
        },
      });
      
      // 2. Créer le profil candidat
      await tx.candidat.create({
        data: {
          userId: newUser.id,
          email: validated.email,
          nom: validated.nom,
          prenom: validated.prenom,
          telephone: validated.telephone,
          pays: validated.pays,
          dateNaissance: new Date(validated.dateNaissance),
          nationalite: validated.nationalite,
          situationFamiliale: validated.situationFamiliale,
          permisConduire: validated.permisConduire,
        },
      });
      
      // 3. Créer le compte credential
      const hashedPassword = await bcrypt.hash(validated.password, 12);
      await tx.account.create({
        data: {
          id: crypto.randomUUID(),
          accountId: validated.email,
          providerId: "credential",
          userId: newUser.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      
      return newUser;
    });
    
    // ✅ Envoyer email de vérification
    // await sendVerificationEmail(user.email);
    
    return { 
      success: true, 
      userId: user.id,
      message: "Inscription réussie" 
    };
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Données invalides", 
        details: error.errors 
      };
    }
    
    console.error("Signup error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur lors de l'inscription" 
    };
  }
}
```

Utilisation côté client :

```typescript
// app/auth/candidat/inscription/page.tsx
async function onSubmit(values: z.infer<typeof formSchema>) {
  try {
    setIsLoading(true);
    
    // ✅ Une seule action serveur atomique
    const result = await signupCandidat(values);
    
    if (result.success) {
      toast.success("Inscription réussie ! Vous pouvez vous connecter.");
      router.push("/auth/candidat/connexion");
    } else {
      toast.error(result.error || "Erreur lors de l'inscription");
    }
  } catch (error) {
    toast.error("Une erreur est survenue");
  } finally {
    setIsLoading(false);
  }
}
```

### 📝 Actions
1. Refactoriser le flux d'inscription en transaction atomique
2. Ajouter la gestion des erreurs appropriée
3. Implémenter le rollback automatique
4. Ajouter l'envoi d'email de vérification
5. Tester les cas d'échec

---

## 3. 🚨 Déconnexion Incohérente

### 📍 Localisation
**Fichier**: `app/components/header/header.tsx`  
**Lignes**: 154-159, 202-205, 354-358, 419-423

### ❌ Problème

Code de déconnexion dupliqué avec des implémentations différentes :

```typescript
// Version 1 (ligne 154)
onClick={async () => {
  await signOut();
  window.location.reload();
}}

// Version 2 (ligne 356)
onClick={async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.reload();
}}
```

Deux méthodes différentes utilisées !

### ⚠️ Risques
- Comportement incohérent
- Sessions non nettoyées correctement
- Données en cache persistantes
- Expérience utilisateur confuse

### ✅ Solution

Créer une fonction de déconnexion unifiée :

```typescript
// lib/auth-utils.ts
import { signOut } from "@/lib/auth-client";
import { useUserStore } from "@/store/userStore";
import { useQueryClient } from "@tanstack/react-query";

export async function logout() {
  try {
    // 1. Déconnexion Better Auth
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          // 2. Nettoyer le store Zustand
          useUserStore.getState().clearUser();
          
          // 3. Nettoyer le cache React Query
          const queryClient = useQueryClient();
          queryClient.clear();
          
          // 4. Nettoyer le localStorage
          localStorage.removeItem("user-storage");
          
          // 5. Rediriger vers la page d'accueil
          window.location.href = "/";
        },
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
    // Forcer le nettoyage même en cas d'erreur
    useUserStore.getState().clearUser();
    localStorage.clear();
    window.location.href = "/";
  }
}
```

Utilisation dans les composants :

```typescript
// app/components/header/header.tsx
import { logout } from "@/lib/auth-utils";

const Header = () => {
  // ...
  
  return (
    <DropdownMenuItem onClick={logout}>
      Se déconnecter
    </DropdownMenuItem>
  );
};
```

### 📝 Actions
1. Créer la fonction `logout` unifiée
2. Remplacer toutes les implémentations de déconnexion
3. S'assurer du nettoyage complet de l'état
4. Tester dans différents scénarios

---

## 4. 🚨 Stockage Non Sécurisé des Données Utilisateur

### 📍 Localisation
**Fichier**: `store/userStore.ts`  
**Lignes**: 64-79

### ❌ Problème

```typescript
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      candidat: null,
      loading: true,
      // ...
    }),
    {
      name: "user-storage", // ❌ Stocké en clair dans localStorage !
    }
  )
);
```

Toutes les données utilisateur sont stockées en clair dans le localStorage.

### ⚠️ Risques
- Vol de données via XSS
- Données sensibles accessibles
- Violation du RGPD
- Fuite d'informations

### ✅ Solution

Ne stocker que le strict minimum et utiliser des données côté serveur :

```typescript
// store/authStore.ts (refactorisé)
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  // ✅ Stocker uniquement les données non sensibles
  userId: string | null;
  userType: "CANDIDAT" | "RECRUTEUR" | "COLLABORATEUR" | null;
  
  // Actions
  setAuthState: (userId: string, userType: string) => void;
  clearAuthState: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      userType: null,
      
      setAuthState: (userId, userType) => 
        set({ userId, userType: userType as any }),
        
      clearAuthState: () => 
        set({ userId: null, userType: null }),
    }),
    {
      name: "auth-storage",
      // ✅ Ne persister que les champs nécessaires
      partialize: (state) => ({
        userId: state.userId,
        userType: state.userType,
      }),
    }
  )
);

// Les données complètes viennent toujours du serveur
export function useUserData() {
  const { userId } = useAuthStore();
  
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
```

### 📝 Actions
1. Refactoriser le store pour ne stocker que le minimum
2. Toujours récupérer les données fraîches du serveur
3. Supprimer les données sensibles du localStorage
4. Implémenter la gestion de session côté serveur

---

## 5. 🚨 Absence de Protection CSRF

### 📍 Localisation
**Général**: Toutes les routes API

### ❌ Problème

Aucune protection CSRF (Cross-Site Request Forgery) n'est implémentée.

### ⚠️ Risques
- Attaques CSRF possibles
- Actions non autorisées au nom de l'utilisateur
- Compromission des comptes

### ✅ Solution

Better Auth devrait gérer CSRF, mais vérifier la configuration :

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  
  emailAndPassword: {
    enabled: true,
  },
  
  trustedOrigins: [
    "http://localhost:3000",
    "https://ylsix.com",
    // ✅ Ne pas utiliser de wildcards
  ],
  
  // ✅ Activer la protection CSRF
  csrf: {
    enabled: true,
    cookieName: "auth-csrf-token",
  },
  
  // ✅ Configuration des cookies sécurisés
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
    freshAge: 60 * 60 * 24, // 24 heures
    updateAge: 60 * 60 * 24 * 7, // 7 jours
  },
  
  // ✅ Headers de sécurité
  advanced: {
    cookiePrefix: "ylsix",
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
```

Ajouter un middleware Next.js pour les headers de sécurité :

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // ✅ Headers de sécurité
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // ✅ CSP (Content Security Policy)
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### 📝 Actions
1. Vérifier et activer la protection CSRF dans Better Auth
2. Implémenter le middleware de sécurité
3. Tester avec des outils de sécurité (OWASP ZAP)
4. Documenter la configuration

---

## 6. 🚨 Pas de Rate Limiting

### 📍 Localisation
**Routes d'authentification**

### ❌ Problème

Aucune limitation du nombre de tentatives de connexion ou d'inscription.

### ⚠️ Risques
- Attaques par force brute
- Spam d'inscriptions
- Déni de service (DoS)
- Épuisement des ressources

### ✅ Solution

Implémenter le rate limiting avec Redis :

```typescript
// lib/rate-limit.ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

interface RateLimitConfig {
  interval: number; // en secondes
  limit: number; // nombre de requêtes
}

export async function rateLimit(
  identifier: string, // IP ou user ID
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `rate-limit:${identifier}`;
  
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, config.interval);
  }
  
  const ttl = await redis.ttl(key);
  const remaining = Math.max(0, config.limit - count);
  
  return {
    success: count <= config.limit,
    remaining,
    reset: Date.now() + ttl * 1000,
  };
}

// Configurations prédéfinies
export const RateLimitConfigs = {
  login: { interval: 60 * 15, limit: 5 }, // 5 tentatives / 15 min
  signup: { interval: 60 * 60, limit: 3 }, // 3 inscriptions / heure
  api: { interval: 60, limit: 100 }, // 100 requêtes / minute
  passwordReset: { interval: 60 * 60, limit: 3 }, // 3 reset / heure
};
```

Utilisation dans les routes :

```typescript
// app/api/auth/login/candidat/route.ts
import { rateLimit, RateLimitConfigs } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  // ✅ Rate limiting par IP
  const ip = headers().get("x-forwarded-for") || "unknown";
  const rateLimitResult = await rateLimit(
    `login:${ip}`,
    RateLimitConfigs.login
  );
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { 
        error: "Trop de tentatives. Réessayez plus tard.",
        reset: rateLimitResult.reset,
      },
      { status: 429 }
    );
  }
  
  // Suite du traitement...
}
```

### 📝 Actions
1. Configurer Redis pour le rate limiting
2. Implémenter le rate limiting sur toutes les routes sensibles
3. Ajouter des messages d'erreur clairs
4. Monitorer les tentatives d'abus

---

## 📊 Résumé des Actions Prioritaires

| #  | Action | Fichiers | Effort | Impact |
|----|--------|----------|--------|--------|
| 1  | Créer hook useAuth unifié | hooks/useAuth.ts | 4h | 🔴 Élevé |
| 2  | Transaction atomique signup | action/auth/signup.ts | 3h | 🔴 Élevé |
| 3  | Fonction logout unifiée | lib/auth-utils.ts | 1h | 🟡 Moyen |
| 4  | Sécuriser le store | store/authStore.ts | 2h | 🔴 Élevé |
| 5  | Protection CSRF | lib/auth.ts, middleware.ts | 3h | 🔴 Élevé |
| 6  | Rate limiting | lib/rate-limit.ts | 4h | 🔴 Élevé |

## ✅ Checklist d'Authentification

- [ ] Hook d'authentification unifié
- [ ] Flux d'inscription atomique
- [ ] Déconnexion cohérente partout
- [ ] Données sensibles non stockées localement
- [ ] Protection CSRF activée
- [ ] Rate limiting implémenté
- [ ] Headers de sécurité configurés
- [ ] Email de vérification envoyé
- [ ] Sessions sécurisées
- [ ] Audit logging des actions

---

**⚠️ IMPORTANT**: Ces problèmes d'authentification peuvent compromettre la sécurité de tous les comptes utilisateurs.


