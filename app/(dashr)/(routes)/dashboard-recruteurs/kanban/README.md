# Système Kanban pour Gestion des Offres d'Emploi

## 🎯 Vue d'ensemble

Ce système Kanban est complètement **autonome** et indépendant des offres créées via le formulaire classique (`/creer/page.tsx`). Il permet de :

1. **Créer ses propres colonnes** personnalisées
2. **Créer des offres directement dans le Kanban**
3. **Gérer les candidats** pour chaque offre
4. **Organiser son processus de recrutement** de manière visuelle

## 🏗️ Architecture

### Types principaux

```typescript
// Colonne du Kanban
type OfferColumn = {
  id: string;
  name: string;
  color: string;
  order: number;
};

// Candidat associé à une offre
type KanbanCandidate = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  cv?: string;
  lettreMotivation?: string;
  competences: string[];
  notes?: string;
  createdAt: string;
};

// Offre d'emploi dans le Kanban
type JobOfferCard = {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: string;
  competences: string[];
  columnId: string;
  createdAt: string;
  candidates: KanbanCandidate[];
};
```

## 🔧 Fonctionnalités

### 1. Gestion des Colonnes

- **Créer des colonnes** avec nom et couleur personnalisés
- **Réorganiser les colonnes** par drag & drop
- **Supprimer des colonnes** (les offres sont déplacées vers la première colonne)

### 2. Gestion des Offres

- **Créer des offres** directement dans le Kanban
- **Déplacer les offres** entre colonnes par drag & drop
- **Visualiser les détails** de chaque offre
- **Compter les candidats** associés à chaque offre

### 3. Gestion des Candidats

- **Ajouter des candidats** manuellement à chaque offre
- **Visualiser la liste des candidats** par offre
- **Voir les détails** de chaque candidat
- **Gestion des compétences** et notes

## 📁 Structure des Fichiers

```
app/(dashr)/(routes)/dashboard-recruteurs/offres/
├── page.tsx                                    # Page principale du Kanban
├── components/
│   ├── SimpleCandidatesKanban.tsx             # Vue des candidats pour une offre
│   └── [autres composants existants...]       # Anciens composants (non utilisés)
└── README.md                                  # Cette documentation
```

## 💾 Stockage des Données

Le système utilise le **localStorage** pour la persistance :

```typescript
// Clés de stockage par utilisateur
`kanban_columns_${user.id}` // Colonnes du Kanban
`kanban_offers_${user.id}`; // Offres avec leurs candidats
```

## 🚀 Utilisation

### Première utilisation

1. **Créer des colonnes** : Ex. "À traiter", "En cours", "Entretien", "Validé", "Refusé"
2. **Ajouter des offres** dans les colonnes
3. **Gérer les candidats** pour chaque offre

### Workflow typique

1. Créer une offre dans "À traiter"
2. Ajouter des candidats à l'offre
3. Déplacer l'offre dans les différentes colonnes selon l'avancement
4. Suivre le processus de recrutement visuellement

## 🎨 Personnalisation

### Couleurs disponibles pour les colonnes

- Bleu (`bg-blue-300/30`)
- Vert (`bg-green-300/30`)
- Rose (`bg-pink-300/30`)
- Jaune (`bg-yellow-300/30`)
- Violet (`bg-purple-300/30`)
- Rouge (`bg-red-300/30`)
- Gris (`bg-gray-300/30`)

## 🔄 Indépendance du Système

⚠️ **Important** : Ce système Kanban est **complètement séparé** des offres créées via :

- `/mesoffres/creer/page.tsx`
- Base de données Prisma
- API routes existantes

Il fonctionne de manière autonome avec ses propres données stockées localement.

## 🎯 Avantages

1. **Flexibilité totale** : Créez vos propres processus
2. **Rapidité** : Pas de latence réseau, tout est local
3. **Simplicité** : Interface intuitive et responsive
4. **Personnalisation** : Colonnes et workflow sur mesure
5. **Autonomie** : Indépendant des autres systèmes

## 🚀 Évolutions Possibles

- Sauvegarde en base de données (optionnelle)
- Import/Export des données
- Templates de colonnes pré-définis
- Intégration avec l'upload de fichiers pour les CV
- Notifications et rappels
- Statistiques et rapports
