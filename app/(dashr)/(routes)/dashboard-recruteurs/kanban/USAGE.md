# Guide d'utilisation du Kanban Custom

## Fonctionnalités implementées

### ✅ Gestion des colonnes

- **Création automatique de colonnes par défaut** : 3 colonnes sont créées automatiquement (Nouveau, En cours, Finalisé)
- **Ajout de nouvelles colonnes** : Bouton "Nouvelle colonne" avec choix de nom et couleur
- **Suppression de colonnes** : Menu déroulant sur chaque colonne
- **Drag & Drop des colonnes** : Réorganisation par glisser-déposer

### ✅ Gestion des offres d'emploi (Applications)

- **Création d'offres** : Formulaire complet avec titre, description, salaire, etc.
- **Affichage des offres** : Cards avec informations essentielles
- **Drag & Drop des offres** : Déplacement entre colonnes
- **Détails des offres** : Modal détaillé avec toutes les informations

### ✅ Gestion des candidatures

- **Ajout manuel de candidats** : Formulaire pour ajouter des candidats
- **Affichage des candidats** : Dans chaque offre
- **Upload de CV** : Fonctionnalité d'upload de fichiers

### ✅ Système de notes et discussion

- **Ajout de notes** : Système de chat intégré
- **Affichage chronologique** : Messages triés par date
- **Édition de notes** : Possibilité de modifier ses propres messages

### ✅ Checklist de suivi

- **Ajout d'éléments** : Créer des tâches de suivi
- **Marquage comme terminé** : Cocher/décocher les tâches
- **Modification** : Éditer le titre des tâches
- **Suppression** : Supprimer des éléments
- **Progression** : Barre de progression visuelle

### ✅ Gestion des fichiers

- **Upload de fichiers** : Ajout de pièces jointes
- **Téléchargement** : Accès aux fichiers uploadés
- **Suppression** : Gestion des fichiers
- **Types supportés** : PDF, DOC, images, etc.

### ✅ Interface utilisateur

- **Mode sombre/clair** : Support du thème
- **Responsive** : Interface adaptative
- **Loading states** : Indicateurs de chargement
- **Messages d'erreur** : Gestion des erreurs

## Structure technique

### Routes API créées

- `GET/POST /api/recruteur/kanban/custom` - Gestion des colonnes
- `DELETE /api/recruteur/kanban/custom/columns/[columnId]` - Suppression colonnes
- `PUT /api/recruteur/kanban/custom/columns/reorder` - **NOUVEAU** Réorganisation colonnes (drag & drop)
- `POST /api/recruteur/kanban/custom/applications` - Création offres
- `PUT /api/recruteur/kanban/custom/applications` - Déplacement offres
- `GET/PUT /api/recruteur/kanban/custom/applications/[applicationId]` - Détails offres
- `POST /api/recruteur/kanban/custom/applications/[applicationId]/notes` - Notes
- `POST/GET /api/recruteur/kanban/custom/applications/[applicationId]/checklist` - Checklist
- `PUT/DELETE /api/recruteur/kanban/custom/applications/[applicationId]/checklist/[itemId]` - Items checklist
- `POST /api/recruteur/kanban/custom/applications/[applicationId]/files` - Fichiers
- `DELETE /api/recruteur/kanban/custom/applications/[applicationId]/files/[fileId]` - Suppression fichiers
- `POST /api/recruteur/kanban/custom/candidates` - Ajout candidats
- `POST /api/recruteur/kanban/custom/init` - Initialisation par défaut

### Modèles Prisma utilisés

- `KanbanColumnCustom` - Colonnes du kanban
- `ApplicationCustom` - Offres d'emploi
- `CandidatCustom` - Candidats
- `ApplicationNoteCustom` - Notes/discussions
- `ChecklistItemCustom` - Éléments de checklist
- `ApplicationFileCustom` - Fichiers joints
- `CollaborateurCustom` - Collaborateurs
- `ApplicationCollaborateurCustom` - Assignations

### Technologies utilisées

- **React Query (@tanstack/react-query)** : Gestion des données et cache
- **React Hook Form** : Gestion des formulaires
- **@hello-pangea/dnd** : Drag & Drop
- **Prisma** : ORM pour la base de données
- **TypeScript** : Typage strict
- **Tailwind CSS** : Styles
- **Radix UI** : Composants UI

## Comment utiliser

### Démarrage

1. La page se charge automatiquement avec les colonnes par défaut
2. Créez votre première offre avec le bouton "Nouvelle offre"
3. Organisez vos offres par drag & drop

### Gestion des candidatures

1. Cliquez sur une offre pour ouvrir le modal détaillé
2. Utilisez l'onglet "Ajouter candidat" pour créer des candidatures
3. Suivez le processus avec la checklist
4. Communiquez via le système de discussion

### Collaboration

1. Ajoutez des notes pour communiquer avec l'équipe
2. Utilisez la checklist pour le suivi du processus
3. Joignez des fichiers pertinents

## Améliorations futures possibles

### 🔄 En cours de développement

- **Vérification des permissions** : S'assurer que seul le bon recruteur accède à ses données
- **Notifications temps réel** : WebSocket pour les mises à jour en direct
- **Rapports et analytics** : Statistiques sur les recrutements

### 💡 Idées d'amélioration

- **Templates de checklist** : Modèles prédéfinis
- **Filtres avancés** : Recherche et tri des offres
- **Automatisation** : Règles automatiques de déplacement
- **Intégrations** : LinkedIn, job boards
- **Mobile app** : Application mobile native

## Dépannage

### Problèmes courants

1. **Page ne charge pas** : Vérifier la connexion utilisateur
2. **Erreurs API** : Vérifier les logs serveur
3. **Drag & Drop ne fonctionne pas** : Actualiser la page
4. **Upload de fichiers échoue** : Vérifier la taille et le format

### Logs utiles

- Console navigateur pour les erreurs frontend
- Logs serveur Next.js pour les erreurs API
- Base de données pour les problèmes de données
