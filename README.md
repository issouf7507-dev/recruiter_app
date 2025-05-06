# Recruter - Plateforme de Recrutement

Une plateforme moderne de recrutement construite avec Next.js, Prisma, et PostgreSQL, permettant aux recruteurs de gérer leurs offres d'emploi et aux candidats de postuler facilement.

## 🚀 Fonctionnalités Principales

### Pour les Recruteurs

- Gestion des offres d'emploi avec système de templates
- Tableau Kanban pour le suivi des candidatures
- Gestion des entreprises et des équipes
- Système d'invitation pour les membres de l'équipe
- Statistiques et suivi des vues des offres
- Personnalisation des offres avec des modèles réutilisables

### Pour les Candidats

- Profil détaillé avec CV et lettre de motivation
- Système de favoris pour les offres
- Suivi des candidatures
- Gestion des compétences et expériences
- Système de notation des candidatures

## 🛠️ Technologies Utilisées

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentification**: NextAuth.js
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Form Handling**: React Hook Form avec Zod
- **Drag & Drop**: @hello-pangea/dnd
- **Charts**: Recharts
- **Animations**: Framer Motion

## 📋 Prérequis

- Node.js (version recommandée: 18+)
- PostgreSQL
- npm ou yarn

## 🚀 Installation

1. Cloner le repository

```bash
git clone [URL_DU_REPO]
cd recruter
```

2. Installer les dépendances

```bash
npm install
# ou
yarn install
```

3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplir les variables nécessaires dans le fichier .env

4. Initialiser la base de données

```bash
npx prisma migrate dev
```

5. Lancer le serveur de développement

```bash
npm run dev
# ou
yarn dev
```

## 📁 Structure du Projet

```
recruter/
├── app/                 # Routes et pages Next.js
├── components/          # Composants React réutilisables
├── prisma/             # Schéma et migrations de la base de données
├── public/             # Fichiers statiques
├── store/              # État global (Zustand)
├── types/              # Types TypeScript
├── utils/              # Fonctions utilitaires
└── hooks/              # Hooks React personnalisés
```

## 🗺️ Sitemap du Projet

### Pages Publiques

- `/` - Page d'accueil
- `/auth/login` - Connexion
- `/auth/register` - Inscription
- `/auth/forgot-password` - Mot de passe oublié
- `/auth/reset-password` - Réinitialisation du mot de passe
- `/jobs` - Liste des offres d'emploi
- `/jobs/[id]` - Détails d'une offre d'emploi
- `/companies` - Liste des entreprises
- `/companies/[id]` - Profil d'une entreprise

### Espace Candidat

- `/candidate/dashboard` - Tableau de bord candidat
- `/candidate/profile` - Profil candidat
  - `/candidate/profile/personal` - Informations personnelles
  - `/candidate/profile/experience` - Expériences professionnelles
  - `/candidate/profile/education` - Formation
  - `/candidate/profile/skills` - Compétences
  - `/candidate/profile/documents` - Documents (CV, lettre de motivation)
- `/candidate/applications` - Mes candidatures
- `/candidate/favorites` - Offres favorites
- `/candidate/settings` - Paramètres du compte

### Espace Recruteur

- `/recruiter/dashboard` - Tableau de bord recruteur
- `/recruiter/profile` - Profil recruteur
- `/recruiter/company` - Gestion de l'entreprise
  - `/recruiter/company/profile` - Profil de l'entreprise
  - `/recruiter/company/team` - Gestion de l'équipe
  - `/recruiter/company/invitations` - Invitations d'équipe
- `/recruiter/jobs` - Gestion des offres
  - `/recruiter/jobs/create` - Création d'offre
  - `/recruiter/jobs/templates` - Templates d'offres
  - `/recruiter/jobs/[id]` - Détails d'une offre
  - `/recruiter/jobs/[id]/applications` - Candidatures reçues
  - `/recruiter/jobs/[id]/kanban` - Tableau Kanban
- `/recruiter/candidates` - Base de candidats
- `/recruiter/analytics` - Statistiques et rapports
- `/recruiter/settings` - Paramètres du compte

### Administration

- `/admin/dashboard` - Tableau de bord administrateur
- `/admin/users` - Gestion des utilisateurs
- `/admin/companies` - Gestion des entreprises
- `/admin/jobs` - Modération des offres
- `/admin/reports` - Rapports système
- `/admin/settings` - Configuration système

### API Routes

- `/api/auth/*` - Routes d'authentification
- `/api/jobs/*` - Gestion des offres
- `/api/candidates/*` - Gestion des candidats
- `/api/recruiters/*` - Gestion des recruteurs
- `/api/companies/*` - Gestion des entreprises
- `/api/applications/*` - Gestion des candidatures
- `/api/analytics/*` - Statistiques et métriques

### Composants Principaux

- `components/auth/*` - Composants d'authentification
- `components/jobs/*` - Composants liés aux offres
- `components/candidates/*` - Composants liés aux candidats
- `components/recruiters/*` - Composants liés aux recruteurs
- `components/companies/*` - Composants liés aux entreprises
- `components/kanban/*` - Composants du tableau Kanban
- `components/ui/*` - Composants d'interface utilisateur
- `components/forms/*` - Formulaires réutilisables
- `components/layout/*` - Composants de mise en page

### Utilitaires et Hooks

- `utils/auth.ts` - Fonctions d'authentification
- `utils/api.ts` - Fonctions d'API
- `utils/validation.ts` - Validation des données
- `hooks/useAuth.ts` - Hook d'authentification
- `hooks/useJobs.ts` - Hook de gestion des offres
- `hooks/useApplications.ts` - Hook de gestion des candidatures

## 🔄 Workflow de Recrutement

1. **Création d'Offre**

   - Utilisation de templates prédéfinis
   - Personnalisation des détails de l'offre
   - Publication et visibilité

2. **Gestion des Candidatures**

   - Tableau Kanban pour le suivi
   - Colonnes personnalisables
   - Système de notation et notes

3. **Suivi des Candidats**
   - Profils détaillés
   - Historique des candidatures
   - Système de favoris

## 🔒 Sécurité

- Authentification sécurisée avec NextAuth.js
- Gestion des rôles et permissions
- Protection des routes sensibles
- Validation des données avec Zod

## 📈 Fonctionnalités Avancées

- Système de templates d'offres réutilisables
- Gestion des équipes de recrutement
- Statistiques et métriques
- Système de notation des candidatures
- Gestion des compétences et expériences

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence [MIT](LICENSE).

## 👥 Support

Pour toute question ou support, veuillez ouvrir une issue dans le repository.
