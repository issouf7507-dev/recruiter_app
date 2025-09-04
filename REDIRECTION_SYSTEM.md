# Système de Redirection Automatique

Ce document explique le système de redirection automatique basé sur le type d'utilisateur dans l'application Ylsix.

## Vue d'ensemble

Le système permet de rediriger automatiquement les utilisateurs connectés vers leur dashboard approprié en fonction de leur type :

- `RECRUTEUR` → `/dashboard-recruteurs`
- `CANDIDAT` → `/dashboard-candidats`
- `COLLABORATEUR` → `/dashboard-recruteurs` (même dashboard que les recruteurs)

## Composants créés

### 1. `lib/auth-redirect.ts`

Utilitaires pour gérer la redirection :

- `getRedirectPath(userType)`: Détermine la route de redirection
- `canAccessRoute(userType, pathname)`: Vérifie l'accès à une route

### 2. `components/auth-guard.tsx`

Composant de garde d'authentification qui :

- Vérifie si l'utilisateur est connecté
- Redirige vers la page de connexion si non connecté
- Vérifie le type d'utilisateur requis
- Redirige vers le dashboard approprié si le type ne correspond pas

### 3. `hooks/useAutoRedirect.ts`

Hook personnalisé pour la redirection automatique :

- Utilise `useAuth` pour récupérer les informations utilisateur
- Redirige automatiquement vers le dashboard approprié
- Retourne l'état de chargement

### 4. `components/auto-redirect.tsx`

Composant de redirection avec loader :

- Affiche un loader pendant la redirection
- Utilise `useAutoRedirect` en interne

## Utilisation

### Dans les pages de connexion

```tsx
import { useAutoRedirect } from "@/hooks/useAutoRedirect";

export default function ConnexionPage() {
  const { user, isLoading } = useAutoRedirect();

  if (isLoading) {
    return <div>Vérification en cours...</div>;
  }

  // Reste du composant...
}
```

### Dans les layouts protégés

```tsx
import { AuthGuard } from "@/components/auth-guard";
import { UserType } from "@prisma/client";

export default function Layout({ children }) {
  return (
    <AuthGuard requiredUserType={UserType.RECRUTEUR}>{children}</AuthGuard>
  );
}
```

### Dans la page d'accueil

```tsx
import { useAutoRedirect } from "@/hooks/useAutoRedirect";

export default function HomePage() {
  const { user, isLoading } = useAutoRedirect();

  if (isLoading) {
    return <div>Redirection en cours...</div>;
  }

  // Contenu de la page d'accueil...
}
```

## Configuration Better-Auth

Le fichier `lib/auth.ts` a été corrigé pour ne plus inclure les relations dans les champs de base :

```ts
user: {
  fields: {
    id: true,
    email: true,
    type: true, // ✅ Champ disponible pour la redirection
    name: true,
    createdAt: true,
    updatedAt: true,
    emailVerified: true,
    image: true,
    // ❌ Relations supprimées (candidat, recruteur, collaborateur)
  },
},
```

## Flux de redirection

1. **Utilisateur non connecté** → Page de connexion
2. **Utilisateur connecté** → Dashboard selon le type :
   - `RECRUTEUR` → `/dashboard-recruteurs`
   - `CANDIDAT` → `/dashboard-candidats`
   - `COLLABORATEUR` → `/dashboard-recruteurs`
3. **Type incorrect** → Redirection vers le bon dashboard
4. **Accès non autorisé** → Redirection vers le dashboard approprié

## Avantages

- ✅ Redirection automatique et transparente
- ✅ Protection des routes par type d'utilisateur
- ✅ Expérience utilisateur fluide
- ✅ Code réutilisable et maintenable
- ✅ Gestion centralisée des redirections
- ✅ Support des loaders pendant les redirections

## Notes importantes

- Le champ `type` dans le modèle `User` est utilisé pour déterminer la redirection
- Les relations `candidat`, `recruteur`, `collaborateur` ne sont plus incluses dans la configuration `better-auth`
- Le système fonctionne avec `better-auth` et Prisma
- Tous les composants sont TypeScript et incluent une gestion d'erreur appropriée
