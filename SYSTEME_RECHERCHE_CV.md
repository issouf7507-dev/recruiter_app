# 🎯 Système de Recherche de CV Avancé

## 📋 Vue d'ensemble

Ce système de recherche de CV offre une expérience utilisateur moderne et des fonctionnalités avancées pour les recruteurs. Il combine recherche intelligente, filtres avancés, scoring automatique et analytics pour optimiser le processus de recrutement.

## 🏗️ Architecture

### 1. **API Backend (`/api/recruteur/candidats-search/route.ts`)**

- **Recherche textuelle avancée** : Recherche dans nom, email, bio, compétences, expériences
- **Filtres géographiques** : Ville, pays, adresse
- **Filtres par compétences** : Recherche multi-compétences avec correspondance intelligente
- **Filtres temporels** : Expérience, disponibilité, date de candidature
- **Pagination et tri** : Tri dynamique par score, expérience, date
- **Scoring automatique** : Algorithme de matching basé sur les critères

### 2. **Service de Recherche (`/app/services/candidat-search.service.ts`)**

- **Logique métier centralisée** : Gestion des requêtes complexes
- **Algorithme de scoring** : Calcul du score de matching (0-100%)
- **Recherche de candidats similaires** : Suggestions basées sur les profils
- **Statistiques avancées** : Analytics et insights

### 3. **Interface Utilisateur (`/app/(dashr)/(routes)/dashboard-recruteurs/recherche-cv/page.tsx`)**

- **Recherche intelligente** : Suggestions en temps réel
- **Filtres avancés** : Interface par onglets (Basique, Compétences, Expérience, Avancé)
- **Affichage flexible** : Mode grille et liste
- **Profil détaillé** : Modal avec informations complètes
- **Pagination** : Navigation fluide dans les résultats

## 🚀 Fonctionnalités Principales

### 🔍 **Recherche Intelligente**

```typescript
// Recherche multi-critères
const searchFilters = {
  search: "React Developer",
  competences: ["JavaScript", "React", "Node.js"],
  experience: "3",
  localisation: "Paris",
  diplome: "Master",
  sortBy: "matchScore",
  sortOrder: "desc",
};
```

### 📊 **Système de Scoring**

Le score de matching (0-100%) est calculé selon :

- **Compétences** (40 points max) : Correspondance exacte et partielle
- **Expérience** (25 points max) : Années d'expérience requises
- **Localisation** (20 points max) : Proximité géographique
- **Formation** (15 points max) : Niveau de diplôme

### 🎛️ **Filtres Avancés**

- **Basique** : Offre, expérience, localisation, diplôme
- **Compétences** : Techniques et soft skills
- **Expérience** : Niveau, type de contrat
- **Avancé** : Rayon de recherche, disponibilité

### 📈 **Analytics et Insights**

- Statistiques en temps réel
- Compétences populaires
- Localisations actives
- Tendances du marché
- Recommandations personnalisées

## 🛠️ Composants UI

### 1. **SearchSuggestions** (`/app/components/search/SearchSuggestions.tsx`)

```typescript
<SearchSuggestions
  onSuggestionSelect={(suggestion) => handleSearch(suggestion)}
  onSearch={(query) => performSearch(query)}
  placeholder="Rechercher des candidats..."
/>
```

**Fonctionnalités :**

- Suggestions en temps réel
- Recherches récentes (localStorage)
- Tendances populaires
- Autocomplétion intelligente

### 2. **SearchStats** (`/app/components/search/SearchStats.tsx`)

```typescript
<SearchStats
  totalCandidats={total}
  candidatsParMois={monthly}
  competencesPopulaires={skills}
  localisationsPopulaires={locations}
  topCandidats={topCandidates}
/>
```

**Fonctionnalités :**

- Dashboard de statistiques
- Graphiques de tendances
- Insights et recommandations
- Top candidats par score

## 📊 Algorithme de Scoring

### Formule de Calcul

```typescript
function calculateMatchScore(candidat, filters) {
  let score = 0;

  // Compétences (40 points)
  const matchingSkills = candidat.competences.filter((comp) =>
    filters.competences.includes(comp)
  );
  score += (matchingSkills.length / filters.competences.length) * 40;

  // Expérience (25 points)
  if (candidat.experience >= filters.experience) {
    score += 25;
  } else if (candidat.experience >= filters.experience * 0.7) {
    score += 15;
  }

  // Localisation (20 points)
  if (candidat.localisation.includes(filters.localisation)) {
    score += 20;
  }

  // Formation (15 points)
  if (candidat.diplome.includes(filters.diplome)) {
    score += 15;
  }

  return Math.round(score);
}
```

### Interprétation des Scores

- **80-100%** : Excellent match (vert)
- **60-79%** : Bon match (jaune)
- **40-59%** : Match moyen (orange)
- **0-39%** : Match faible (rouge)

## 🔧 Configuration et Personnalisation

### Variables d'Environnement

```env
# Base de données
DATABASE_URL="mysql://..."

# JWT
JWT_SECRET="your-secret-key"

# API Keys (optionnel)
OPENAI_API_KEY="..." # Pour IA avancée
```

### Personnalisation des Filtres

```typescript
// Ajouter de nouveaux filtres
const customFilters = {
  ...baseFilters,
  secteur: "tech",
  niveauExperience: "senior",
  certifications: ["AWS", "Azure"],
  langues: ["Français", "Anglais"],
};
```

## 📱 Expérience Utilisateur

### Workflow Typique

1. **Recherche initiale** : Saisie de critères de base
2. **Affinement** : Utilisation des filtres avancés
3. **Analyse** : Consultation des scores de matching
4. **Exploration** : Visualisation des profils détaillés
5. **Action** : Téléchargement de CV et contact

### Optimisations UX

- **Recherche instantanée** : Résultats en temps réel
- **Filtres persistants** : Sauvegarde des préférences
- **Navigation fluide** : Pagination et tri intuitifs
- **Responsive design** : Adaptation mobile/desktop

## 🔮 Évolutions Futures

### Fonctionnalités Avancées

- **IA et ML** : Suggestions intelligentes basées sur l'historique
- **Matching prédictif** : Anticipation des besoins
- **Intégration LinkedIn** : Import automatique de profils
- **Analytics avancés** : Graphiques interactifs
- **Notifications** : Alertes pour nouveaux candidats

### Intégrations

- **ATS** : Synchronisation avec les systèmes de recrutement
- **Calendrier** : Planification d'entretiens
- **Email** : Campagnes de recrutement automatisées
- **CRM** : Suivi des candidatures

## 🧪 Tests et Qualité

### Tests Recommandés

```typescript
// Tests unitaires
describe("CandidatSearchService", () => {
  test("should calculate correct match score", () => {
    const score = calculateMatchScore(mockCandidat, mockFilters);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// Tests d'intégration
describe("Search API", () => {
  test("should return paginated results", async () => {
    const response = await searchCandidats(filters);
    expect(response.pagination).toBeDefined();
    expect(response.data).toHaveLength(20);
  });
});
```

## 📚 Ressources et Documentation

### Liens Utiles

- [Documentation Prisma](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

### Support et Maintenance

- **Monitoring** : Logs et métriques de performance
- **Backup** : Sauvegarde automatique des données
- **Sécurité** : Validation et sanitisation des entrées
- **Performance** : Optimisation des requêtes et cache

---

## 🎯 Conclusion

Ce système de recherche de CV offre une solution complète et moderne pour optimiser le processus de recrutement. Il combine puissance technique et simplicité d'utilisation pour offrir une expérience exceptionnelle aux recruteurs.

**Points forts :**

- ✅ Recherche intelligente et rapide
- ✅ Filtres avancés et flexibles
- ✅ Scoring automatique précis
- ✅ Interface utilisateur moderne
- ✅ Analytics et insights
- ✅ Architecture scalable
- ✅ Code maintenable et documenté

Le système est conçu pour évoluer avec les besoins et intégrer de nouvelles fonctionnalités avancées comme l'IA et le machine learning.
