# 🟢 10 - TESTS ET QUALITÉ

## ⚠️ Priorité: FAIBLE (mais critique pour la qualité long terme)

Ces recommandations concernent l'ajout de tests pour assurer la qualité et la stabilité.

---

## 1. 🧪 Absence Totale de Tests

### 📍 Localisation
**Projet entier**

### ❌ Problème

Aucun fichier de test n'existe dans le projet.

### ⚠️ Risques
- Régressions non détectées
- Refactoring dangereux
- Bugs en production
- Confiance faible lors des déploiements

### ✅ Solution

Mettre en place une stratégie de tests complète.

---

## 2. 🧪 Configuration des Tests

### Setup Jest + React Testing Library

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

**jest.config.js** :

```javascript
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

**jest.setup.js** :

```javascript
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return "";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
```

**package.json** :

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 3. 🧪 Tests Unitaires - Composants

### Exemple: UserAvatar

```typescript
// components/ui/UserAvatar.test.tsx
import { render, screen } from "@testing-library/react";
import { UserAvatar } from "./UserAvatar";

describe("UserAvatar", () => {
  it("affiche l'image de l'utilisateur", () => {
    const user = {
      name: "John Doe",
      email: "john@example.com",
      image: "https://example.com/avatar.jpg",
    };

    render(<UserAvatar user={user} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", user.image);
    expect(img).toHaveAttribute("alt", user.name);
  });

  it("affiche les initiales si pas d'image", () => {
    const user = {
      name: "John Doe",
      email: "john@example.com",
      image: null,
    };

    render(<UserAvatar user={user} />);

    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("affiche les initiales de l'email si pas de nom", () => {
    const user = {
      name: null,
      email: "john@example.com",
      image: null,
    };

    render(<UserAvatar user={user} />);

    expect(screen.getByText("JO")).toBeInTheDocument();
  });

  it("applique la taille correcte", () => {
    const user = {
      name: "John Doe",
      email: "john@example.com",
      image: null,
    };

    const { container } = render(<UserAvatar user={user} size="lg" />);

    const avatar = container.firstChild;
    expect(avatar).toHaveClass("h-12 w-12");
  });
});
```

---

## 4. 🧪 Tests Unitaires - Hooks

### Exemple: useAuth

```typescript
// hooks/useAuth.test.tsx
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

// Mock fetch
global.fetch = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne null si pas de session", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("retourne l'utilisateur si authentifié", async () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      type: "CANDIDAT",
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isCandidat).toBe(true);
  });
});
```

---

## 5. 🧪 Tests Unitaires - Services

### Exemple: AuthService

```typescript
// lib/services/auth.service.test.ts
import { AuthService } from "./auth.service";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    candidat: {
      create: jest.fn(),
    },
    account: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn(),
}));

describe("AuthService", () => {
  describe("signupCandidat", () => {
    it("crée un candidat avec succès", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        return fn(prisma);
      });
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const input = {
        email: "test@example.com",
        password: "Test123!",
        nom: "Test",
        prenom: "User",
        telephone: "0123456789",
        pays: "FR",
        dateNaissance: "1990-01-01",
        nationalite: "Française",
        situationFamiliale: "celibataire" as const,
        permisConduire: "oui" as const,
      };

      const result = await AuthService.signupCandidat(input);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: input.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(input.password, 12);
    });

    it("échoue si l'email existe déjà", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "1",
        email: "test@example.com",
      });

      const input = {
        email: "test@example.com",
        password: "Test123!",
        // ... autres champs
      };

      await expect(AuthService.signupCandidat(input)).rejects.toThrow(
        "Un compte existe déjà avec cet email"
      );
    });
  });
});
```

---

## 6. 🧪 Tests d'Intégration - API Routes

### Exemple: Route d'authentification

```typescript
// app/api/auth/signup/candidat/route.test.ts
import { POST } from "./route";
import { NextRequest } from "next/server";
import { AuthService } from "@/lib/services/auth.service";

// Mock AuthService
jest.mock("@/lib/services/auth.service");

describe("/api/auth/signup/candidat", () => {
  it("retourne 201 pour une inscription valide", async () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
    };

    (AuthService.signupCandidat as jest.Mock).mockResolvedValue(mockUser);

    const request = new NextRequest("http://localhost:3000/api/auth/signup/candidat", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "Test123!",
        nom: "Test",
        prenom: "User",
        // ... autres champs
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.userId).toBe("1");
  });

  it("retourne 400 pour des données invalides", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/signup/candidat", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid-email",
        password: "short",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Données invalides");
  });
});
```

---

## 7. 🧪 Tests E2E avec Playwright

### Configuration

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**playwright.config.ts** :

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Exemple: Flux d'inscription

```typescript
// e2e/signup.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Inscription Candidat", () => {
  test("permet de s'inscrire avec succès", async ({ page }) => {
    await page.goto("/auth/candidat/inscription");

    // Remplir le formulaire
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "Test123!");
    await page.fill('input[name="confirmPassword"]', "Test123!");
    await page.fill('input[name="nom"]', "Test");
    await page.fill('input[name="prenom"]', "User");
    await page.fill('input[name="telephone"]', "0123456789");
    await page.selectOption('select[name="pays"]', "FR");
    await page.fill('input[name="dateNaissance"]', "1990-01-01");
    await page.fill('input[name="nationalite"]', "Française");
    await page.selectOption('select[name="situationFamiliale"]', "celibataire");
    await page.selectOption('select[name="permisConduire"]', "oui");

    // Soumettre
    await page.click('button[type="submit"]');

    // Vérifier la redirection
    await expect(page).toHaveURL("/auth/candidat/connexion");

    // Vérifier le message de succès
    await expect(page.locator("text=Inscription réussie")).toBeVisible();
  });

  test("affiche des erreurs pour des données invalides", async ({ page }) => {
    await page.goto("/auth/candidat/inscription");

    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "short");

    await page.click('button[type="submit"]');

    // Vérifier les messages d'erreur
    await expect(page.locator("text=Email invalide")).toBeVisible();
    await expect(page.locator("text=Le mot de passe doit contenir au moins 8 caractères")).toBeVisible();
  });
});
```

---

## 8. 🧪 Tests de Performance

### Lighthouse CI

```bash
npm install --save-dev @lhci/cli
```

**.lighthouserc.json** :

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run start",
      "url": ["http://localhost:3000/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

---

## ✅ Checklist Tests

- [ ] Configuration Jest + RTL
- [ ] Tests unitaires composants (>70% coverage)
- [ ] Tests unitaires hooks
- [ ] Tests unitaires services
- [ ] Tests d'intégration API
- [ ] Tests E2E critiques (signup, login, etc.)
- [ ] Tests de performance (Lighthouse)
- [ ] CI/CD exécute les tests
- [ ] Coverage rapport configuré
- [ ] Tests dans la doc

## 📊 Stratégie de Tests Recommandée

**Pyramide des Tests** :

```
        /\      E2E (10%)
       /  \     - Flux critiques
      /____\    - Smoke tests
     /      \   
    /________\  Integration (20%)
   /          \ - API routes
  /____________\- Services avec DB
 /              \
/________________\ Unit (70%)
                  - Composants
                  - Hooks
                  - Utilitaires
                  - Services (mocked)
```

---

**💡 Règle d'or**: Écrire des tests qui donnent confiance, pas juste pour le coverage !


