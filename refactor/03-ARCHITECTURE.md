# 🟠 03 - PROBLÈMES D'ARCHITECTURE ET DESIGN

## ⚠️ Priorité: IMPORTANTE

Ces problèmes concernent la structure, l'organisation et le design de l'application.

---

## 1. 🔧 Mélange de Responsabilités dans les Composants

### 📍 Localisation
**Fichier**: `app/components/header/header.tsx`  
**541 lignes** - Beaucoup trop pour un seul composant !

### ❌ Problème

Le composant Header fait tout :
- Gestion de l'authentification
- Navigation
- Modales (inscription, profil)
- Menu mobile
- Avatar et dropdowns
- Logique métier

```typescript
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const [isOpenCandidat, setIsOpenCandidat] = useState(false);
  const { user, loading } = useUser();
  const router = useRouter();

  // 500+ lignes de JSX mélangé avec la logique...
};
```

### ⚠️ Risques
- Difficile à maintenir
- Impossible à tester unitairement
- Duplication de code massive
- Performance dégradée
- Bugs difficiles à localiser

### ✅ Solution

Décomposer en composants réutilisables :

```
components/
├── header/
│   ├── Header.tsx (composant principal)
│   ├── HeaderLogo.tsx
│   ├── HeaderNav.tsx
│   ├── HeaderAuthButtons.tsx
│   ├── HeaderUserMenu.tsx
│   │   ├── CandidatMenu.tsx
│   │   ├── RecruteurMenu.tsx
│   │   └── CollaborateurMenu.tsx
│   ├── HeaderMobileMenu.tsx
│   └── modals/
│       ├── SignupModal.tsx
│       └── ProfileModal.tsx
```

**Header.tsx** (composant principal simplifié) :

```typescript
// components/header/Header.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { HeaderLogo } from "./HeaderLogo";
import { HeaderNav } from "./HeaderNav";
import { HeaderAuthButtons } from "./HeaderAuthButtons";
import { HeaderUserMenu } from "./HeaderUserMenu";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import { SignupModal } from "./modals/SignupModal";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const { user, isLoading } = useAuth();

  return (
    <header className="fixed w-full border-b border-border bg-background/80 backdrop-blur-sm top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <HeaderLogo />
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <HeaderNav />
          
          {!isLoading && (
            <>
              {user ? (
                <HeaderUserMenu user={user} />
              ) : (
                <HeaderAuthButtons onSignupClick={() => setIsSignupModalOpen(true)} />
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <HeaderMobileMenu
          isOpen={isMenuOpen}
          onToggle={() => setIsMenuOpen(!isMenuOpen)}
          user={user}
          isLoading={isLoading}
        />
      </div>

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
      />
    </header>
  );
};
```

**HeaderUserMenu.tsx** :

```typescript
// components/header/HeaderUserMenu.tsx
import { AuthUser } from "@/hooks/useAuth";
import { CandidatMenu } from "./CandidatMenu";
import { RecruteurMenu } from "./RecruteurMenu";
import { CollaborateurMenu } from "./CollaborateurMenu";

interface Props {
  user: AuthUser;
}

export const HeaderUserMenu = ({ user }: Props) => {
  switch (user.type) {
    case "CANDIDAT":
      return <CandidatMenu user={user} />;
    case "RECRUTEUR":
      return <RecruteurMenu user={user} />;
    case "COLLABORATEUR":
      return <CollaborateurMenu user={user} />;
    default:
      return null;
  }
};
```

**CandidatMenu.tsx** :

```typescript
// components/header/CandidatMenu.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth-utils";
import { AuthUser } from "@/hooks/useAuth";
import { User, Settings, LogOut } from "lucide-react";

interface Props {
  user: AuthUser;
}

export const CandidatMenu = ({ user }: Props) => {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback>
            {user.name?.charAt(0) || user.email.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm">
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push("/dashboard-candidats")}>
          <User className="mr-2 h-4 w-4" />
          Mon espace
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push("/dashboard-candidats/profil")}>
          <Settings className="mr-2 h-4 w-4" />
          Paramètres
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={logout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

### 📝 Actions
1. Créer les sous-composants
2. Extraire la logique dans des hooks
3. Déplacer les modales dans des composants séparés
4. Supprimer la duplication
5. Ajouter des tests pour chaque composant

---

## 2. 🔧 Absence de Couche Service

### 📍 Localisation
**Général**: Logique métier dispersée partout

### ❌ Problème

La logique métier est directement dans les composants et les routes API :

```typescript
// Logique métier dans le composant
async function onSubmit(values) {
  const res = await signUp.email({...});
  if (res.data) {
    await completeSignupCandidat({...});
    router.push("/auth/candidat/connexion");
  }
}
```

### ⚠️ Risques
- Code dupliqué
- Difficile à tester
- Logique métier non réutilisable
- Couplage fort

### ✅ Solution

Créer une couche service propre :

```
lib/
├── services/
│   ├── auth.service.ts
│   ├── candidat.service.ts
│   ├── recruteur.service.ts
│   ├── job-offer.service.ts
│   ├── application.service.ts
│   └── notification.service.ts
```

**auth.service.ts** :

```typescript
// lib/services/auth.service.ts
import { z } from "zod";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";

// DTOs (Data Transfer Objects)
export const SignupCandidatDTO = z.object({
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

export type SignupCandidatInput = z.infer<typeof SignupCandidatDTO>;

export class AuthService {
  /**
   * Inscription d'un nouveau candidat
   */
  static async signupCandidat(input: SignupCandidatInput) {
    // Validation
    const validated = SignupCandidatDTO.parse(input);

    // Vérifier l'existence
    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      throw new Error("Un compte existe déjà avec cet email");
    }

    // Transaction atomique
    const user = await prisma.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(validated.password, 12);

      // Créer l'utilisateur
      const newUser = await tx.user.create({
        data: {
          email: validated.email,
          name: `${validated.nom} ${validated.prenom}`,
          type: "CANDIDAT",
          emailVerified: false,
        },
      });

      // Créer le profil candidat
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

      // Créer le compte credential
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

    // Envoyer l'email de bienvenue
    await this.sendWelcomeEmail(user.email, user.name || "");

    return user;
  }

  /**
   * Inscription d'un nouveau recruteur
   */
  static async signupRecruteur(input: any) {
    // Similaire à signupCandidat
  }

  /**
   * Envoyer l'email de bienvenue
   */
  private static async sendWelcomeEmail(email: string, name: string) {
    try {
      await sendEmail({
        to: email,
        subject: "Bienvenue sur Ylsix",
        template: "welcome",
        data: { name },
      });
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      // Ne pas bloquer l'inscription si l'email échoue
    }
  }

  /**
   * Connexion
   */
  static async login(email: string, password: string) {
    // Logique de connexion
  }

  /**
   * Vérifier l'email
   */
  static async verifyEmail(token: string) {
    // Logique de vérification
  }
}
```

Utilisation dans les routes API :

```typescript
// app/api/auth/signup/candidat/route.ts
import { AuthService } from "@/lib/services/auth.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await AuthService.signupCandidat(body);
    
    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
```

Utilisation dans les Server Actions :

```typescript
// action/auth/signup.ts
"use server";

import { AuthService } from "@/lib/services/auth.service";

export async function signupCandidat(data: unknown) {
  try {
    const user = await AuthService.signupCandidat(data);
    return { success: true, userId: user.id };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    };
  }
}
```

### 📝 Actions
1. Créer les classes de service
2. Extraire toute la logique métier
3. Centraliser les validations
4. Ajouter des tests unitaires pour les services

---

## 3. 🔧 Structure de Dossiers Confuse

### 📍 Localisation
**Racine du projet**

### ❌ Problème

Structure désorganisée :
```
app/
├── components/ (certains composants)
components/ (autres composants ?)
├── auth/ (composants d'auth dans components/)
lib/
├── services/ (existe mais incomplet)
action/ (au lieu de actions/)
hooks/
utils/
```

Duplication entre `app/components` et `components/`

### ⚠️ Risques
- Confusion sur où mettre les fichiers
- Duplication de code
- Import paths incohérents
- Onboarding difficile

### ✅ Solution

Structure claire et cohérente :

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group - Auth pages
│   │   ├── candidat/
│   │   │   ├── inscription/
│   │   │   └── connexion/
│   │   └── recruteur/
│   │       ├── inscription/
│   │       └── connexion/
│   │
│   ├── (dashboard)/              # Route group - Dashboards
│   │   ├── candidat/
│   │   └── recruteur/
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── candidat/
│   │   ├── recruteur/
│   │   └── offres/
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                   # UN SEUL dossier components
│   ├── ui/                       # shadcn components
│   ├── layout/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── HeaderLogo.tsx
│   │   │   ├── HeaderNav.tsx
│   │   │   └── ...
│   │   ├── Footer/
│   │   └── Sidebar/
│   │
│   ├── auth/                     # Auth components
│   │   ├── LoginForm/
│   │   ├── SignupForm/
│   │   └── PasswordReset/
│   │
│   ├── candidat/                 # Candidat features
│   │   ├── ProfileForm/
│   │   ├── CVBuilder/
│   │   └── ApplicationCard/
│   │
│   ├── recruteur/                # Recruteur features
│   │   ├── OfferForm/
│   │   ├── Kanban/
│   │   └── CandidatesList/
│   │
│   └── shared/                   # Shared components
│       ├── DataTable/
│       ├── SearchBar/
│       └── FileUpload/
│
├── lib/                          # Utilities & Config
│   ├── services/                 # Business logic
│   │   ├── auth.service.ts
│   │   ├── candidat.service.ts
│   │   ├── recruteur.service.ts
│   │   └── notification.service.ts
│   │
│   ├── repositories/             # Data access layer
│   │   ├── user.repository.ts
│   │   ├── candidat.repository.ts
│   │   └── offer.repository.ts
│   │
│   ├── validators/               # Zod schemas
│   │   ├── auth.schemas.ts
│   │   ├── candidat.schemas.ts
│   │   └── offer.schemas.ts
│   │
│   ├── utils/                    # Helper functions
│   │   ├── date.utils.ts
│   │   ├── string.utils.ts
│   │   └── file.utils.ts
│   │
│   ├── auth.ts
│   ├── prisma.ts
│   ├── email.ts
│   └── redis.ts
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useCandidat.ts
│   ├── useRecruteur.ts
│   └── useDebounce.ts
│
├── store/                        # State management (Zustand)
│   ├── auth.store.ts
│   ├── ui.store.ts
│   └── notifications.store.ts
│
├── types/                        # TypeScript types
│   ├── auth.types.ts
│   ├── candidat.types.ts
│   ├── recruteur.types.ts
│   └── api.types.ts
│
├── actions/                      # Server Actions
│   ├── auth/
│   │   ├── signup.ts
│   │   └── login.ts
│   ├── candidat/
│   └── recruteur/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
└── public/
    ├── images/
    ├── icons/
    └── fonts/
```

**Principes de l'organisation** :

1. **Feature-based**: Regrouper par fonctionnalité (candidat, recruteur)
2. **Separation of concerns**: Séparer UI, logique métier, et data access
3. **Colocation**: Garder les fichiers liés ensemble
4. **Scalabilité**: Structure qui grandit bien

### 📝 Actions
1. Créer la nouvelle structure
2. Migrer progressivement les fichiers
3. Mettre à jour les imports
4. Documenter les conventions

---

## 4. 🔧 Absence de Repository Pattern

### 📍 Localisation
**Général**: Requêtes Prisma dispersées partout

### ❌ Problème

Les requêtes Prisma sont répétées dans tous les fichiers :

```typescript
// Dans route.ts
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { candidat: true },
});

// Dans action.ts (même requête)
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { candidat: true },
});
```

### ⚠️ Risques
- Duplication de code
- Incohérence des requêtes
- Difficile à optimiser
- Pas de cache centralisé

### ✅ Solution

Implémenter le Repository Pattern :

```typescript
// lib/repositories/user.repository.ts
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class UserRepository {
  /**
   * Sélections communes
   */
  private static readonly defaultSelect = {
    id: true,
    email: true,
    name: true,
    image: true,
    type: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.UserSelect;

  private static readonly withProfilesInclude = {
    candidat: true,
    recruteur: true,
    collaborateur: {
      include: {
        recruteur: true,
      },
    },
  } satisfies Prisma.UserInclude;

  /**
   * Trouver par ID
   */
  static async findById(id: string, includeProfiles = false) {
    return prisma.user.findUnique({
      where: { id },
      select: this.defaultSelect,
      include: includeProfiles ? this.withProfilesInclude : undefined,
    });
  }

  /**
   * Trouver par email
   */
  static async findByEmail(email: string, includeProfiles = false) {
    return prisma.user.findUnique({
      where: { email },
      select: this.defaultSelect,
      include: includeProfiles ? this.withProfilesInclude : undefined,
    });
  }

  /**
   * Créer un utilisateur
   */
  static async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      select: this.defaultSelect,
    });
  }

  /**
   * Mettre à jour un utilisateur
   */
  static async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: this.defaultSelect,
    });
  }

  /**
   * Supprimer un utilisateur
   */
  static async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Vérifier l'existence
   */
  static async exists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  /**
   * Recherche paginée
   */
  static async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 20, where, orderBy } = params;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        where,
        orderBy,
        select: this.defaultSelect,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }
}
```

**candidat.repository.ts** :

```typescript
// lib/repositories/candidat.repository.ts
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class CandidatRepository {
  private static readonly defaultInclude = {
    user: {
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    },
    competencesList: true,
    experiences: {
      orderBy: { dateDebut: "desc" as const },
      include: {
        experienceCompetences: true,
      },
    },
    formations: {
      orderBy: { dateDebut: "desc" as const },
    },
  } satisfies Prisma.CandidatInclude;

  static async findById(id: string) {
    return prisma.candidat.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  static async findByUserId(userId: string) {
    return prisma.candidat.findUnique({
      where: { userId },
      include: this.defaultInclude,
    });
  }

  static async findByEmail(email: string) {
    return prisma.candidat.findUnique({
      where: { email },
      include: this.defaultInclude,
    });
  }

  static async create(data: Prisma.CandidatCreateInput) {
    return prisma.candidat.create({
      data,
      include: this.defaultInclude,
    });
  }

  static async update(id: string, data: Prisma.CandidatUpdateInput) {
    return prisma.candidat.update({
      where: { id },
      data,
      include: this.defaultInclude,
    });
  }

  static async searchCandidats(params: {
    search?: string;
    competences?: string[];
    pays?: string;
    skip?: number;
    take?: number;
  }) {
    const { search, competences, pays, skip = 0, take = 20 } = params;

    const where: Prisma.CandidatWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { nom: { contains: search } },
                { prenom: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {},
        competences && competences.length > 0
          ? {
              competencesList: {
                some: {
                  nom: { in: competences },
                },
              },
            }
          : {},
        pays ? { pays } : {},
      ],
    };

    const [candidats, total] = await Promise.all([
      prisma.candidat.findMany({
        where,
        skip,
        take,
        include: this.defaultInclude,
        orderBy: { createdAt: "desc" },
      }),
      prisma.candidat.count({ where }),
    ]);

    return {
      data: candidats,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }
}
```

Utilisation dans les services :

```typescript
// lib/services/candidat.service.ts
import { CandidatRepository } from "@/lib/repositories/candidat.repository";
import { UserRepository } from "@/lib/repositories/user.repository";

export class CandidatService {
  static async getCandidatProfile(userId: string) {
    const candidat = await CandidatRepository.findByUserId(userId);
    
    if (!candidat) {
      throw new Error("Profil candidat non trouvé");
    }
    
    return candidat;
  }

  static async updateProfile(userId: string, data: any) {
    const candidat = await CandidatRepository.findByUserId(userId);
    
    if (!candidat) {
      throw new Error("Profil candidat non trouvé");
    }
    
    return CandidatRepository.update(candidat.id, data);
  }

  static async searchCandidats(filters: any) {
    return CandidatRepository.searchCandidats(filters);
  }
}
```

### 📝 Actions
1. Créer les repositories pour chaque entité
2. Centraliser toutes les requêtes Prisma
3. Ajouter le caching si nécessaire
4. Optimiser les requêtes

---

## 5. 🔧 Gestion d'Erreurs Incohérente

### 📍 Localisation
**Général**: Gestion des erreurs ad-hoc

### ❌ Problème

Chaque endroit gère les erreurs différemment :

```typescript
// Version 1
catch (error) {
  console.error(error);
  toast.error("Une erreur est survenue");
}

// Version 2
catch (error) {
  return { error: "Erreur" };
}

// Version 3
catch (error) {
  return NextResponse.json({ error: "Erreur" }, { status: 500 });
}
```

### ⚠️ Risques
- Messages incohérents
- Pas de logging centralisé
- Debugging difficile
- Mauvaise expérience utilisateur

### ✅ Solution

Créer un système de gestion d'erreurs unifié :

```typescript
// lib/errors/AppError.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

// Erreurs spécifiques
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Non authentifié") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Accès refusé") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} non trouvé`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}
```

**Error Handler pour API Routes** :

```typescript
// lib/errors/error-handler.ts
import { NextResponse } from "next/server";
import { AppError } from "./AppError";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  // Erreur d'application
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  // Erreur de validation Zod
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Données invalides",
        code: "VALIDATION_ERROR",
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Erreur Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return NextResponse.json(
          { error: "Cette valeur existe déjà", code: "UNIQUE_CONSTRAINT" },
          { status: 409 }
        );
      case "P2025":
        return NextResponse.json(
          { error: "Ressource non trouvée", code: "NOT_FOUND" },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          { error: "Erreur de base de données", code: "DATABASE_ERROR" },
          { status: 500 }
        );
    }
  }

  // Erreur générique
  return NextResponse.json(
    {
      error: "Une erreur interne est survenue",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}
```

**Utilisation dans les routes API** :

```typescript
// app/api/candidat/profile/route.ts
import { requireCandidat } from "@/lib/auth-middleware";
import { CandidatService } from "@/lib/services/candidat.service";
import { handleApiError } from "@/lib/errors/error-handler";
import { NotFoundError } from "@/lib/errors/AppError";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireCandidat(request);
    if (auth instanceof NextResponse) return auth;

    const candidat = await CandidatService.getCandidatProfile(auth.user.id);
    
    if (!candidat) {
      throw new NotFoundError("Profil candidat");
    }

    return NextResponse.json({ candidat });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 📝 Actions
1. Créer les classes d'erreurs
2. Implémenter les error handlers
3. Migrer toutes les routes API
4. Ajouter le logging centralisé

---

## 📊 Résumé des Actions Prioritaires

| #  | Action | Effort | Impact |
|----|--------|--------|--------|
| 1  | Décomposer Header en composants | 1 jour | 🔴 Élevé |
| 2  | Créer la couche service | 2 jours | 🔴 Élevé |
| 3  | Réorganiser la structure | 3 jours | 🟠 Moyen |
| 4  | Implémenter les repositories | 2 jours | 🟠 Moyen |
| 5  | Gestion d'erreurs unifiée | 1 jour | 🟠 Moyen |

## ✅ Checklist Architecture

- [ ] Composants décomposés et réutilisables
- [ ] Couche service pour la logique métier
- [ ] Repository pattern pour les données
- [ ] Structure de dossiers cohérente
- [ ] Gestion d'erreurs unifiée
- [ ] Separation of concerns respectée
- [ ] Tests unitaires possibles
- [ ] Documentation des patterns

---

**💡 Bénéfices attendus**: Code plus maintenable, testable et évolutif.


