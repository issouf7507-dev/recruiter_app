# Guide d'intégration des plateformes de diffusion d'offres

Ce guide explique comment intégrer les APIs des principales plateformes de diffusion d'offres d'emploi.

## 📋 Plateformes supportées

### 1. LinkedIn Jobs API

**Documentation officielle :** https://developer.linkedin.com/docs/jobs-api

**Étapes d'intégration :**

1. Créer une application LinkedIn Developer
2. Obtenir les clés API (Client ID et Client Secret)
3. Demander l'accès à l'API Jobs
4. Implémenter l'authentification OAuth 2.0

**Exemple d'utilisation :**

```javascript
// Publier une offre sur LinkedIn
const linkedinJob = {
  title: offre.title,
  company: offre.company,
  location: offre.location,
  description: offre.description,
  requirements: offre.requirements,
  salary: {
    min: offre.salaryMin,
    max: offre.salaryMax,
    currency: offre.salaryCurrency,
  },
};

const response = await fetch("https://api.linkedin.com/v2/jobs", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(linkedinJob),
});
```

### 2. Indeed API

**Documentation officielle :** https://developer.indeed.com/

**Étapes d'intégration :**

1. Créer un compte Indeed Publisher
2. Obtenir le Publisher ID
3. Générer les clés API
4. Implémenter l'authentification

**Exemple d'utilisation :**

```javascript
// Publier une offre sur Indeed
const indeedJob = {
  job_title: offre.title,
  company: offre.company,
  location: offre.location,
  description: offre.description,
  salary_min: offre.salaryMin,
  salary_max: offre.salaryMax,
  salary_currency: offre.salaryCurrency,
};

const response = await fetch("https://api.indeed.com/v2/jobs", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(indeedJob),
});
```

### 3. APEC API

**Documentation officielle :** https://www.apec.fr/emploi/recrutement/recruter-avec-apec.html

**Étapes d'intégration :**

1. Créer un compte recruteur APEC
2. Demander l'accès à l'API
3. Obtenir les identifiants d'authentification

### 4. Pôle Emploi API

**Documentation officielle :** https://pole-emploi.io/

**Étapes d'intégration :**

1. Créer un compte sur pole-emploi.io
2. Demander l'accès à l'API Offres d'emploi
3. Obtenir le SIRET et les clés API

## 🔧 Configuration dans l'application

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback

# Indeed
INDEED_PUBLISHER_ID=your_indeed_publisher_id
INDEED_API_KEY=your_indeed_api_key

# APEC
APEC_ACCOUNT_ID=your_apec_account_id
APEC_API_KEY=your_apec_api_key

# Pôle Emploi
POLE_EMPLOI_SIRET=your_siret_number
POLE_EMPLOI_API_KEY=your_pole_emploi_api_key
```

### Modèle de données pour l'historique

Ajoutez ce modèle à votre schéma Prisma :

```prisma
model DiffusionHistory {
  id          String   @id @default(cuid())
  jobOffer    JobOffer @relation(fields: [jobOfferId], references: [id])
  jobOfferId  Int
  recruteur   Recruteur @relation(fields: [recruteurId], references: [id])
  recruteurId String
  platforms   String[] // ["linkedin", "indeed", "apec"]
  settings    Json     // Paramètres de diffusion
  results     Json     // Résultats de chaque plateforme
  status      DiffusionStatus
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum DiffusionStatus {
  SUCCESS
  PARTIAL
  FAILED
}
```

## 🚀 Implémentation

### 1. Service de diffusion

Créez un service pour gérer les diffusions :

```typescript
// services/diffusion.service.ts
export class DiffusionService {
  async publishToLinkedIn(offre: JobOffer, settings: any) {
    // Implémentation LinkedIn
  }

  async publishToIndeed(offre: JobOffer, settings: any) {
    // Implémentation Indeed
  }

  async publishToApec(offre: JobOffer, settings: any) {
    // Implémentation APEC
  }

  async publishToPoleEmploi(offre: JobOffer, settings: any) {
    // Implémentation Pôle Emploi
  }
}
```

### 2. Gestion des erreurs

```typescript
// Gestion des erreurs de diffusion
try {
  const result = await diffusionService.publishToLinkedIn(offre, settings);
  return { success: true, url: result.url };
} catch (error) {
  console.error("Erreur LinkedIn:", error);
  return {
    success: false,
    error: error.message,
    retryable: error.status === 429, // Rate limit
  };
}
```

### 3. Rate limiting

Implémentez un système de rate limiting pour respecter les limites des APIs :

```typescript
// utils/rate-limiter.ts
export class RateLimiter {
  private limits = {
    linkedin: { requests: 100, window: 3600000 }, // 100 req/h
    indeed: { requests: 50, window: 3600000 }, // 50 req/h
    apec: { requests: 200, window: 3600000 }, // 200 req/h
    poleEmploi: { requests: 1000, window: 3600000 }, // 1000 req/h
  };

  async checkLimit(platform: string): Promise<boolean> {
    // Vérifier les limites
  }
}
```

## 📊 Monitoring et analytics

### Métriques à suivre

1. **Taux de succès** par plateforme
2. **Temps de réponse** des APIs
3. **Nombre de vues** générées
4. **Candidatures** provenant de chaque plateforme
5. **Coût par candidature** par plateforme

### Dashboard de monitoring

Créez un dashboard pour surveiller les performances :

```typescript
// pages/dashboard/monitoring.tsx
export default function MonitoringPage() {
  return (
    <div>
      <h1>Monitoring des diffusions</h1>
      {/* Graphiques et métriques */}
    </div>
  );
}
```

## 🔒 Sécurité

### Bonnes pratiques

1. **Stockage sécurisé** des clés API
2. **Rotation régulière** des tokens
3. **Logs d'audit** pour toutes les actions
4. **Validation** des données avant envoi
5. **Gestion des erreurs** sensibles

### Exemple de validation

```typescript
// validation/offre.validation.ts
export const validateOffreForDiffusion = (offre: JobOffer) => {
  const errors = [];

  if (!offre.title || offre.title.length < 5) {
    errors.push("Le titre doit contenir au moins 5 caractères");
  }

  if (!offre.description || offre.description.length < 50) {
    errors.push("La description doit contenir au moins 50 caractères");
  }

  if (!offre.location) {
    errors.push("La localisation est requise");
  }

  return errors;
};
```

## 🧪 Tests

### Tests unitaires

```typescript
// tests/diffusion.test.ts
describe("DiffusionService", () => {
  it("should publish to LinkedIn successfully", async () => {
    const service = new DiffusionService();
    const result = await service.publishToLinkedIn(mockOffre, mockSettings);
    expect(result.success).toBe(true);
  });
});
```

### Tests d'intégration

```typescript
// tests/integration/diffusion.test.ts
describe("Diffusion Integration", () => {
  it("should handle API rate limits", async () => {
    // Test de gestion des limites
  });
});
```

## 📈 Optimisation

### Stratégies d'amélioration

1. **Diffusion programmée** aux heures de pointe
2. **A/B testing** des descriptions d'offres
3. **Personnalisation** par plateforme
4. **Retargeting** des candidats
5. **Analytics avancées** pour optimiser les performances

### Exemple d'optimisation

```typescript
// services/optimization.service.ts
export class OptimizationService {
  async optimizeForPlatform(offre: JobOffer, platform: string) {
    const optimizations = {
      linkedin: {
        // Optimisations spécifiques LinkedIn
        maxTitleLength: 100,
        keywords: ["tech", "innovation", "growth"],
        hashtags: ["#emploi", "#tech", "#innovation"],
      },
      indeed: {
        // Optimisations spécifiques Indeed
        maxTitleLength: 80,
        keywords: ["CDI", "CDD", "freelance"],
        locationFormat: "Ville, Département",
      },
    };

    return this.applyOptimizations(offre, optimizations[platform]);
  }
}
```

## 🆘 Support et dépannage

### Problèmes courants

1. **Rate limiting** : Implémenter une file d'attente
2. **Authentification expirée** : Renouvellement automatique des tokens
3. **Format de données** : Validation stricte avant envoi
4. **Erreurs réseau** : Retry automatique avec backoff exponentiel

### Contacts support

- **LinkedIn** : https://developer.linkedin.com/support
- **Indeed** : https://developer.indeed.com/support
- **APEC** : https://www.apec.fr/contact.html
- **Pôle Emploi** : https://pole-emploi.io/contact

---

Ce guide sera mis à jour régulièrement avec les nouvelles fonctionnalités et améliorations des APIs.
