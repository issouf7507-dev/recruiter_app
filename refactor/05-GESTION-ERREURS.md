# 🟠 05 - GESTION DES ERREURS

## ⚠️ Priorité: IMPORTANTE

Ces problèmes concernent la gestion des erreurs et des exceptions.

---

## 1. 🔧 Try/Catch Vides ou Génériques

### 📍 Localisation
**Multiples fichiers API et actions**

### ❌ Problème

```typescript
// ❌ Version 1: Catch vide
try {
  await someOperation();
} catch (error) {
  // Ne rien faire - DANGEREUX !
}

// ❌ Version 2: Trop générique
try {
  await someOperation();
} catch (error) {
  console.error(error);
  toast.error("Une erreur est survenue");
}
```

### ✅ Solution

```typescript
// ✅ GOOD: Gestion appropriée
try {
  await someOperation();
} catch (error) {
  // Logger avec contexte
  logger.error("Operation failed", {
    error,
    context: { userId, operation: "someOperation" },
  });
  
  // Typer l'erreur
  if (error instanceof ValidationError) {
    toast.error(`Données invalides: ${error.message}`);
  } else if (error instanceof NetworkError) {
    toast.error("Problème de connexion. Réessayez.");
  } else {
    toast.error("Une erreur inattendue est survenue");
  }
  
  // Re-throw si nécessaire
  throw error;
}
```

---

## 2. 🔧 Pas de Validation des Erreurs Prisma

### 📍 Localisation
**Routes API et services**

### ❌ Problème

```typescript
// ❌ Ne gère pas les erreurs spécifiques
try {
  await prisma.user.create({ data: {...} });
} catch (error) {
  return NextResponse.json(
    { error: "Erreur" },
    { status: 500 }
  );
}
```

### ✅ Solution

```typescript
import { Prisma } from "@prisma/client";

try {
  await prisma.user.create({ data: {...} });
} catch (error) {
  // ✅ Gérer les erreurs Prisma spécifiques
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        // Violation de contrainte unique
        const field = error.meta?.target;
        return NextResponse.json(
          { error: `Cette ${field} existe déjà` },
          { status: 409 }
        );
      
      case "P2025":
        // Record non trouvé
        return NextResponse.json(
          { error: "Ressource non trouvée" },
          { status: 404 }
        );
      
      case "P2003":
        // Violation de clé étrangère
        return NextResponse.json(
          { error: "Référence invalide" },
          { status: 400 }
        );
      
      default:
        logger.error("Prisma error", { code: error.code, meta: error.meta });
        return NextResponse.json(
          { error: "Erreur de base de données" },
          { status: 500 }
        );
    }
  }
  
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { error: "Données invalides" },
      { status: 400 }
    );
  }
  
  throw error;
}
```

---

## 3. 🔧 Pas de Gestion des Timeout

### 📍 Localisation
**Requêtes externes (API, base de données)**

### ❌ Problème

```typescript
// ❌ Peut bloquer indéfiniment
const response = await fetch("https://external-api.com/data");
```

### ✅ Solution

```typescript
// ✅ Avec timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 10000
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

// Utilisation
try {
  const response = await fetchWithTimeout(
    "https://external-api.com/data",
    {},
    5000 // 5 secondes
  );
} catch (error) {
  logger.error("API call failed", error);
  toast.error("Le service est temporairement indisponible");
}
```

---

## 4. 🔧 Erreurs Non Typées

### 📍 Localisation
**Actions serveur et API**

### ❌ Problème

```typescript
// ❌ Type any
catch (error: any) {
  return { error: error.message };
}
```

### ✅ Solution

```typescript
// ✅ Type guard
function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

// Utilisation
catch (error: unknown) {
  if (isErrorWithMessage(error)) {
    return { error: error.message };
  }
  
  if (error instanceof Error) {
    return { error: error.message };
  }
  
  return { error: "Une erreur inconnue est survenue" };
}
```

---

## 5. 🔧 Pas de Retry Logic

### 📍 Localisation
**Appels API externes**

### ❌ Problème

```typescript
// ❌ Échoue au premier essai
const data = await fetch("/api/external");
```

### ✅ Solution

```typescript
// ✅ Avec retry
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options = {
    retries: 3,
    delay: 1000,
    backoff: 2,
  }
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < options.retries - 1) {
        const delay = options.delay * Math.pow(options.backoff, i);
        logger.warn(`Retry ${i + 1}/${options.retries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Utilisation
try {
  const data = await fetchWithRetry(
    () => fetch("/api/external").then(res => res.json()),
    { retries: 3, delay: 1000, backoff: 2 }
  );
} catch (error) {
  logger.error("All retries failed", error);
}
```

---

## 6. 🔧 Erreurs de Validation Non Structurées

### 📍 Localisation
**Formulaires et API**

### ❌ Problème

```typescript
// ❌ Message simple
if (!email) {
  throw new Error("Email requis");
}
```

### ✅ Solution

```typescript
// ✅ Erreur structurée avec Zod
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
});

try {
  const validated = schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Erreurs structurées
    const errors = error.errors.map(err => ({
      field: err.path.join("."),
      message: err.message,
    }));
    
    return NextResponse.json(
      { 
        error: "Validation failed",
        details: errors 
      },
      { status: 400 }
    );
  }
}
```

---

## 7. 🔧 Pas de Circuit Breaker

### 📍 Localisation
**Services externes**

### ❌ Problème

Continuer à appeler un service qui échoue.

### ✅ Solution

```typescript
// lib/circuit-breaker.ts
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime?: number;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  
  constructor(
    private threshold = 5,
    private timeout = 60000 // 1 minute
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime! > this.timeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = "OPEN";
    }
  }
}

// Utilisation
const breaker = new CircuitBreaker();

async function callExternalAPI() {
  try {
    return await breaker.execute(() => 
      fetch("/api/external").then(res => res.json())
    );
  } catch (error) {
    if (error.message === "Circuit breaker is OPEN") {
      return cachedData; // Fallback
    }
    throw error;
  }
}
```

---

## 8. 🔧 Pas de Logging Structuré

### 📍 Localisation
**Tous les fichiers**

### ❌ Problème

```typescript
console.error("Error:", error);
```

### ✅ Solution

```typescript
// lib/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Utilisation
logger.error("Operation failed", {
  error,
  userId,
  operation: "signup",
  timestamp: new Date().toISOString(),
});
```

---

## ✅ Checklist Gestion d'Erreurs

- [ ] Tous les try/catch gèrent les erreurs appropriées
- [ ] Erreurs Prisma typées et gérées
- [ ] Timeout sur les requêtes externes
- [ ] Erreurs typées (pas any)
- [ ] Retry logic pour les opérations critiques
- [ ] Erreurs de validation structurées
- [ ] Circuit breaker pour services externes
- [ ] Logging structuré
- [ ] Messages d'erreur clairs pour l'utilisateur
- [ ] Monitoring des erreurs (Sentry)

---

**💡 Règle**: Toujours supposer que tout peut échouer et gérer élégamment.


