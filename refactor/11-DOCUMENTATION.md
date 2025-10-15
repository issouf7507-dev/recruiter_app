# 🟢 11 - DOCUMENTATION

## ⚠️ Priorité: FAIBLE (mais essentiel pour la maintenabilité)

Ces recommandations concernent la documentation du code et du projet.

---

## 1. 📚 README Incomplet

### 📍 Localisation
**Fichier**: `README.md` (racine)

### ❌ Problème

README basique sans informations critiques.

### ✅ Solution

**README.md complet** :

```markdown
# Ylsix - Plateforme de Recrutement

Plateforme moderne de recrutement connectant candidats et recruteurs avec des fonctionnalités avancées de gestion de candidatures.

## 🚀 Fonctionnalités

- 👥 **Multi-rôles**: Candidats, Recruteurs, Collaborateurs
- 📝 **Gestion de candidatures**: Kanban interactif
- 💬 **Messagerie en temps réel**: WebSocket
- 📄 **Générateur de CV**: Templates professionnels
- 🔔 **Notifications**: Système d'alertes
- 🔍 **Recherche avancée**: Filtres et matching

## 📋 Prérequis

- Node.js >= 18.x
- MySQL >= 8.0
- Redis >= 7.0 (optionnel, pour cache et rate limiting)
- npm ou yarn

## 🛠️ Installation

### 1. Cloner le projet

\`\`\`bash
git clone https://github.com/votre-org/ylsix.git
cd ylsix
\`\`\`

### 2. Installer les dépendances

\`\`\`bash
npm install
\`\`\`

### 3. Configuration

Copier `.env.example` vers `.env` et configurer :

\`\`\`bash
cp .env.example .env
\`\`\`

Variables essentielles :

\`\`\`env
DATABASE_URL="mysql://user:password@localhost:3306/ylsix"
NEXTAUTH_SECRET="votre-secret-généré"
REDIS_URL="redis://localhost:6379"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="votre-email@gmail.com"
SMTP_PASSWORD="votre-mot-de-passe"
\`\`\`

### 4. Initialiser la base de données

\`\`\`bash
# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate deploy

# (Optionnel) Seed avec des données de test
npx prisma db seed
\`\`\`

### 5. Lancer en développement

\`\`\`bash
npm run dev
\`\`\`

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🧪 Tests

\`\`\`bash
# Tests unitaires
npm test

# Tests avec watch
npm run test:watch

# Coverage
npm run test:coverage

# Tests E2E
npm run test:e2e
\`\`\`

## 📦 Production

\`\`\`bash
# Build
npm run build

# Start
npm start
\`\`\`

## 📁 Structure du Projet

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Pages d'authentification
│   ├── (dashboard)/       # Dashboards
│   ├── api/               # API Routes
│   └── ...
├── components/            # Composants React
│   ├── ui/               # Composants UI de base
│   ├── auth/             # Composants auth
│   ├── candidat/         # Composants candidat
│   └── recruteur/        # Composants recruteur
├── lib/                   # Bibliothèques et utilitaires
│   ├── services/         # Logique métier
│   ├── repositories/     # Accès aux données
│   └── utils/            # Fonctions utilitaires
├── hooks/                 # Custom React hooks
├── types/                 # Types TypeScript
└── prisma/               # Schéma et migrations
\`\`\`

## 🔧 Configuration

Voir [CONFIGURATION.md](./CONFIGURATION.md) pour les détails.

## 🚀 Déploiement

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour les instructions.

## 🤝 Contribution

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines.

## 📄 Licence

MIT

## 👥 Équipe

- [@vous](https://github.com/vous) - Développeur principal

## 📞 Support

- Email: support@ylsix.com
- Documentation: https://docs.ylsix.com
\`\`\`

---

## 2. 📚 Absence de Documentation API

### ❌ Problème

Aucune documentation des endpoints API.

### ✅ Solution

**Utiliser Swagger/OpenAPI** :

```bash
npm install next-swagger-doc swagger-ui-react
```

**lib/swagger.ts** :

```typescript
import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Ylsix API",
        version: "1.0.0",
        description: "API de la plateforme de recrutement Ylsix",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Développement",
        },
        {
          url: "https://ylsix.com",
          description: "Production",
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });
  
  return spec;
};
```

**Documentation dans les routes** :

```typescript
// app/api/candidat/profile/route.ts
/**
 * @swagger
 * /api/candidat/profile:
 *   get:
 *     summary: Récupère le profil du candidat
 *     tags: [Candidat]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil du candidat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 nom:
 *                   type: string
 *                 prenom:
 *                   type: string
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Profil non trouvé
 */
export async function GET(request: NextRequest) {
  // ...
}
```

---

## 3. 📚 Composants Non Documentés

### ❌ Problème

Pas de documentation des composants.

### ✅ Solution

**Utiliser JSDoc** :

```typescript
/**
 * Carte affichant les informations d'un utilisateur avec avatar, nom et actions.
 * 
 * @component
 * @example
 * ```tsx
 * <UserCard
 *   user={user}
 *   onSelect={(id) => console.log(id)}
 *   showActions
 * />
 * ```
 */
interface UserCardProps {
  /**
   * Données de l'utilisateur à afficher
   */
  user: User;
  
  /**
   * Callback appelé lors de la sélection de l'utilisateur
   */
  onSelect?: (userId: string) => void;
  
  /**
   * Afficher les boutons d'action
   * @default true
   */
  showActions?: boolean;
  
  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

export const UserCard = ({
  user,
  onSelect,
  showActions = true,
  className,
}: UserCardProps) => {
  // ...
};
```

**Storybook pour documentation visuelle** :

```bash
npm install --save-dev @storybook/react @storybook/nextjs
```

```typescript
// components/ui/UserCard.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { UserCard } from "./UserCard";

const meta: Meta<typeof UserCard> = {
  title: "Components/UserCard",
  component: UserCard,
  tags: ["autodocs"],
  argTypes: {
    showActions: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserCard>;

export const Default: Story = {
  args: {
    user: {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      image: "https://via.placeholder.com/150",
    },
  },
};

export const WithoutActions: Story = {
  args: {
    ...Default.args,
    showActions: false,
  },
};
```

---

## 4. 📚 Services Non Documentés

### ✅ Solution

```typescript
// lib/services/auth.service.ts
/**
 * Service de gestion de l'authentification.
 * 
 * Gère l'inscription, la connexion, la vérification des emails,
 * et la réinitialisation des mots de passe.
 * 
 * @example
 * ```ts
 * const user = await AuthService.signupCandidat({
 *   email: "user@example.com",
 *   password: "Password123!",
 *   // ...
 * });
 * ```
 */
export class AuthService {
  /**
   * Inscrit un nouveau candidat.
   * 
   * Crée un compte utilisateur avec un profil candidat associé.
   * Un email de bienvenue est envoyé après l'inscription.
   * 
   * @param input - Données d'inscription du candidat
   * @returns L'utilisateur créé
   * @throws {Error} Si l'email existe déjà
   * @throws {ValidationError} Si les données sont invalides
   * 
   * @example
   * ```ts
   * try {
   *   const user = await AuthService.signupCandidat({
   *     email: "candidat@example.com",
   *     password: "SecurePass123!",
   *     nom: "Doe",
   *     prenom: "John",
   *     // ...
   *   });
   *   console.log("Utilisateur créé:", user.id);
   * } catch (error) {
   *   if (error.message.includes("existe déjà")) {
   *     // Gérer email en double
   *   }
   * }
   * ```
   */
  static async signupCandidat(input: SignupCandidatInput): Promise<User> {
    // ...
  }
  
  /**
   * Vérifie les identifiants d'un utilisateur.
   * 
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe en clair
   * @returns L'utilisateur si les identifiants sont valides
   * @throws {AuthenticationError} Si les identifiants sont invalides
   */
  static async login(email: string, password: string): Promise<User> {
    // ...
  }
}
```

---

## 5. 📚 Documentation des Hooks

### ✅ Solution

```typescript
// hooks/useAuth.ts
/**
 * Hook d'authentification unifié.
 * 
 * Gère l'état d'authentification de l'utilisateur en combinant
 * la session Better Auth et les données utilisateur complètes.
 * 
 * Utilise React Query pour le cache et la synchronisation.
 * 
 * @returns État d'authentification et helpers
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isLoading, isCandidat } = useAuth();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (!user) return <LoginPrompt />;
 *   
 *   return <div>Bonjour {user.name}</div>;
 * }
 * ```
 */
export function useAuth() {
  const { data: session, isPending: sessionPending } = useSession();
  
  // ...
  
  return {
    /**
     * Données utilisateur complètes (null si non authentifié)
     */
    user,
    
    /**
     * Session Better Auth
     */
    session,
    
    /**
     * Indicateur de chargement
     */
    isLoading: sessionPending || userLoading,
    
    /**
     * L'utilisateur est-il authentifié ?
     */
    isAuthenticated: !!session?.user && !!user,
    
    /**
     * L'utilisateur est-il un candidat ?
     */
    isCandidat: user?.type === "CANDIDAT",
    
    /**
     * L'utilisateur est-il un recruteur ?
     */
    isRecruteur: user?.type === "RECRUTEUR",
    
    /**
     * Rafraîchir les données utilisateur
     */
    refetch,
  };
}
```

---

## 6. 📚 Guide de Contribution

### CONTRIBUTING.md

```markdown
# Guide de Contribution

Merci de votre intérêt pour contribuer à Ylsix !

## Code de Conduite

Soyez respectueux, inclusif et professionnel.

## Comment Contribuer

### 1. Fork et Clone

\`\`\`bash
git clone https://github.com/votre-nom/ylsix.git
cd ylsix
git checkout -b feature/ma-fonctionnalite
\`\`\`

### 2. Conventions de Code

#### Nommage

- **Composants**: PascalCase (`UserCard.tsx`)
- **Hooks**: camelCase avec préfixe use (`useAuth.ts`)
- **Utilitaires**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`User`, `ApiResponse`)
- **Constantes**: SCREAMING_SNAKE_CASE (`API_URL`)

#### Style

- Utiliser Prettier (config `.prettierrc`)
- Suivre les règles ESLint
- Maximum 300 lignes par fichier
- Maximum 50 lignes par fonction

#### TypeScript

- Typage strict (pas de `any`)
- Interfaces pour les objets
- Types pour les unions/intersections

### 3. Commits

Format : `<type>(<scope>): <description>`

Types :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

Exemples :
\`\`\`bash
git commit -m "feat(auth): add password reset"
git commit -m "fix(kanban): resolve drag & drop bug"
git commit -m "docs(readme): update installation steps"
\`\`\`

### 4. Tests

- Ajouter des tests pour toute nouvelle fonctionnalité
- Maintenir le coverage > 70%
- Tous les tests doivent passer

\`\`\`bash
npm test
npm run test:coverage
\`\`\`

### 5. Pull Request

1. Push vers votre fork
2. Créer une PR vers `main`
3. Description claire des changements
4. Lier les issues concernées
5. Attendre la review

## Architecture

Voir [ARCHITECTURE.md](./ARCHITECTURE.md)

## Questions ?

Ouvrir une issue ou contacter l'équipe.
\`\`\`

---

## 7. 📚 Architecture Documentation

### ARCHITECTURE.md

```markdown
# Architecture

## Vue d'Ensemble

Ylsix est une application Next.js 15 utilisant l'App Router avec une architecture en couches.

## Couches

### 1. Présentation (UI)

- **Components**: Composants React réutilisables
- **Pages**: Routes Next.js
- **Hooks**: Logique de composants réutilisable

### 2. Logique Métier (Business Logic)

- **Services**: Logique métier complexe
- **Validators**: Validation des données (Zod)

### 3. Accès aux Données (Data Access)

- **Repositories**: Abstraction des requêtes Prisma
- **Prisma Client**: ORM

### 4. Infrastructure

- **Auth**: Better Auth
- **Database**: MySQL avec Prisma
- **Cache**: Redis
- **Email**: Nodemailer

## Flux de Données

\`\`\`
User Interaction
    ↓
Component (UI)
    ↓
Hook (State Management)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Database
\`\`\`

## Patterns Utilisés

- **Repository Pattern**: Abstraction data access
- **Service Layer**: Logique métier centralisée
- **Custom Hooks**: Réutilisation logique React
- **Error Boundaries**: Gestion erreurs React
- **Middleware Pattern**: Authentification, logging

## Décisions Architecturales

### Pourquoi Next.js App Router ?

- Server Components par défaut
- Streaming et Suspense natifs
- Meilleure performance
- SEO optimisé

### Pourquoi Prisma ?

- Type-safety
- Migrations gérées
- Client TypeScript généré
- Excellent DX

### Pourquoi Better Auth ?

- Modern, sécurisé
- Multi-providers
- Sessions flexibles
- TypeScript first

## Sécurité

- Validation côté client ET serveur
- Authentification obligatoire pour routes protégées
- CSRF protection
- Rate limiting
- Soft delete (audit trail)

## Performance

- Server Components par défaut
- Code splitting automatique
- Image optimization (next/image)
- React Query pour cache
- Redis pour cache distribué
- Indexes database optimisés

## Scalabilité

- Stateless (sessions en DB)
- Horizontal scaling possible
- Cache distribué (Redis)
- Connection pooling (Prisma)
\`\`\`

---

## ✅ Checklist Documentation

- [ ] README complet avec instructions
- [ ] Documentation API (Swagger)
- [ ] Composants documentés (JSDoc)
- [ ] Services documentés
- [ ] Hooks documentés
- [ ] Guide de contribution
- [ ] Documentation architecture
- [ ] Changelog maintenu
- [ ] Storybook pour UI (optionnel)
- [ ] Wiki ou docs/ avec guides

## 📚 Outils Recommandés

### Documentation Automatique

- **TypeDoc**: Génération docs depuis JSDoc
- **Docusaurus**: Site de documentation
- **Storybook**: Documentation composants
- **Swagger UI**: Documentation API interactive

### Diagrammes

- **Mermaid**: Diagrammes en markdown
- **PlantUML**: Diagrammes UML
- **draw.io**: Diagrammes visuels

---

**💡 Règle**: La meilleure documentation est un code auto-documenté, mais la documentation explicite reste essentielle !


