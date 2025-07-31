# Recherche de Candidats

## Vue d'ensemble

La fonctionnalité de recherche de candidats permet aux recruteurs de trouver des talents selon différents critères, principalement basés sur les compétences. Cette fonctionnalité offre une interface moderne et intuitive pour filtrer et découvrir les meilleurs candidats.

## Fonctionnalités principales

### 🔍 Recherche par compétences

- Sélection multiple de compétences
- Calcul automatique du pourcentage de correspondance
- Mise en évidence des compétences recherchées
- Suggestions de compétences populaires

### 📍 Filtres géographiques

- Recherche par ville (recherche textuelle)
- Filtrage par pays (sélection dans une liste)
- Affichage de la localisation des candidats

### 📊 Statistiques et suggestions

- Statistiques des compétences les plus recherchées
- Combinaisons populaires de compétences
- Suggestions intelligentes basées sur les tendances

### 👤 Profils détaillés

- Modal avec informations complètes du candidat
- Affichage des expériences et formations
- Accès aux documents (CV, lettre de motivation)
- Actions de contact (email, téléphone)

## Architecture technique

### API Endpoint

```
GET /api/recruteur/search-candidats
```

#### Paramètres de requête

- `competences`: Liste des compétences séparées par des virgules
- `ville`: Ville de recherche (recherche partielle)
- `pays`: Code pays (ex: "CI", "FR")
- `page`: Numéro de page pour la pagination
- `limit`: Nombre d'éléments par page

#### Réponse

```json
{
  "success": true,
  "candidats": [
    {
      "id": "string",
      "nom": "string",
      "prenom": "string",
      "telephone": "string",
      "ville": "string",
      "pays": "string",
      "bio": "string",
      "image": "string",
      "user": {
        "email": "string",
        "image": "string"
      },
      "candidatCompetences": [
        {
          "competence": "string"
        }
      ],
      "experiences": [...],
      "formations": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "stats": [
    {
      "competence": "string",
      "_count": {
        "competence": 25
      }
    }
  ]
}
```

### Composants principaux

#### 1. Page de recherche (`page.tsx`)

- Interface principale de recherche
- Gestion des filtres et de la pagination
- Affichage des résultats

#### 2. Modal de détails (`CandidatDetailsModal.tsx`)

- Affichage complet du profil candidat
- Informations de contact
- Expériences et formations
- Actions de contact

#### 3. Suggestions de recherche (`SearchSuggestions.tsx`)

- Compétences populaires
- Combinaisons suggérées
- Statistiques de recherche

## Base de données

### Tables utilisées

- `Candidat`: Informations principales du candidat
- `CandidatCompetence`: Compétences associées aux candidats
- `Experience`: Expériences professionnelles
- `Formation`: Formations et diplômes
- `User`: Informations utilisateur

### Requêtes principales

```sql
-- Recherche de candidats avec compétences
SELECT c.*, u.email, u.image
FROM Candidat c
JOIN User u ON c.userId = u.id
WHERE u.type = 'CANDIDAT'
AND EXISTS (
  SELECT 1 FROM CandidatCompetence cc
  WHERE cc.candidatId = c.id
  AND cc.competence IN ('javascript', 'react')
)
```

## Utilisation

### Pour les recruteurs

1. **Accéder à la recherche**

   - Naviguer vers "Recherche de candidats" dans le dashboard recruteur

2. **Sélectionner des critères**

   - Cliquer sur les compétences recherchées
   - Optionnellement, filtrer par ville et/ou pays
   - Utiliser les suggestions de combinaisons populaires

3. **Explorer les résultats**

   - Voir le pourcentage de correspondance pour chaque candidat
   - Cliquer sur "Voir le profil" pour plus de détails
   - Contacter directement les candidats

4. **Affiner la recherche**
   - Ajouter/supprimer des compétences
   - Modifier les filtres géographiques
   - Naviguer entre les pages de résultats

### Fonctionnalités avancées

- **Correspondance intelligente**: Calcul automatique du pourcentage de correspondance
- **Suggestions contextuelles**: Combinaisons de compétences populaires
- **Pagination optimisée**: Chargement rapide des résultats
- **Recherche en temps réel**: Mise à jour automatique lors de la modification des filtres

## Sécurité

- Authentification requise (token recruteur)
- Validation des paramètres de recherche
- Protection contre les injections SQL
- Limitation du nombre de résultats par page

## Performance

- Pagination côté serveur
- Indexation des compétences
- Requêtes optimisées avec Prisma
- Mise en cache des statistiques

## Évolutions futures

- [ ] Recherche par mots-clés dans la bio
- [ ] Filtrage par niveau d'expérience
- [ ] Sauvegarde des recherches favorites
- [ ] Notifications pour nouveaux candidats correspondants
- [ ] Export des résultats en PDF/Excel
- [ ] Intégration avec des outils de recrutement externes
