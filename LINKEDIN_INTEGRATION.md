# Intégration LinkedIn - Guide de Configuration

Ce guide explique comment configurer l'intégration LinkedIn pour la diffusion automatique des offres d'emploi.

## Prérequis

1. Un compte LinkedIn Developer
2. Une application LinkedIn créée
3. Les permissions appropriées configurées

## Configuration de l'Application LinkedIn

### 1. Créer une Application LinkedIn

1. Allez sur [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Cliquez sur "Create App"
3. Remplissez les informations requises :
   - Nom de l'application
   - URL du site web
   - Description

### 2. Configurer les Permissions

1. Dans votre application, allez dans l'onglet "Products"
2. Ajoutez le produit "Share on LinkedIn"
3. Cela vous donnera automatiquement la permission `w_member_social`

### 3. Configurer l'OAuth 2.0

1. Dans l'onglet "Auth", configurez :
   - **Redirect URLs** : `https://votre-domaine.com/auth/linkedin/callback`
   - **OAuth 2.0 scopes** : `w_member_social`

### 4. Récupérer les Credentials

1. Notez votre **Client ID** et **Client Secret**
2. Ces informations seront nécessaires pour la configuration

## Configuration de l'Environnement

Ajoutez les variables d'environnement suivantes dans votre fichier `.env.local` :

```env
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=votre_client_id
LINKEDIN_CLIENT_SECRET=votre_client_secret

# LinkedIn API Configuration (optionnel - pour les tests)
LINKEDIN_ACCESS_TOKEN=votre_access_token
LINKEDIN_PERSON_URN=urn:li:person:votre_person_id
```

## Utilisation de l'API LinkedIn

### Authentification OAuth 2.0

L'application utilise le flux OAuth 2.0 standard :

1. **Étape 1** : L'utilisateur clique sur "Se connecter à LinkedIn"
2. **Étape 2** : Redirection vers LinkedIn pour autorisation
3. **Étape 3** : LinkedIn redirige vers votre callback avec un code
4. **Étape 4** : Échange du code contre un access token
5. **Étape 5** : Récupération du profil utilisateur

### Publication de Contenu

L'application utilise l'API LinkedIn UGC Posts pour publier du contenu :

```typescript
// Exemple de payload pour un post texte
{
  "author": "urn:li:person:123456789",
  "lifecycleState": "PUBLISHED",
  "specificContent": {
    "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {
        "text": "Contenu du post..."
      },
      "shareMediaCategory": "NONE"
    }
  },
  "visibility": {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
  }
}
```

## Fonctionnalités Implémentées

### 1. Authentification Automatique

- Vérification du statut d'authentification
- Redirection automatique vers LinkedIn
- Gestion des erreurs d'authentification

### 2. Publication d'Offres

- Génération automatique du contenu LinkedIn
- Support des emojis et hashtags
- Personnalisation du message
- Choix de la visibilité (Public/Connexions)

### 3. Paramètres Configurables

- Inclusion/exclusion du salaire
- Message personnalisé
- Visibilité du post
- Programmation de publication

## Structure des API Routes

### `/api/auth/linkedin`

- `GET` : Génère l'URL d'autorisation LinkedIn
- `POST` : Échange le code contre un access token

### `/auth/linkedin/callback`

- `GET` : Gère le callback OAuth de LinkedIn

### `/api/recruteur/diffusion/linkedin`

- `POST` : Publie une offre sur LinkedIn

## Gestion des Erreurs

### Erreurs Courantes

1. **Configuration manquante** : Vérifiez vos variables d'environnement
2. **Permissions insuffisantes** : Assurez-vous d'avoir `w_member_social`
3. **Token expiré** : L'utilisateur doit se reconnecter
4. **Limites de taux** : Respectez les limites LinkedIn (150 posts/jour/utilisateur)

### Codes d'Erreur

- `400` : Configuration manquante ou paramètres invalides
- `401` : Non autorisé ou token expiré
- `429` : Limite de taux dépassée
- `500` : Erreur interne du serveur

## Sécurité

### Bonnes Pratiques

1. **Stockage sécurisé** : Ne stockez jamais les tokens en clair
2. **Validation** : Validez toujours les paramètres d'entrée
3. **HTTPS** : Utilisez toujours HTTPS en production
4. **Scopes minimaux** : Demandez seulement les permissions nécessaires

### Variables d'Environnement

```env
# Production
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
LINKEDIN_CLIENT_ID=votre_client_id
LINKEDIN_CLIENT_SECRET=votre_client_secret

# Développement
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Tests

### Test de l'Authentification

1. Lancez l'application en mode développement
2. Allez sur la page de diffusion des offres
3. Cliquez sur LinkedIn pour vous connecter
4. Vérifiez que l'authentification fonctionne

### Test de la Publication

1. Créez une offre de test
2. Configurez les paramètres LinkedIn
3. Publiez l'offre
4. Vérifiez que le post apparaît sur LinkedIn

## Support

Pour toute question ou problème :

1. Vérifiez la [Documentation LinkedIn](https://developer.linkedin.com/docs)
2. Consultez les logs de l'application
3. Vérifiez la configuration de votre application LinkedIn

## Ressources

- [LinkedIn Developer Portal](https://developer.linkedin.com/)
- [Share on LinkedIn API](https://developer.linkedin.com/docs/share-on-linkedin)
- [OAuth 2.0 Guide](https://developer.linkedin.com/docs/oauth2)
- [UGC Posts API](https://developer.linkedin.com/docs/ugc-post-api)
